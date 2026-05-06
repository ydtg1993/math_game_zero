import { rand } from '../utils/helpers';

export class ConfettiAnimator {
    constructor(private container: HTMLElement) {}

    spawn(count = 15): void {
        const emojis = ['⭐','🌟','✨','🎉','🎊','💖','🌈'];
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'confetti-particle';
            p.textContent = emojis[rand(0, emojis.length - 1)];
            p.style.left = Math.random() * 90 + '%';
            p.style.top = -(Math.random() * 30 + 10) + 'px';
            p.style.animationDuration = (Math.random() * 1 + 1) + 's';
            frag.appendChild(p);
        }
        this.container.appendChild(frag);
        setTimeout(() => {
            this.container.innerHTML = '';
        }, 2000);
    }
}