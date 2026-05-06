import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class FunMathLevel implements LevelStrategy {
    id = 0;
    name = '趣味数学';
    scoreCorrect = 1;
    scoreWrong = 1;

    generateEquation(forDemo: boolean): Equation {
        // 简单 1-9 加减，保持趣味性
        const max = 9;
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

    getOptionCount(): number { return 4; }
    getCountingMax(): number { return 8; }

    // 提供多种动物用于趣味数数
    getCountingEmojis(): string[] {
        return ['🐶', '🐱', '🐭', '🐹', '🐰']; // 可自定义
    }
}