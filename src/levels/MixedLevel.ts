import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MixedLevel implements LevelStrategy {
    id = 5;
    name = '四则运算';
    scoreCorrect = 5;
    scoreWrong = 3;

    generateEquation(forDemo: boolean): Equation {
        const n1 = rand(2, forDemo ? 10 : 20);
        const n2 = rand(2, forDemo ? 10 : 20);
        const ops = ['+', '-', '*'];
        const op1 = ops[rand(0, 2)];
        let mid: number;
        if (op1 === '+') mid = n1 + n2;
        else if (op1 === '-') mid = Math.max(n1 - n2, 1);
        else mid = n1 * n2;

        const n3 = rand(2, Math.max(2, Math.floor(mid / 2)));
        const op2 = rand(0, 1) ? '+' : '-';
        const result = op2 === '+' ? mid + n3 : Math.max(mid - n3, 1);
        const expr = `${n1} ${op1 === '*' ? '×' : op1} ${n2} ${op2} ${n3}`;
        return { type: 'mixed', expr, result };
    }

    getOptionCount(): number { return 8; }
    getCountingMax(): number { return 25; }
}