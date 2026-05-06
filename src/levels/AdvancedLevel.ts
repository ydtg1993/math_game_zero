import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class AdvancedLevel implements LevelStrategy {
    id = 2;
    name = '高级';
    scoreCorrect = 3;
    scoreWrong = 2;

    generateEquation(forDemo: boolean): Equation {
        const max = forDemo ? 20 : 999;
        const isAdd = Math.random() > 0.4;
        if (isAdd) {
            const a = rand(1, max - 1);
            const b = rand(1, max - a);
            return { type: 'add', a, b, op: '+', result: a + b };
        } else {
            const a = rand(2, max);
            const b = rand(1, a);
            return { type: 'sub', a, b, op: '−', result: a - b };
        }
    }

    getOptionCount(): number { return 6; }
    getCountingMax(): number { return 20; }
}