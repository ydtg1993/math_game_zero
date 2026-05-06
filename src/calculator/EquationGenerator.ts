import { Equation } from '../core/types';
import { LevelStrategy } from '../levels/LevelStrategy';

export class EquationGenerator {
    constructor(private strategy: LevelStrategy) {}

    generate(forDemo: boolean): Equation {
        return this.strategy.generateEquation(forDemo);
    }
}