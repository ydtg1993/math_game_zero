import { Equation } from '../core/types';
import { LevelStrategy } from './LevelStrategy';
import { rand } from '../utils/helpers';

export class EnlightenmentLevel implements LevelStrategy {
    id = 0;
    name = '启蒙';
    scoreCorrect = 1;
    scoreWrong = 1;

    generateEquation(forDemo: boolean): Equation {
        const max = forDemo ? 9 : 9;
        const isAdd = Math.random() > 0.4;
        let a: number, b: number, result: number;
        if (isAdd) {
            a = rand(1, Math.min(max - 1, max));
            b = rand(1, max - a);
            result = a + b;
            return { type: 'add', a, b, op: '+', result };
        } else {
            a = rand(2, max);
            b = rand(1, a);
            result = a - b;
            return { type: 'sub', a, b, op: '−', result };
        }
    }

    getOptionCount(): number { return 4; }
    getCountingMax(): number { return 10; }
}