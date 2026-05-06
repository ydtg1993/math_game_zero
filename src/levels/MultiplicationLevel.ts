import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MultiplicationLevel implements LevelStrategy {
    id = 3;
    name = '乘法入门';
    scoreCorrect = 4;
    scoreWrong = 2;

    generateEquation(forDemo: boolean): Equation {
        const maxMul = forDemo ? 6 : 9;
        if (Math.random() > 0.4) {
            const a = rand(1, maxMul);
            const b = rand(1, maxMul);
            return { type: 'mul', a, b, op: '×', result: a * b };
        } else {
            const b = rand(1, forDemo ? 5 : 9);
            const q = rand(1, forDemo ? 5 : 9);
            const a = b * q;
            return { type: 'div', a, b, op: '÷', result: q };
        }
    }

    getOptionCount(): number { return 6; }
    getCountingMax(): number { return 15; }
}