// 算式模型
export interface Equation {
    type: 'add' | 'sub' | 'mul' | 'div' | 'mixed';
    a?: number;
    b?: number;
    op?: string;
    result: number;
    expr?: string;        // 混合运算表达式
}

// 等级策略配置与规则
export interface LevelConfig {
    id: number;
    name: string;
    scoreCorrect: number;
    scoreWrong: number;
}

// 选项生成参数
export interface OptionGenParams {
    correct: number;
    maxValue: number;
    count: number;
}

// 音效名称枚举
export type SoundName = 'click' | 'fruitAppear' | 'fruitDisappear' | 'correct' | 'wrong' | 'confetti';

// 游戏模式
export type TabMode = 'demo' | 'quiz' | 'counting';

// 等级ID
export type LevelId = 0 | 1 | 2 | 3 | 4 | 5;