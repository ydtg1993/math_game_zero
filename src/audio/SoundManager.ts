import { SoundName, Equation } from '../core/types';
import { numberToChinese } from '../utils/helpers';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private musicTimer: ReturnType<typeof setInterval> | null = null;
    private musicOn = true;
    private notes = [261.63, 329.63, 392.00, 523.25];   // 最初的四音旋律
    private noteIdx = 0;

    // 语音相关
    private preferredVoice: SpeechSynthesisVoice | null = null;

    constructor() {
        this.loadVoices();
    }

    private loadVoices(): void {
        if (!('speechSynthesis' in window)) return;

        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            let preferred = voices.find(v => v.lang === 'zh-CN' && v.name.includes('小北'));
            if (!preferred) {
                preferred = voices.find(v => v.lang === 'zh-CN' && v.name.includes('Tingting'));
            }
            if (!preferred) {
                preferred = voices.find(
                    v =>
                        v.lang === 'zh-CN' &&
                        (v.name.includes('女') || v.name.includes('girl'))
                );
            }
            if (preferred) {
                this.preferredVoice = preferred;
                console.log(`🎙️ 使用语音: ${preferred.name}`);
            }
        };

        if (speechSynthesis.getVoices().length) {
            setVoice();
        } else {
            speechSynthesis.addEventListener('voiceschanged', () => setVoice(), { once: true });
        }
    }

    private getCtx(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    }

    private tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, ramp = true): void {
        try {
            const c = this.getCtx();
            const t = c.currentTime;
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(vol, t);
            if (ramp) g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            o.connect(g);
            g.connect(c.destination);
            o.start(t);
            o.stop(t + dur);
        } catch {}
    }

    play(name: SoundName): void {
        switch (name) {
            case 'click': this.tone(660, 0.06, 'square', 0.12); break;
            case 'fruitAppear': this.tone(880, 0.12, 'sine', 0.2); setTimeout(() => this.tone(1100, 0.08, 'sine', 0.15), 50); break;
            case 'fruitDisappear': this.tone(350, 0.1, 'triangle', 0.18); break;
            case 'correct': [523,659,784,1047].forEach((f,i) => setTimeout(() => this.tone(f, 0.16, 'sine', 0.25), i*70)); break;
            case 'wrong': this.tone(200, 0.25, 'square', 0.12); setTimeout(() => this.tone(150, 0.2, 'square', 0.1), 150); break;
            case 'confetti': [523,659,784,1047,784,1047].forEach((f,i) => setTimeout(() => this.tone(f, 0.13, 'sine', 0.18), i*65)); break;
        }
    }

    /** 最初版轻快背景音乐 */
    startBgMusic(): void {
        this.stopBgMusic();
        this.noteIdx = 0;
        this.musicTimer = setInterval(() => {
            if (this.musicOn) {
                this.tone(this.notes[this.noteIdx % this.notes.length], 0.25, 'sine', 0.08, true);
                this.noteIdx++;
            }
        }, 480);
    }

    stopBgMusic(): void {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }

    setMusic(on: boolean, btn?: HTMLElement): void {
        this.musicOn = on;
        if (on) this.startBgMusic();
        else this.stopBgMusic();
        if (btn) {
            btn.textContent = on ? '🎶' : '🎵';
            btn.classList.toggle('off', !on);
        }
    }

    toggle(btn?: HTMLElement): void {
        this.setMusic(!this.musicOn, btn);
    }

    isMusicOn(): boolean {
        return this.musicOn;
    }

    initOnInteraction(): void {
        this.getCtx();
        if (this.musicOn && !this.musicTimer) this.startBgMusic();
    }

    public speakEquation(eq: Equation): void {
        const text = this.buildEquationText(eq);
        this.speak(text);
    }

    public speakText(text: string): void {
        this.speak(text);
    }

    private speak(text: string): void {
        if (!text || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.75;
        utterance.pitch = 1.4;
        if (this.preferredVoice) {
            utterance.voice = this.preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
    }

    private buildEquationText(eq: Equation): string {
        if (eq.type === 'mixed') {
            let expr = eq.expr ?? '';
            expr = expr.replace(/×/g, '乘以')
                .replace(/÷/g, '除以')
                .replace(/\-/g, '减去')
                .replace(/\+/g, '加上')
                .replace(/\(/g, '左括号')
                .replace(/\)/g, '右括号')
                .replace(/\[/g, '左括号')
                .replace(/\]/g, '右括号');
            return expr + '等于多少？';
        } else {
            const opMap: Record<string, string> = {
                '+': '加', '−': '减', '×': '乘', '÷': '除以'
            };
            const opChinese = opMap[eq.op!] ?? '';
            const aChinese = numberToChinese(eq.a!);
            const bChinese = numberToChinese(eq.b!);
            return `${aChinese} ${opChinese} ${bChinese} 等于多少？`;
        }
    }
}