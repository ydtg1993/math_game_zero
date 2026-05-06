import { Equation } from '../core/types';

export interface LevelStrategy {
    readonly id: number;
    readonly name: string;
    readonly scoreCorrect: number;
    readonly scoreWrong: number;

    /** 生成算式（可用于演示或答题） */
    generateEquation(forDemo: boolean): Equation;

    /** 选项数量 */
    getOptionCount(): number;

    /** 生成数数问题时需要的数值上限 */
    getCountingMax(): number;

    /** 可选：提供数数模式使用的动物表情数组，返回 undefined 表示使用单动物随机 */
    getCountingEmojis?(): string[];
}