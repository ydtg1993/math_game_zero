import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class PrimaryLevel implements LevelStrategy {
    id = 1;
    name = '初级';
    scoreCorrect = 2;
    scoreWrong = 1;

    generateEquation(forDemo: boolean): Equation {
        const max = forDemo ? 15 : 99;
        const isAdd = Math.random() > 0.4;
        if (isAdd) {
            const a = rand(1, Math.min(max - 1, max));
            const b = rand(1, max - a);
            return { type: 'add', a, b, op: '+', result: a + b };
        } else {
            const a = rand(2, max);
            const b = rand(1, a);
            return { type: 'sub', a, b, op: '−', result: a - b };
        }
    }

    getOptionCount(): number { return 4; }
    getCountingMax(): number { return 15; }
}