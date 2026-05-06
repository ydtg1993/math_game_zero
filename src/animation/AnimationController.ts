import { AnimalAnimator } from './AnimalAnimator';
import { FruitAnimator } from './FruitAnimator';
import { SoundManager } from '../audio/SoundManager';
import { sleep } from '../utils/helpers';
import { Equation } from '../core/types';
import { animalEmojis, fruitEmojis } from '../core/GameConfig';

type Theme = 'animal' | 'fruit';

export class AnimationController {
    private theme: Theme = 'animal';
    private currentEmoji = '🐶';

    setTheme(theme: Theme): void {
        this.theme = theme;
    }

    randomEmoji(): string {
        const pool = this.theme === 'animal' ? animalEmojis : fruitEmojis;
        this.currentEmoji = pool[Math.floor(Math.random() * pool.length)];
        return this.currentEmoji;
    }

    getCurrentEmoji(): string {
        return this.currentEmoji;
    }

    isAnimalTheme(): boolean {
        return this.theme === 'animal';
    }

    async playEquationDemo(eq: Equation, container: HTMLElement, sound: SoundManager, feedback?: (msg: string) => void): Promise<void> {
        // 清空容器
        container.innerHTML = '';
        const emoji = this.currentEmoji;
        const isAnimal = this.isAnimalTheme();

        if (eq.type === 'add') {
            this.renderEmojis(eq.a!, container, emoji);
            await sleep(600);
            for (let i = 0; i < eq.b!; i++) {
                await sleep(350);
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = emoji;
                container.appendChild(span);
                sound.play('fruitAppear');
                if (isAnimal) await AnimalAnimator.walkIn(span);
                else await FruitAnimator.bounceIn(span);
            }
        } else if (eq.type === 'sub') {
            this.renderEmojis(eq.a!, container, emoji);
            await sleep(600);
            for (let i = 0; i < eq.b!; i++) {
                await sleep(400);
                const items = container.querySelectorAll('.animal-item, .fruit-item');
                if (items.length > 0) {
                    const last = items[items.length - 1] as HTMLElement;
                    sound.play('fruitDisappear');
                    if (isAnimal) await AnimalAnimator.walkOut(last);
                    else await FruitAnimator.popOut(last);
                }
            }
        } else if (eq.type === 'mul') {
            this.renderEmojis(0, container, emoji);
            await sleep(400);
            for (let g = 0; g < eq.a!; g++) {
                for (let i = 0; i < eq.b!; i++) {
                    const span = document.createElement('span');
                    span.className = isAnimal ? 'animal-item' : 'fruit-item';
                    span.textContent = emoji;
                    container.appendChild(span);
                    sound.play('fruitAppear');
                    if (isAnimal) AnimalAnimator.walkIn(span); // 可并行播放
                    else FruitAnimator.bounceIn(span);
                    await sleep(80);
                }
                if (g < eq.a! - 1 && feedback) {
                    feedback(`第 ${g + 1} 组完成，共 ${(g + 1) * eq.b!} 个`);
                    await sleep(500);
                }
            }
        } else if (eq.type === 'div') {
            this.renderEmojis(eq.a!, container, emoji);
            await sleep(600);
            let remaining = eq.a!;
            let groups = 0;
            while (remaining >= eq.b!) {
                const items = container.querySelectorAll('.animal-item, .fruit-item');
                for (let i = 0; i < eq.b!; i++) {
                    if (items[i]) (items[i] as HTMLElement).style.filter = 'brightness(1.5)';
                }
                await sleep(700);
                for (let i = 0; i < eq.b!; i++) {
                    const cur = container.querySelectorAll('.animal-item, .fruit-item');
                    if (cur.length > 0) {
                        const first = cur[0] as HTMLElement;
                        sound.play('fruitDisappear');
                        if (isAnimal) await AnimalAnimator.walkOut(first);
                        else await FruitAnimator.popOut(first);
                    }
                }
                groups++;
                remaining -= eq.b!;
                if (feedback) feedback(`分出了 ${groups} 组，每组 ${eq.b!} 个`);
                await sleep(500);
            }
        } // mixed 不演示

        await sleep(300);
    }

    renderEmojis(count: number, container: HTMLElement, emoji: string): void {
        container.innerHTML = '';
        const maxShow = 30;
        const showCount = Math.min(count, maxShow);
        const isAnimal = this.isAnimalTheme();
        for (let i = 0; i < showCount; i++) {
            const span = document.createElement('span');
            span.className = isAnimal ? 'animal-item' : 'fruit-item';
            span.textContent = emoji;
            container.appendChild(span);
        }
        if (count > maxShow) {
            const more = document.createElement('span');
            more.textContent = `… ×${count}`;
            container.appendChild(more);
        }
    }

    async playCountingAnimation(initial: number, change: number, isAdd: boolean, container: HTMLElement, sound: SoundManager): Promise<void> {
        const emoji = this.currentEmoji;
        const isAnimal = this.isAnimalTheme();
        container.innerHTML = '';
        this.renderEmojis(initial, container, emoji);
        await sleep(800);

        if (isAdd) {
            for (let i = 0; i < change; i++) {
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = emoji;
                container.appendChild(span);
                sound.play('fruitAppear');
                if (isAnimal) await AnimalAnimator.walkIn(span);
                else await FruitAnimator.bounceIn(span);
                await sleep(500);
            }
        } else {
            for (let i = 0; i < change; i++) {
                const items = container.querySelectorAll('.animal-item, .fruit-item');
                if (items.length > 0) {
                    const last = items[items.length - 1] as HTMLElement;
                    sound.play('fruitDisappear');
                    if (isAnimal) await AnimalAnimator.walkOut(last);
                    else await FruitAnimator.popOut(last);
                    await sleep(600);
                }
            }
        }
    }
}