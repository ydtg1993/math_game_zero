import { funnyCards } from '../core/GameConfig';
import { rand } from '../utils/helpers';
import { SoundManager } from '../audio/SoundManager';
import { ConfettiAnimator } from '../animation/ConfettiAnimator';

export class RewardSystem {
    private lastMilestone = 0;
    private milestones: number[];

    constructor(
        milestones: number[],
        private sound: SoundManager,
        private confetti: ConfettiAnimator
    ) {
        this.milestones = [...milestones].sort((a, b) => a - b);
    }

    checkAndReward(score: number): void {
        for (const m of this.milestones) {
            if (score >= m && m > this.lastMilestone) {
                this.lastMilestone = m;
                this.showReward(m);
                break;
            }
        }
    }

    private showReward(score: number): void {
        const card = funnyCards[rand(0, funnyCards.length - 1)];
        const overlay = document.createElement('div');
        overlay.className = 'reward-overlay';
        overlay.innerHTML = `
      <div class="reward-card">
        <span class="reward-emoji">${card.emoji}</span>
        <div class="reward-text">🎉 积分达到 ${score} !</div>
        <div class="reward-funny">${card.extra}</div>
        <div style="font-size:1rem; color:gray; margin-top:8px;">${card.text}</div>
      </div>
    `;
        document.body.appendChild(overlay);
        this.sound.play('confetti');
        this.confetti.spawn(25);
        overlay.addEventListener('click', () => overlay.remove());
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 3500);
    }
}