import { LevelStrategy } from '../levels/LevelStrategy';
import { FunMathLevel } from '../levels/FunMathLevel';
import { PrimaryLevel } from '../levels/PrimaryLevel';
import { AdvancedLevel } from '../levels/AdvancedLevel';
import { MultiplicationLevel } from '../levels/MultiplicationLevel';
import { MultiplicationAdvLevel } from '../levels/MultiplicationAdvLevel';
import { MixedLevel } from '../levels/MixedLevel';
import { LevelId } from '../core/types';
import {EnlightenmentLevel} from "../levels/EnlightenmentLevel";

const strategies: LevelStrategy[] = [
    new FunMathLevel(),             // 0 - 趣味数学
    new EnlightenmentLevel(),       // 1 - 启蒙
    new PrimaryLevel(),             // 2 - 初级
    new AdvancedLevel(),            // 3 - 高级
    new MultiplicationLevel(),      // 4 - 乘法入门
    new MultiplicationAdvLevel(),   // 5 - 乘除进阶
    new MixedLevel(),               // 6 - 四则运算
];

export function getLevelStrategy(levelId: LevelId): LevelStrategy {
    const strategy = strategies[levelId];
    if (!strategy) throw new Error(`Unknown level: ${levelId}`);
    return strategy;
}