export class ScoreCalculator {
    constructor(
        private scoreCorrect: number,
        private scoreWrong: number,
        private stars: number = 0
    ) {}

    addStars(points: number): number {
        this.stars = Math.max(0, this.stars + points);
        return this.stars;
    }

    getStars(): number {
        return this.stars;
    }

    getCorrectPoints(): number {
        return this.scoreCorrect;
    }

    getWrongPoints(): number {
        return -this.scoreWrong;
    }
}