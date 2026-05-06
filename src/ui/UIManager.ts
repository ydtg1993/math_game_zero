import { Renderer } from './Renderer';
import { Equation } from '../core/types';
import { LevelStrategy } from '../levels/LevelStrategy';
import { OptionGenerator } from '../calculator/OptionGenerator';
import { EquationGenerator } from '../calculator/EquationGenerator';
import { AnimationController } from '../animation/AnimationController';
import { SoundManager } from '../audio/SoundManager';
import { ConfettiAnimator } from '../animation/ConfettiAnimator';
import { RewardSystem } from './RewardSystem';
import { CountingGenerator, CountingProblem } from '../calculator/CountingGenerator';
import { ScoreCalculator } from '../calculator/ScoreCalculator';
import { sleep } from '../utils/helpers';

export class UIManager {
    private renderer: Renderer;
    private sound: SoundManager;
    private animCtrl: AnimationController;
    private confetti: ConfettiAnimator;
    private rewardSystem: RewardSystem;
    private scoreCalc: ScoreCalculator;
    private eqGenerator?: EquationGenerator;
    private countingGen?: CountingGenerator;
    private currentStrategy?: LevelStrategy;

    private currentMode: 'quiz' | 'counting' | 'demo' = 'counting';
    private isDemoPlaying = false;

    private isQuizActive = false;
    private quizAnswered = false;
    private currentQuizAnswer: number | null = null;
    private currentEquation: Equation | null = null;
    private combo = 0;

    private countingActive = false;
    private countingAnswered = false;
    private countingAnswer: number | null = null;
    private countingProblem: CountingProblem | null = null;

    private modeBeforeDemo: 'quiz' | 'counting' | 'demo' | null = null;

    constructor(
        private document: Document,
        private confettiContainer: HTMLElement,
        private soundMgr: SoundManager
    ) {
        this.renderer = new Renderer(document);
        this.sound = soundMgr;
        this.animCtrl = new AnimationController();
        this.confetti = new ConfettiAnimator(confettiContainer);
        this.rewardSystem = new RewardSystem([5, 10, 15, 20, 30, 50], soundMgr, this.confetti);
        this.scoreCalc = new ScoreCalculator(1, 1);
    }

    setLevelStrategy(strategy: LevelStrategy): void {
        this.currentStrategy = strategy;
        this.eqGenerator = new EquationGenerator(strategy);
        const countingEmojis = strategy.getCountingEmojis ? strategy.getCountingEmojis() : undefined;
        this.countingGen = new CountingGenerator(strategy.getCountingMax(), countingEmojis);
        this.scoreCalc = new ScoreCalculator(strategy.scoreCorrect, strategy.scoreWrong, this.scoreCalc.getStars());
    }

    enterQuizMode(): void {
        if (this.isDemoPlaying) return;
        this.currentMode = 'quiz';
        this.isQuizActive = false;
        this.quizAnswered = false;
        this.countingActive = false;
        this.countingAnswered = false;
        this.feedback('');
        this.sound.play('click');

        this.renderer.setStyle('#fruitDisplay', { display: 'flex' });
        this.renderer.removeClass('#fruitDisplay', 'demo-active');
        this.renderer.setStyle('#sceneArea', { display: 'none' });
        this.renderer.setStyle('#btnDemo', { display: 'flex' });   // 答题模式显示演示按钮
        this.startQuiz();
    }

    enterCountingMode(): void {
        if (this.isDemoPlaying) return;
        this.currentMode = 'counting';
        this.isQuizActive = false;
        this.quizAnswered = false;
        this.countingActive = false;
        this.countingAnswered = false;
        this.feedback('');
        this.sound.play('click');

        this.renderer.setStyle('#fruitDisplay', { display: 'none' });
        this.renderer.setStyle('#sceneArea', { display: 'flex' });
        this.renderer.setStyle('#btnDemo', { display: 'none' });   // 计数模式隐藏演示按钮
        this.startCounting();
    }

