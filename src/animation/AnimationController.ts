import { AnimalAnimator } from './AnimalAnimator';
import { FruitAnimator } from './FruitAnimator';
import { SoundManager } from '../audio/SoundManager';
import { sleep } from '../utils/helpers';
import { Equation } from '../core/types';
import { animalEmojis, fruitEmojis } from '../core/GameConfig';
import { CountingProblem, CountingAnimal } from '../calculator/CountingGenerator';

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
                    if (isAnimal) AnimalAnimator.walkIn(span);
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
        }else if (eq.type === 'mixed') {
            // 混合运算演示：直接展示最终结果数量的动物
            this.renderEmojis(eq.result, container, emoji);
            await sleep(500);
        }

        await sleep(300);
    }


    async playVerticalDemo(eq: Equation, container: HTMLElement, sound: SoundManager): Promise<void> {
        container.innerHTML = '';
        const emoji = this.currentEmoji;
        const isAnimal = this.isAnimalTheme();

        // 创建一个包装容器
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';
        container.appendChild(wrapper);

        // 图标展示行
        const iconRow = document.createElement('div');
        iconRow.style.display = 'flex';
        iconRow.style.flexWrap = 'wrap';
        iconRow.style.justifyContent = 'center';
        iconRow.style.gap = '4px';
        wrapper.appendChild(iconRow);

        // 竖式显示行
        const verticalDiv = document.createElement('div');
        verticalDiv.style.fontFamily = 'monospace';
        verticalDiv.style.fontSize = '1.8rem';
        verticalDiv.style.lineHeight = '1.4';
        verticalDiv.style.textAlign = 'center';
        verticalDiv.style.background = '#fff9e6';
        verticalDiv.style.padding = '10px 20px';
        verticalDiv.style.borderRadius = '12px';
        verticalDiv.style.border = '2px dashed #f0ad4e';
        wrapper.appendChild(verticalDiv);

        // 根据类型构建竖式文本
        let verticalText: string;
        if (eq.type === 'mixed') {
            // 混合运算直接展示表达式和等号
            verticalText = `${eq.expr} = ?`;
        } else {
            // 加减乘除：构建竖式
            const a = eq.a!;
            const b = eq.b!;
            const op = eq.op!;
            verticalText = this.buildVerticalText(a, b, op);
        }
        verticalDiv.innerText = verticalText;

        // 分段显示图标（根据结果和类型）
        const total = eq.result;
        const maxIconsPerRow = 15;
        const rows = Math.ceil(total / maxIconsPerRow);
        // 先清除原有图标
        const renderIcons = async () => {
            iconRow.innerHTML = '';
            for (let i = 0; i < Math.min(total, 40); i++) {
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = emoji;
                iconRow.appendChild(span);
                sound.play('fruitAppear');
                await sleep(50);
            }
            if (total > 40) {
                const moreSpan = document.createElement('span');
                moreSpan.textContent = `… ×${total}`;
                moreSpan.style.fontSize = '1.5rem';
                moreSpan.style.alignSelf = 'center';
                iconRow.appendChild(moreSpan);
            }
        };

        await renderIcons();
        await sleep(800);

        // 显示答案
        verticalDiv.innerHTML = verticalText.replace('?', `<span style="color:var(--pink); font-size:2.2rem;">${eq.result}</span>`);
        sound.play('correct');
        await sleep(300);
    }

// 辅助：构建竖式文本（用于加减乘除）
    private buildVerticalText(a: number, b: number, op: string): string {
        // 简单的竖式表达
        const aStr = a.toString();
        const bStr = b.toString();
        const maxLen = Math.max(aStr.length, bStr.length + (op === '×' || op === '÷' ? 1 : 0));
        const line = '─'.repeat(maxLen + 2);
        switch (op) {
            case '+':
            case '−':
                return `  ${aStr.padStart(maxLen)}\n${op} ${bStr.padStart(maxLen - 1)}\n${line}\n  ?`;
            case '×':
                return `  ${aStr.padStart(maxLen)}\n${op} ${bStr.padStart(maxLen - 2)}\n${line}\n  ?`;
            case '÷':
                return `  ${aStr.padStart(maxLen)}\n${op} ${bStr.padStart(maxLen - 2)}\n${line}\n  ?`;
            default:
                return `${a} ${op} ${b} = ?`;
        }
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

    // 单动物数数（兼容旧逻辑）
    async playCountingAnimation(problem: CountingProblem, container: HTMLElement, sound: SoundManager): Promise<void> {
        if (problem.initialAnimals.length === 1) {
            await this.playSingleAnimalCounting(problem, container, sound);
        } else {
            await this.playMultiAnimalCounting(problem, container, sound);
        }
    }

    private async playSingleAnimalCounting(problem: CountingProblem, container: HTMLElement, sound: SoundManager): Promise<void> {
        const init = problem.initialAnimals[0];
        const change = problem.change;
        const emoji = init.emoji;
        const isAnimal = this.isAnimalTheme();
        container.innerHTML = '';
        this.renderEmojis(init.count, container, emoji);
        await sleep(800);
        const delta = change.delta;
        if (delta > 0) {
            for (let i = 0; i < delta; i++) {
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = change.emoji;
                container.appendChild(span);
                sound.play('fruitAppear');
                if (isAnimal) await AnimalAnimator.walkIn(span);
                else await FruitAnimator.bounceIn(span);
                await sleep(500);
            }
        } else {
            const absDelta = Math.abs(delta);
            for (let i = 0; i < absDelta; i++) {
                const items = container.querySelectorAll('.animal-item, .fruit-item');
                // 移除最后一个匹配的（简单处理，因为只有一种动物）
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

    private async playMultiAnimalCounting(problem: CountingProblem, container: HTMLElement, sound: SoundManager): Promise<void> {
        container.innerHTML = '';
        const isAnimal = this.isAnimalTheme();
        // 渲染初始所有动物（按顺序排列）
        for (const animal of problem.initialAnimals) {
            for (let i = 0; i < animal.count; i++) {
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = animal.emoji;
                container.appendChild(span);
            }
        }
        await sleep(800);

        const targetEmoji = problem.change.emoji;
        const delta = problem.change.delta;
        if (delta > 0) {
            for (let i = 0; i < delta; i++) {
                const span = document.createElement('span');
                span.className = isAnimal ? 'animal-item' : 'fruit-item';
                span.textContent = targetEmoji;
                container.appendChild(span);
                sound.play('fruitAppear');
                if (isAnimal) await AnimalAnimator.walkIn(span);
                else await FruitAnimator.bounceIn(span);
                await sleep(500);
            }
        } else {
            const absDelta = Math.abs(delta);
            // 找出页面中所有该动物的元素，从后往前移除
            const allItems = Array.from(container.querySelectorAll('.animal-item, .fruit-item'))
                .filter(el => el.textContent === targetEmoji);
            for (let i = 0; i < Math.min(absDelta, allItems.length); i++) {
                const item = allItems[allItems.length - 1 - i] as HTMLElement;
                sound.play('fruitDisappear');
                if (isAnimal) await AnimalAnimator.walkOut(item);
                else await FruitAnimator.popOut(item);
                await sleep(600);
            }
        }
    }
}