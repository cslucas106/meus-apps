/**
 * Facada Noir - Transição de Cenas (transition.js)
 * Gerencia efeitos visuais de fade in/out e transição entre cenas.
 */

class TransitionSystem {
    constructor() {
        this.active = false;
        this.type = 'fade'; // 'fade' ou 'iris'
        this.duration = 0.5; // duração total em segundos
        this.timer = 0;
        this.state = 'idle'; // 'in', 'out', 'idle'
        this.onComplete = null;
    }

    start(type = 'fade', duration = 0.5, onComplete = null) {
        this.active = true;
        this.type = type;
        this.duration = duration;
        this.timer = 0;
        this.state = 'out'; // escurecendo
        this.onComplete = onComplete;
    }

    update(dt) {
        if (!this.active) return;

        this.timer += dt;
        const halfDuration = this.duration / 2;

        if (this.state === 'out' && this.timer >= halfDuration) {
            this.state = 'in'; // clareando
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }

        if (this.timer >= this.duration) {
            this.active = false;
            this.state = 'idle';
            this.timer = 0;
        }
    }

    draw(renderer) {
        if (!this.active) return;

        const ctx = renderer.ctx;
        const w = renderer.width;
        const h = renderer.height;
        const halfDuration = this.duration / 2;

        let alpha = 0;
        if (this.state === 'out') {
            alpha = Math.min(1, this.timer / halfDuration);
        } else if (this.state === 'in') {
            alpha = Math.max(0, 1 - ((this.timer - halfDuration) / halfDuration));
        }

        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

window.TransitionSystem = TransitionSystem;