    async startDemo(): Promise<void> {
        if (this.isDemoPlaying || !this.eqGenerator) return;
        this.modeBeforeDemo = this.currentMode;
        this.isDemoPlaying = true;

        const btnDemo = this.renderer.getElement('#btnDemo');
        this.renderer.setStyle('#btnDemo', { pointerEvents: 'none', opacity: '0.6' });
        btnDemo.textContent = '⏳ 演示中...';
        this.feedback('');

        this.renderer.setStyle('#fruitDisplay', { display: 'flex' });
        this.renderer.addClass('#fruitDisplay', 'demo-active');
        this.renderer.setStyle('#sceneArea', { display: 'none' });
        this.renderer.setStyle('#optionsGrid', { display: 'none' });
        this.renderer.setStyle('#btnNewQuiz', { display: 'none' });

        const eq = this.eqGenerator.generate(true);
        this.currentEquation = eq;
        this.animCtrl.randomEmoji();
        this.updateEquationHTML(eq, false);
        this.sound.play('click');
        this.sound.speakEquation(eq);
        // 判断是否使用竖式演示
        const useVertical =
            (this.currentStrategy?.id === 2) ||   // 高级
            (this.currentStrategy?.id === 4) ||   // 乘除进阶
            (this.currentStrategy?.id === 5) ||   // 四则
            (this.currentStrategy?.id === 3 && (eq.a! > 10 || eq.b! > 10 || eq.result > 20)); // 乘法入门条件

        if (useVertical) {
            await this.animCtrl.playVerticalDemo(eq, this.renderer.getElement('#fruitDisplay'), this.sound);
        } else {
            await this.animCtrl.playEquationDemo(eq, this.renderer.getElement('#fruitDisplay'), this.sound, (msg) => this.feedback(msg));
        }

        this.updateEquationHTML(eq, true);
        this.feedback(`🎉 答案是 ${eq.result}！`, true);
        this.sound.play('confetti');
        this.confetti.spawn(15);
        await sleep(2000);

        btnDemo.textContent = '▶️ 看演示动画';
        this.renderer.setStyle('#btnDemo', { pointerEvents: 'auto', opacity: '1' });
        this.isDemoPlaying = false;

        if (this.modeBeforeDemo === 'quiz') {
            this.enterQuizMode();
        } else if (this.modeBeforeDemo === 'counting') {
            this.enterCountingMode();
        } else {
            this.enterCountingMode();
        }
        this.modeBeforeDemo = null;
    }

    private startQuiz(): void {
        if (this.isDemoPlaying || !this.eqGenerator) return;
        this.isQuizActive = true;
        this.quizAnswered = false;
        this.combo = 0;
        this.feedback('');
        const eq = this.eqGenerator.generate(false);
        this.currentEquation = eq;
        this.currentQuizAnswer = eq.result;
        this.animCtrl.randomEmoji();
        this.updateEquationHTML(eq, false);
        const emoji = this.animCtrl.getCurrentEmoji();
        const fruitDisplay = this.renderer.getElement('#fruitDisplay');
        this.animCtrl.renderEmojis(eq.type === 'mixed' ? 0 : eq.a || 0, fruitDisplay, emoji);
        const maxVal = Math.max(eq.result + 20, this.scoreCalc.getStars() + 50);
        const optionCount = this.currentStrategy ? this.currentStrategy.getOptionCount() : 4;
        const options = OptionGenerator.generate({ correct: eq.result, maxValue: maxVal, count: optionCount });
        this.renderOptions(options);
        this.renderer.setStyle('#btnNewQuiz', { display: 'flex' });
        this.renderer.setStyle('#btnDemo', { display: 'flex' });
        this.feedback('🤔 想一想，答案是多少呢？');
        if (eq.type !== 'mixed') {
            this.sound.speakEquation(eq);
        }
    }

    private async startCounting(): Promise<void> {
        if (this.isDemoPlaying || !this.countingGen) return;
        this.countingActive = true;
        this.countingAnswered = false;
        this.feedback('');
        const sceneArea = this.renderer.getElement('#sceneArea');
        this.renderer.setStyle('#sceneArea', { display: 'flex' });
        this.renderer.setStyle('#fruitDisplay', { display: 'none' });
        this.renderer.setStyle('#optionsGrid', { display: 'none' });
        this.renderer.setStyle('#btnNewQuiz', { display: 'none' });
        this.renderer.setStyle('#btnDemo', { display: 'none' });
        this.renderer.setHTML('#equationDisplay', '');

        const problem = this.countingGen.generate();
        this.countingProblem = problem;
        this.countingAnswer = problem.answer;
        await this.animCtrl.playCountingAnimation(problem, sceneArea, this.sound);
        this.renderer.setHTML('#equationDisplay', `<span style="font-size:1.5rem;">${problem.question}</span>`);
        this.sound.speakText(problem.question);
        const totalAnimals = problem.finalAnimals.reduce((sum, a) => sum + a.count, 0);
        const options = OptionGenerator.generate({ correct: problem.answer, maxValue: totalAnimals + 10, count: 4 });
        this.renderOptions(options);
        this.renderer.setStyle('#btnNewQuiz', { display: 'flex' });
        this.feedback('🤔 看动画，数一数！');
    }

