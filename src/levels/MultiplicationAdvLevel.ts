import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MultiplicationAdvLevel implements LevelStrategy {
    id = 4;
    name = '乘除进阶';
    scoreCorrect = 4;
    scoreWrong = 2;

    generateEquation(forDemo: boolean): Equation {
        const maxMul = forDemo ? 5 : 25;
        const maxDiv = forDemo ? 5 : 12;
        if (Math.random() > 0.4) {
            const a = rand(2, maxMul);
            const b = rand(2, maxMul);
            const res = a * b;
            if (!forDemo && res > 200) return this.generateEquation(forDemo);
            return { type: 'mul', a, b, op: '×', result: res };
        } else {
            const b = rand(2, maxDiv);
            const q = rand(2, maxDiv);
            const a = b * q;
            if (!forDemo && a > 200) return this.generateEquation(forDemo);
            return { type: 'div', a, b, op: '÷', result: q };
        }
    }

    getOptionCount(): number { return 6; }
    getCountingMax(): number { return 20; }
}