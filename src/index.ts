import { SoundManager } from './audio/SoundManager';
import { UIManager } from './ui/UIManager';
import { LevelId} from './core/types';
import { getLevelStrategy } from './calculator/LevelFactory';

const sound = new SoundManager();
const ui = new UIManager(document, document.getElementById('confettiContainer')!, sound);

// 音乐按钮
const musicBtn = document.getElementById('musicToggle')!;
musicBtn.addEventListener('click', () => {
    sound.initOnInteraction();
    sound.toggle(musicBtn);
});

// 等级切换
document.getElementById('levelRow')!.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.level-btn');
    if (!btn) return;
    const levelId = parseInt(btn.getAttribute('data-level') || '0') as LevelId;
    document.querySelectorAll('#levelRow .level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const strategy = getLevelStrategy(levelId);
    ui.setLevelStrategy(strategy);
    sound.play('click');
});

// 模式切换
document.getElementById('tabDemo')!.addEventListener('click', () => ui.switchMode('demo'));
document.getElementById('tabQuiz')!.addEventListener('click', () => ui.switchMode('quiz'));
document.getElementById('tabCounting')!.addEventListener('click', () => ui.switchMode('counting'));

// 演示按钮
document.getElementById('btnDemo')!.addEventListener('click', () => ui.startDemo());

// 出新题目按钮
document.getElementById('btnNewQuiz')!.addEventListener('click', () => {
    ui.handleNewQuizButton();  // 安全调用
});

// 吉祥物点击
document.getElementById('mascotEmoji')!.addEventListener('click', () => {
    sound.play('click');
    const msgs = ['你好呀！👋','加油！💪','数学很有趣~'];
    const el = document.querySelector('#feedbackMsg')!;
    el.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    el.className = 'feedback celebrate';
    if (Math.random() < 0.3) {
        ui.spawnConfetti(8);
    }
});

// 首次交互初始化音频
document.addEventListener('click', () => sound.initOnInteraction(), { once: true });

// 初始设置
sound.setMusic(true, musicBtn);
ui.setLevelStrategy(getLevelStrategy(0));
ui.switchMode('demo');