    handleAnswer(picked: number, clickedBtn: HTMLElement): void {
        if (this.currentMode === 'quiz') {
            if (!this.isQuizActive || this.quizAnswered) return;
            this.quizAnswered = true;
            const correct = this.currentQuizAnswer!;
            this.evaluate(picked === correct, clickedBtn, () => {
                if (picked === correct && this.currentEquation) {
                    this.updateEquationHTML(this.currentEquation, true);
                    const fruitDisplay = this.renderer.getElement('#fruitDisplay');
                    this.animCtrl.renderEmojis(this.currentEquation.result || 0, fruitDisplay, this.animCtrl.getCurrentEmoji());
                }
            });
            if (picked === correct) setTimeout(() => this.startQuiz(), 2000);
        } else if (this.currentMode === 'counting') {
            if (!this.countingActive || this.countingAnswered) return;
            this.countingAnswered = true;
            const correct = this.countingAnswer!;
            this.evaluate(picked === correct, clickedBtn);
            if (picked === correct) setTimeout(() => this.startCounting(), 2000);
        }
    }

    private evaluate(isCorrect: boolean, clickedBtn: HTMLElement, onCorrect?: () => void): void {
        const allBtns = document.querySelectorAll<HTMLButtonElement>('#optionsGrid .btn-option');
        if (isCorrect) {
            clickedBtn.classList.add('correct');
            allBtns.forEach(b => { if (b !== clickedBtn) b.style.opacity = '0.5'; b.style.pointerEvents = 'none'; });
            this.sound.play('correct');
            if (onCorrect) onCorrect();
            const points = this.scoreCalc.getCorrectPoints();
            this.addStars(points);
            this.combo++;
            const msgs = ['太棒了！🎉', '答对啦！🌟', '非常好！👍'];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            this.sound.speakText(msg);
            this.feedback(this.combo >= 3 ? `🔥 ${this.combo}连击！` : msg, true);
            this.confetti.spawn(18);
            this.sound.play('confetti');
        } else {
            clickedBtn.classList.add('wrong');
            this.sound.play('wrong');
            this.combo = 0;
            const points = this.scoreCalc.getWrongPoints();
            this.addStars(points);
            this.sound.speakText(`再想想哦，扣了${-points}分`);
            this.feedback(`再想想哦，扣了${-points}分 😢`);
            clickedBtn.style.pointerEvents = 'none';
            setTimeout(() => {
                clickedBtn.classList.remove('wrong');
                clickedBtn.style.pointerEvents = 'auto';
            }, 600);
        }
    }

    renderOptions(values: number[]): void {
        const grid = this.renderer.getElement('#optionsGrid');
        grid.innerHTML = '';
        const cols = values.length <= 4 ? 2 : (values.length <= 6 ? 3 : 4);
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        values.forEach(val => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-option';
            btn.textContent = String(val);
            btn.addEventListener('click', () => this.handleAnswer(val, btn));
            grid.appendChild(btn);
        });
        grid.style.display = 'grid';
    }

    updateEquationHTML(eq: Equation, showResult: boolean): void {
        const disp = this.renderer.getElement('#equationDisplay');
        if (eq.type === 'mixed') {
            disp.innerHTML = `<span>${eq.expr} = </span>${showResult ? `<span style="color:var(--pink);font-size:2.2rem;">${eq.result}</span>` : '<span class="question-mark">?</span>'}`;
            return;
        }
        const { a, b, result, op } = eq;
        disp.innerHTML = `<span>${a}</span> <span style="color:#ff7b42;">${op}</span> <span>${b}</span> <span>=</span> ${showResult ? `<span style="color:var(--pink);font-size:2.2rem;">${result}</span>` : '<span class="question-mark">?</span>'}`;
    }

    feedback(msg: string, celebrate = false): void {
        const el = this.renderer.getElement('#feedbackMsg');
        el.textContent = msg;
        el.className = 'feedback' + (celebrate ? ' celebrate' : '');
    }

    private addStars(points: number): void {
        const newStars = this.scoreCalc.addStars(points);
        this.renderer.setText('#starCount', String(newStars));
        this.rewardSystem.checkAndReward(newStars);
        const mascot = this.renderer.getElement('#mascotEmoji');
        if (newStars >= 20) mascot.textContent = '🏆';
        else if (newStars >= 10) mascot.textContent = '🐼';
    }

    public handleNewQuizButton(): void {
        if (this.currentMode === 'quiz') {
            this.startQuiz();
        } else if (this.currentMode === 'counting') {
            this.startCounting();
        }
    }

    public spawnConfetti(count: number = 8): void {
        this.confetti.spawn(count);
        this.sound.play('confetti');
    }
}