/**
 * Facada Noir - Motor Principal (Game Loop & State Manager)
 */
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60; // 60 FPS fixo para física/atualização
        this.isRunning = false;
        
        // Estado atual do jogo (menu, playing, paused, dialogue, investigation, gameover, credits)
        this.currentState = 'menu';
        this.states = {};
        
        // Dimensões lógicas do canvas
        this.width = 1280;
        this.height = 720;
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas principal não encontrado!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());

        // Inicializa subsistemas básicos se existirem
        if (window.Utils) {
            console.log('Utils carregado com sucesso.');
        }

        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    resize() {
        if (!this.canvas) return;
        
        // Mantém proporção 16:9 ajustada à tela
        const scaleX = window.innerWidth / this.width;
        const scaleY = window.innerHeight / this.height;
        const scale = Math.min(scaleX, scaleY);

        this.canvas.style.width = `${this.width * scale}px`;
        this.canvas.style.height = `${this.height * scale}px`;
        
        // Garante resolução interna consistente
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    changeState(stateName) {
        if (this.states[this.currentState] && typeof this.states[this.currentState].exit === 'function') {
            this.states[this.currentState].exit();
        }

        this.currentState = stateName;

        if (this.states[this.currentState] && typeof this.states[this.currentState].enter === 'function') {
            this.states[this.currentState].enter();
        }
    }

    registerState(name, stateObj) {
        this.states[name] = stateObj;
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        let frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Limita o delta time para evitar saltos bruscos se a aba perder foco
        if (frameTime > 0.25) {
            frameTime = 0.25;
        }

        this.accumulator += frameTime;

        // Atualização em passos fixos
        while (this.accumulator >= this.step) {
            this.update(this.step);
            this.accumulator -= this.step;
        }

        // Renderização interpolada ou direta
        this.render(this.accumulator / this.step);

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        if (this.states[this.currentState] && typeof this.states[this.currentState].update === 'function') {
            this.states[this.currentState].update(dt);
        }
    }

    render(alpha) {
        if (!this.ctx) return;

        // Limpa a tela (preto total noir)
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.states[this.currentState] && typeof this.states[this.currentState].render === 'function') {
            this.states[this.currentState].render(this.ctx, alpha);
        } else {
            // Fallback visual caso o estado atual não tenha render definido
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`ESTADO: ${this.currentState.toUpperCase()}`, this.width / 2, this.height / 2);
        }
    }
}

// Instância global do motor
window.GameEngine = new Game();

window.addEventListener('DOMContentLoaded', () => {
    window.GameEngine.init();
});