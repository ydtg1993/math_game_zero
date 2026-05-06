import { rand, shuffle } from '../utils/helpers';
import { OptionGenParams } from '../core/types';

export class OptionGenerator {
    static generate(params: OptionGenParams): number[] {
        const { correct, maxValue, count } = params;
        const opts = new Set<number>([correct]);
        let attempts = 0;
        while (opts.size < count && attempts < 50) {
            const offset = rand(1, Math.max(1, Math.floor(maxValue / 10) || 5));
            let candidate = correct + (Math.random() < 0.5 ? offset : -offset);
            candidate = Math.max(0, Math.min(maxValue, Math.round(candidate)));
            opts.add(candidate);
            attempts++;
        }
        while (opts.size < count) opts.add(rand(0, maxValue));
        return shuffle([...opts]).slice(0, count);
    }
}