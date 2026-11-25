/**
 * Facada Noir - Cena de Transição / Cutscene (cutscene.js)
 * Gerencia diálogos cinematográficos, transições de narrativa e créditos.
 */

window.CutsceneScene = class CutsceneScene extends SceneBase {
    constructor(key = 'cutscene') {
        super(key);
        this.script = [];
        this.currentIndex = 0;
        this.timer = 0;
        this.textAlpha = 0;
        this.onFinished = null;
    }

    init(game, scriptData = null, onFinished = null) {
        super.init(game);
        this.script = scriptData || [
            { text: "A cidade nunca dorme. Ela apenas finge estar morta.", delay: 4 },
            { text: "Chuva ácida lavando o asfalto. Sangue fresco na calçada.", delay: 4 },
            { text: "E lá estava eu... bem no meio da facada.", delay: 5 }
        ];
        this.currentIndex = 0;
        this.timer = 0;
        this.textAlpha = 0;
        this.onFinished = onFinished;
    }

    update(dt, game) {
        this.timer += dt;
        
        // Efeito de fade in do texto atual
        if (this.textAlpha < 1) {
            this.textAlpha = Math.min(1, this.textAlpha + dt * 1.5);
        }

        const currentLine = this.script[this.currentIndex];
        const lineDelay = currentLine ? (currentLine.delay || 4) : 4;

        if (this.timer >= lineDelay) {
            this.timer = 0;
            this.textAlpha = 0;
            this.currentIndex++;

            if (this.currentIndex >= this.script.length) {
                if (this.onFinished) {
                    this.onFinished(game);
                } else if (game && game.stateMachine) {
                    game.stateMachine.change('playing');
                }
            }
        }
    }

    draw(ctx, renderer) {
        ctx.save();
        
        // Fundo totalmente escuro noir
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const currentLine = this.script[this.currentIndex];
        if (currentLine) {
            ctx.fillStyle = `rgba(244, 244, 244, ${this.textAlpha})`;
            ctx.font = '22px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            this.wrapTextCenter(ctx, currentLine.text, ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width - 160, 32);
        }

        // Rodapé informativo
        ctx.fillStyle = CONFIG.colors.grayMid || '#777';
        ctx.font = '13px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[ESPAÇO para pular]', ctx.canvas.width - 30, ctx.canvas.height - 30);

        ctx.restore();
    }

    wrapTextCenter(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        let startY = y - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, startY + (i * lineHeight));
        }
    }

    handleInput(type, event, game) {
        if (type === 'keydown' && (event.key === ' ' || event.key === 'Enter')) {
            // Pula para a próxima linha ou finaliza
            this.timer = 0;
            this.textAlpha = 0;
            this.currentIndex++;
            if (this.currentIndex >= this.script.length) {
                if (this.onFinished) {
                    this.onFinished(game);
                } else if (game && game.stateMachine) {
                    game.stateMachine.change('playing');
                }
            }
        }
    }
};