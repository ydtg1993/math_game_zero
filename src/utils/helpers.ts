export function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 将 0~9999 的整数转为中文数字（简单版）
 * 例如：5 -> "五", 23 -> "二十三", 108 -> "一百零八"
 */
export function numberToChinese(n: number): string {
    if (!Number.isInteger(n) || n < 0) return n.toString();
    if (n === 0) return '零';
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千'];
    const parts: string[] = [];
    let unitIndex = 0;
    let temp = n;
    while (temp > 0) {
        const digit = temp % 10;
        if (digit !== 0) {
            parts.unshift(units[unitIndex]);
            parts.unshift(digits[digit]);
        } else if (parts.length > 0 && parts[0] !== '零') {
            parts.unshift('零');
        }
        temp = Math.floor(temp / 10);
        unitIndex++;
    }
    // 处理一十 -> 十
    if (parts[0] === '一' && parts[1] === '十') {
        parts.shift();
    }
    // 去掉末尾多余的零
    while (parts[parts.length - 1] === '零') {
        parts.pop();
    }
    return parts.join('');
}