import { SoundName } from '../core/types';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private musicTimer: ReturnType<typeof setInterval> | null = null;
    private musicOn = true;
    private notes = [261.63, 329.63, 392.00, 523.25];
    private noteIdx = 0;

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

    startBgMusic(): void {
        this.stopBgMusic();
        this.noteIdx = 0;
        this.musicTimer = setInterval(() => {
            if (this.musicOn) {
                this.tone(this.notes[this.noteIdx % this.notes.length], 0.25, 'sine', 0.08);
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
}