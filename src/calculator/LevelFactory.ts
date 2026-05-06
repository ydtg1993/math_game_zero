import { LevelStrategy } from '../levels/LevelStrategy';
import { FunMathLevel } from '../levels/FunMathLevel';
import { PrimaryLevel } from '../levels/PrimaryLevel';
import { AdvancedLevel } from '../levels/AdvancedLevel';
import { MultiplicationLevel } from '../levels/MultiplicationLevel';
import { MultiplicationAdvLevel } from '../levels/MultiplicationAdvLevel';
import { MixedLevel } from '../levels/MixedLevel';
import { LevelId } from '../core/types';

const strategies: LevelStrategy[] = [
    new FunMathLevel(),       // 0 - 趣味数学
    new PrimaryLevel(),       // 1 - 初级
    new AdvancedLevel(),      // 2 - 高级
    new MultiplicationLevel(),// 3 - 乘法入门
    new MultiplicationAdvLevel(), // 4 - 乘除进阶
    new MixedLevel(),         // 5 - 四则运算
];

export function getLevelStrategy(levelId: LevelId): LevelStrategy {
    const strategy = strategies[levelId];
    if (!strategy) throw new Error(`Unknown level: ${levelId}`);
    return strategy;
}