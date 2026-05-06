// src/levels/MultiplicationAdvLevel.ts
import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MultiplicationAdvLevel implements LevelStrategy {
    id = 4;
    name = '乘除进阶';
    scoreCorrect = 4;
    scoreWrong = 2;

    generateEquation(forDemo: boolean): Equation {
        // 50% 乘法，50% 除法
        if (Math.random() < 0.5) {
            // 乘法：两位数 × 两位数，结果 ≤ 2000
            let a = rand(10, 99);
            let b = rand(10, 99);
            if (a * b > 2000) {
                // 缩小范围
                a = rand(10, 50);
                b = rand(10, 40);
            }
            return { type: 'mul', a, b, op: '×', result: a * b };
        } else {
            // 除法：三位数 ÷ 两位数（或一位数），整除
            const divisor = rand(2, 99);
            const quotient = rand(2, 20);
            const dividend = divisor * quotient;
            if (dividend < 100) return this.generateEquation(forDemo); // 重新生成保证被除数至少三位数
            return { type: 'div', a: dividend, b: divisor, op: '÷', result: quotient };
        }
    }

    getOptionCount(): number { return 6; }
    getCountingMax(): number { return 20; }
}