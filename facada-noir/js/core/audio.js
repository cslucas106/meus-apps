/**
 * facada-noir/js/core/audio.js
 * Gerenciador de Áudio Web Audio API (música ambiente, SFX, master volume, crossfade)
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.muted = false;
        this.currentMusic = null;
        this.initialized = false;
        this.sounds = new Map();
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();

            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);

            this.masterGain.gain.value = 0.7;
            this.musicGain.gain.value = 0.5;
            this.sfxGain.gain.value = 0.8;

            this.initialized = true;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn('Web Audio API não suportada ou bloqueada:', e);
        }
    }

    setMasterVolume(val) {
        if (!this.masterGain) return;
        this.masterGain.gain.value = clamp(val, 0, 1);
    }

    setMusicVolume(val) {
        if (!this.musicGain) return;
        this.musicGain.gain.value = clamp(val, 0, 1);
    }

    setSfxVolume(val) {
        if (!this.sfxGain) return;
        this.sfxGain.gain.value = clamp(val, 0, 1);
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.7;
        }
        return this.muted;
    }

    playSfx(type) {
        if (!this.initialized || this.muted) return;
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
            case 'step':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
                break;

            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.03);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
                break;

            case 'stab': // "Facada" / Hit crítico
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
                gain.gain.setValueAtTime(0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'pickup':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'flashlight':
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.setValueAtTime(600, now + 0.05);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            default:
                break;
        }
    }

    playAmbientNoir() {
        if (!this.initialized || this.muted) return;
        // Som ambiente de chuva/rua noir gerado proceduralmente por ruído branco filtrado
        if (this.currentAmbient) return; // Já toca

        try {
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Som abafado de chuva/vento

            const ambientGain = this.ctx.createGain();
            ambientGain.gain.value = 0.15;

            noise.connect(filter);
            filter.connect(ambientGain);
            ambientGain.connect(this.musicGain);

            noise.start();
            this.currentAmbient = { source: noise, gain: ambientGain };
        } catch (e) {
            console.warn('Erro ao gerar som ambiente:', e);
        }
    }

    stopAmbient() {
        if (this.currentAmbient) {
            try {
                this.currentAmbient.source.stop();
            } catch (e) {}
            this.currentAmbient = null;
        }
    }
}

const audio = new AudioManager();