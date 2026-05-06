import { LevelStrategy } from './LevelStrategy';
import { Equation } from '../core/types';
import { rand } from '../utils/helpers';

export class MixedLevel implements LevelStrategy {
    id = 5;
    name = '四则运算';
    scoreCorrect = 5;
    scoreWrong = 3;

    generateEquation(forDemo: boolean): Equation {
        // 随机选取模板，确保结果为整数且非负
        const template = rand(0, 3);
        try {
            switch (template) {
                case 0: return this.typeA(forDemo);
                case 1: return this.typeB(forDemo);
                case 2: return this.typeC(forDemo);
                default: return this.typeD(forDemo);
            }
        } catch {
            return this.generateEquation(forDemo);
        }
    }

    // (a + b) × c  或  (a - b) × c
    private typeA(forDemo: boolean): Equation {
        const a = rand(2, forDemo ? 10 : 20);
        const b = rand(1, a - 1);
        const c = rand(2, forDemo ? 5 : 9);
        const op = Math.random() < 0.5 ? '+' : '-';
        const mid = op === '+' ? a + b : a - b;
        const result = mid * c;
        const expr = `( ${a} ${op} ${b} ) × ${c}`;
        return { type: 'mixed', expr, result };
    }

    // a × (b + c)  或  a × (b - c)
    private typeB(forDemo: boolean): Equation {
        const a = rand(2, forDemo ? 5 : 9);
        const b = rand(2, forDemo ? 8 : 15);
        const c = rand(1, b - 1);
        const op = Math.random() < 0.5 ? '+' : '-';
        const mid = op === '+' ? b + c : b - c;
        const result = a * mid;
        const expr = `${a} × ( ${b} ${op} ${c} )`;
        return { type: 'mixed', expr, result };
    }

    // (a + b) ÷ c  整除
    private typeC(forDemo: boolean): Equation {
        const c = rand(2, forDemo ? 4 : 9);
        const quotient = rand(2, forDemo ? 5 : 12);
        const mid = c * quotient;
        const a = rand(1, mid - 1);
        const b = mid - a;
        const expr = `( ${a} + ${b} ) ÷ ${c}`;
        return { type: 'mixed', expr, result: quotient };
    }

    // 两层括号：[(a + b) × c] - d  或 [(a - b) × c] + d
    private typeD(forDemo: boolean): Equation {
        const a = rand(3, forDemo ? 8 : 15);
        const b = rand(1, a - 1);
        const c = rand(2, forDemo ? 4 : 6);
        const op1 = Math.random() < 0.5 ? '+' : '-';
        const mid = op1 === '+' ? a + b : a - b;
        const mid2 = mid * c;
        const d = rand(1, Math.max(1, Math.floor(mid2 / 2)));
        const op2 = Math.random() < 0.5 ? '+' : '-';
        const result = op2 === '+' ? mid2 + d : mid2 - d;
        const expr = `[ ( ${a} ${op1} ${b} ) × ${c} ] ${op2} ${d}`;
        return { type: 'mixed', expr, result };
    }

    getOptionCount(): number { return 8; }
    getCountingMax(): number { return 25; }
}