import { rand } from '../utils/helpers';

export interface CountingProblem {
    initial: number;
    change: number;
    isAdd: boolean;
    final: number;
    question: string;
    answer: number;
}

export class CountingGenerator {
    constructor(private maxNum: number) {}

    generate(emoji: string): CountingProblem {
        const initial = rand(2, Math.min(8, this.maxNum));
        const change = rand(1, Math.min(5, Math.floor(this.maxNum / 2)));
        const isAdd = Math.random() > 0.4;
        const final = isAdd ? initial + change : Math.max(0, initial - change);

        const qType = rand(0, 2);
        let question: string;
        let answer: number;
        if (qType === 0) {
            question = `现在一共有几只${emoji}？`;
            answer = final;
        } else if (qType === 1) {
            question = isAdd ? `刚才进来了几只${emoji}？` : `刚才离开了几只${emoji}？`;
            answer = change;
        } else {
            question = `原来有几只${emoji}？`;
            answer = initial;
        }
        return { initial, change, isAdd, final, question, answer };
    }
}