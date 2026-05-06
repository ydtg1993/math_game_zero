// src/levels/MultiplicationLevel.ts
import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MultiplicationLevel implements LevelStrategy {
    id = 3;
    name = '乘法入门';
    scoreCorrect = 4;
    scoreWrong = 2;

    generateEquation(forDemo: boolean): Equation {
        // 只生成乘法，单数相乘（1-9）
        const a = rand(1, 9);
        const b = rand(1, 9);
        return { type: 'mul', a, b, op: '×', result: a * b };
    }

    getOptionCount(): number { return 4; }   // 降低选项数以适应简单乘法
    getCountingMax(): number { return 10; }
}