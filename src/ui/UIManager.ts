import { Renderer } from './Renderer';
import { Equation, TabMode } from '../core/types';
import { LevelStrategy } from '../levels/LevelStrategy';
import { OptionGenerator } from '../calculator/OptionGenerator';
import { EquationGenerator } from '../calculator/EquationGenerator';
import { AnimationController } from '../animation/AnimationController';
import { SoundManager } from '../audio/SoundManager';
import { ConfettiAnimator } from '../animation/ConfettiAnimator';
import { RewardSystem } from './RewardSystem';
import { CountingGenerator } from '../calculator/CountingGenerator';
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

    // 新增：保存当前等级策略引用，避免访问私有属性
    private currentStrategy?: LevelStrategy;

    private currentMode: TabMode = 'demo';
    private isDemoPlaying = false;
    private isQuizActive = false;
    private quizAnswered = false;
    private currentQuizAnswer: number | null = null;
    private currentEquation: Equation | null = null;
    private combo = 0;

    // 数数状态
    private countingActive = false;
    private countingAnswered = false;
    private countingAnswer: number | null = null;
    private countingProblem: any = null;

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
        this.currentStrategy = strategy; // 保存引用
        this.eqGenerator = new EquationGenerator(strategy);
        this.countingGen = new CountingGenerator(strategy.getCountingMax());
        this.scoreCalc = new ScoreCalculator(strategy.scoreCorrect, strategy.scoreWrong, this.scoreCalc.getStars());
        if (this.currentMode === 'demo') {
            this.resetDemo();
        } else if (this.currentMode === 'quiz') {
            this.startQuiz();
        } else if (this.currentMode === 'counting') {
            this.startCounting();
        }
    }

    switchMode(mode: TabMode): void {
        if (this.isDemoPlaying) return;
        this.currentMode = mode;
        this.isQuizActive = false;
        this.quizAnswered = false;
        this.countingActive = false;
        this.countingAnswered = false;
        this.feedback('');
        this.sound.play('click');

        ['tabDemo', 'tabQuiz', 'tabCounting'].forEach(id => this.renderer.removeClass(`#${id}`, 'active'));
        if (mode === 'demo') this.renderer.addClass('#tabDemo', 'active');
        else if (mode === 'quiz') this.renderer.addClass('#tabQuiz', 'active');
        else this.renderer.addClass('#tabCounting', 'active');

        if (mode === 'demo') {
            this.renderer.setStyle('#optionsGrid', { display: 'none' });
            this.renderer.setStyle('#btnNewQuiz', { display: 'none' });
            this.renderer.setStyle('#btnDemo', { display: 'flex' });
            this.renderer.setStyle('#fruitDisplay', { display: 'flex' });
            this.renderer.setStyle('#sceneArea', { display: 'none' });
            this.renderer.addClass('#fruitDisplay', 'demo-active');
            this.renderer.setHTML('#fruitDisplay', '👆 点击按钮开始');
            this.renderer.setHTML('#equationDisplay', '<span>准备开始 🎈</span>');
        } else if (mode === 'quiz') {
            this.renderer.setStyle('#fruitDisplay', { display: 'flex' });
            this.renderer.setStyle('#sceneArea', { display: 'none' });
            this.renderer.removeClass('#fruitDisplay', 'demo-active');
            this.startQuiz();
        } else {
            this.renderer.setStyle('#fruitDisplay', { display: 'none' });
            this.renderer.setStyle('#sceneArea', { display: 'flex' });
            this.renderer.setStyle('#optionsGrid', { display: 'none' });
            this.renderer.setStyle('#btnNewQuiz', { display: 'none' });
            this.renderer.setStyle('#btnDemo', { display: 'none' });
            this.renderer.setHTML('#equationDisplay', '');
            this.startCounting();
        }
    }

    async startDemo(): Promise<void> {
        if (this.isDemoPlaying || !this.eqGenerator) return;
        this.isDemoPlaying = true;
        const btnDemo = this.renderer.getElement('#btnDemo');
        this.renderer.setStyle('#btnDemo', { pointerEvents: 'none', opacity: '0.6' });
        btnDemo.textContent = '⏳ 演示中...';
        this.feedback('');

        const eq = this.eqGenerator.generate(true);
        this.currentEquation = eq;
        this.animCtrl.randomEmoji();
        const fruitDisplay = this.renderer.getElement('#fruitDisplay');
        this.renderer.addClass('#fruitDisplay', 'demo-active');
        this.updateEquationHTML(eq, false);
        this.sound.play('click');

        await this.animCtrl.playEquationDemo(eq, fruitDisplay, this.sound, (msg) => this.feedback(msg));

        this.updateEquationHTML(eq, true);
        this.feedback(`🎉 答案是 ${eq.result}！`, true);
        this.sound.play('confetti');
        this.confetti.spawn(15);
        await sleep(2000);
        btnDemo.textContent = '▶️ 再看一次演示';
        this.renderer.setStyle('#btnDemo', { pointerEvents: 'auto', opacity: '1' });
        this.isDemoPlaying = false;
        if (this.currentMode === 'demo') this.feedback('💡 切换到答题或趣味数数吧！');
    }

    startQuiz(): void {
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
        // 使用保存的 currentStrategy 获取选项数量，避免访问私有属性
        const optionCount = this.currentStrategy ? this.currentStrategy.getOptionCount() : 4;
        const options = OptionGenerator.generate({ correct: eq.result, maxValue: maxVal, count: optionCount });
        this.renderOptions(options);
        this.renderer.setStyle('#btnNewQuiz', { display: 'flex' });
        this.renderer.setStyle('#btnDemo', { display: 'none' });
        this.feedback('🤔 想一想，答案是多少呢？');
    }

    async startCounting(): Promise<void> {
        if (this.isDemoPlaying || !this.countingGen) return;
        this.countingActive = true;
        this.countingAnswered = false;
        this.feedback('');
        const sceneArea = this.renderer.getElement('#sceneArea');
        this.renderer.setStyle('#sceneArea', { display: 'flex' });
        this.renderer.setStyle('#fruitDisplay', { display: 'none' });
        this.renderer.setStyle('#btnDemo', { display: 'none' });
        this.renderer.setStyle('#btnNewQuiz', { display: 'none' });
        this.renderer.setHTML('#equationDisplay', '');

        const emoji = this.animCtrl.randomEmoji();
        const problem = this.countingGen.generate(emoji);
        this.countingProblem = problem;
        this.countingAnswer = problem.answer;
        await this.animCtrl.playCountingAnimation(problem.initial, problem.change, problem.isAdd, sceneArea, this.sound);
        this.renderer.setHTML('#equationDisplay', `<span style="font-size:1.5rem;">${problem.question}</span>`);
        const options = OptionGenerator.generate({ correct: problem.answer, maxValue: problem.final + 10, count: 4 });
        this.renderOptions(options);
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
            this.feedback(this.combo >= 3 ? `🔥 ${this.combo}连击！` : msgs[Math.floor(Math.random() * msgs.length)], true);
            this.confetti.spawn(18);
            this.sound.play('confetti');
        } else {
            clickedBtn.classList.add('wrong');
            this.sound.play('wrong');
            this.combo = 0;
            const points = this.scoreCalc.getWrongPoints();
            this.addStars(points);
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

    resetDemo(): void {
        this.renderer.setHTML('#fruitDisplay', '👆 点击按钮开始');
        this.renderer.setHTML('#equationDisplay', '<span>准备开始 🎈</span>');
    }

    // 公共方法：安全处理“出新题目”按钮点击，自动根据当前模式调用
    public handleNewQuizButton(): void {
        if (this.currentMode === 'quiz') {
            this.startQuiz();
        } else if (this.currentMode === 'counting') {
            this.startCounting();
        }
    }

    // 公共方法：生成彩纸效果，避免外部重复创建 ConfettiAnimator
    public spawnConfetti(count: number = 8): void {
        this.confetti.spawn(count);
        this.sound.play('confetti');
    }
}