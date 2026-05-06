import { LevelStrategy } from '../levels/LevelStrategy';
import { EnlightenmentLevel } from '../levels/EnlightenmentLevel';
import { PrimaryLevel } from '../levels/PrimaryLevel';
import { AdvancedLevel } from '../levels/AdvancedLevel';
import { MultiplicationLevel } from '../levels/MultiplicationLevel';
import { MultiplicationAdvLevel } from '../levels/MultiplicationAdvLevel';
import { MixedLevel } from '../levels/MixedLevel';
import { LevelId } from '../core/types';

const strategies: LevelStrategy[] = [
    new EnlightenmentLevel(),
    new PrimaryLevel(),
    new AdvancedLevel(),
    new MultiplicationLevel(),
    new MultiplicationAdvLevel(),
    new MixedLevel(),
];

export function getLevelStrategy(levelId: LevelId): LevelStrategy {
    return strategies[levelId];
}