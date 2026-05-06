// src/calculator/CountingGenerator.ts
import { rand } from '../utils/helpers';

export interface CountingAnimal {
    emoji: string;
    count: number;
}

export interface CountingProblem {
    initialAnimals: CountingAnimal[];
    change: {
        emoji: string;
        delta: number;
    };
    finalAnimals: CountingAnimal[];
    question: string;
    answer: number;
}

export class CountingGenerator {
    constructor(
        private maxNum: number,
        private preferredEmojis?: string[]
    ) {}

    generate(emoji?: string): CountingProblem {
        // 如果提供了多动物列表，则走多动物模式
        if (this.preferredEmojis && this.preferredEmojis.length >= 2) {
            return this.generateMultiAnimal();
        }
        // 否则走单动物模式（需要 emoji 参数，若未提供则随机一个）
        const fallbackEmoji = emoji || '🐶';
        return this.generateSingleAnimal(fallbackEmoji);
    }

    private generateSingleAnimal(emoji: string): CountingProblem {
        const initial = rand(2, Math.min(8, this.maxNum));
        const changeAmount = rand(1, Math.min(5, Math.floor(this.maxNum / 2)));
        const isAdd = Math.random() > 0.4;
        const final = isAdd ? initial + changeAmount : Math.max(0, initial - changeAmount);
        const qType = rand(0, 2);
        let question: string;
        let answer: number;
        if (qType === 0) {
            question = `现在一共有几只${emoji}？`;
            answer = final;
        } else if (qType === 1) {
            question = isAdd ? `刚才进来了几只${emoji}？` : `刚才离开了几只${emoji}？`;
            answer = changeAmount;
        } else {
            question = `原来有几只${emoji}？`;
            answer = initial;
        }
        return {
            initialAnimals: [{ emoji, count: initial }],
            change: { emoji, delta: isAdd ? changeAmount : -changeAmount },
            finalAnimals: [{ emoji, count: final }],
            question,
            answer
        };
    }

    private generateMultiAnimal(): CountingProblem {
        const animals = this.preferredEmojis!;
        const shuffled = [...animals].sort(() => Math.random() - 0.5);
        const count = Math.min(animals.length, 3);  // 最多选3种动物
        const selectedAnimals = shuffled.slice(0, count);
        const initialCounts = selectedAnimals.map(() => rand(1, Math.min(3, this.maxNum)));

        const changeTargetIdx = rand(0, selectedAnimals.length - 1);
        const changeTarget = selectedAnimals[changeTargetIdx];
        const isAdd = Math.random() > 0.3;
        const delta = rand(1, 2);
        const newCount = isAdd
            ? initialCounts[changeTargetIdx] + delta
            : Math.max(0, initialCounts[changeTargetIdx] - delta);

        const finalCounts = [...initialCounts];
        finalCounts[changeTargetIdx] = newCount;

        const initialAnimals: CountingAnimal[] = selectedAnimals.map((emoji, i) => ({
            emoji,
            count: initialCounts[i]
        }));
        const finalAnimals: CountingAnimal[] = selectedAnimals.map((emoji, i) => ({
            emoji,
            count: finalCounts[i]
        }));

        const qType = rand(0, 3);
        let question: string;
        let answer: number;

        switch (qType) {
            case 0:
                answer = finalCounts.reduce((sum, c) => sum + c, 0);
                question = `现在一共有多少只动物？`;
                break;
            case 1:
                answer = finalCounts[changeTargetIdx];
                question = `现在有几只${changeTarget}？`;
                break;
            case 2:
                if (selectedAnimals.length < 2) {
                    answer = finalCounts.reduce((sum, c) => sum + c, 0);
                    question = `现在一共有多少只动物？`;
                } else {
                    const idx1 = changeTargetIdx;
                    const idx2 = (changeTargetIdx + 1) % selectedAnimals.length;
                    const diff = finalCounts[idx1] - finalCounts[idx2];
                    if (diff > 0) {
                        answer = diff;
                        question = `${selectedAnimals[idx1]}比${selectedAnimals[idx2]}多几只？`;
                    } else if (diff < 0) {
                        answer = -diff;
                        question = `${selectedAnimals[idx2]}比${selectedAnimals[idx1]}多几只？`;
                    } else {
                        answer = 0;
                        question = `${selectedAnimals[idx1]}和${selectedAnimals[idx2]}一样多，多0只`;
                    }
                }
                break;
            default:
                question = isAdd ? `刚才进来了几只${changeTarget}？` : `刚才离开了几只${changeTarget}？`;
                answer = delta;
                break;
        }

        return {
            initialAnimals,
            change: { emoji: changeTarget, delta: isAdd ? delta : -delta },
            finalAnimals,
            question,
            answer
        };
    }
}