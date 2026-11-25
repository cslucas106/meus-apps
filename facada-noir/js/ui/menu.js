/**
 * Facada Noir - Menu Principal (menu.js)
 * Gerencia o menu inicial, opções, crédito e transição para o jogo.
 */

class MenuUI {
    constructor() {
        this.selectedOption = 0;
        this.options = ['NOVO JOGO', 'CONTINUAR', 'OPÇÕES', 'CRÉDITOS'];
        this.activeSubmenu = null; // null, 'options', 'credits'
    }

    handleInput(type, event) {
        if (type === 'keydown') {
            if (this.activeSubmenu) {
                if (event.key === 'Escape' || event.key === 'Backspace') {
                    this.activeSubmenu = null;
                }
                return;
            }

            if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
                this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
            } else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
                this.selectedOption = (this.selectedOption + 1) % this.options.length;
            } else if (event.key === 'Enter' || event.key === ' ') {
                this.selectOption();
            }
        }
    }

    selectOption() {
        const choice = this.options[this.selectedOption];
        if (choice === 'NOVO JOGO') {
            if (window.gameInstance) {
                window.gameInstance.startNewGame();
            }
        } else if (choice === 'CONTINUAR') {
            if (window.gameInstance) {
                window.gameInstance.loadGame();
            }
        } else if (choice === 'OPÇÕES') {
            this.activeSubmenu = 'options';
        } else if (choice === 'CRÉDITOS') {
            this.activeSubmenu = 'credits';
        }
    }

    update(dt) {
        // Animações sutis de fundo ou partículas podem vir aqui
    }

    draw(renderer) {
        const ctx = renderer.ctx;
        const w = renderer.width;
        const h = renderer.height;

        ctx.save();

        // Fundo Noir Escuro
        ctx.fillStyle = CONFIG.colors.bg;
        ctx.fillRect(0, 0, w, h);

        // Vinheta e efeito atmosférico
        ctx.fillStyle = CONFIG.colors.redBlood;
        ctx.font = 'bold 64px "Courier New", monospace';
        ctx.textAlign = 'center';

        // Título com sombra vermelha
        ctx.shadowColor = CONFIG.colors.redAccent;
        ctx.shadowBlur = 20;
        ctx.fillText('FACADA NOIR', w / 2, h / 3 - 30);

        ctx.shadowBlur = 0;
        ctx.fillStyle = CONFIG.colors.grayMid;
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText('Uma investigação nas sombras do Sétimo Distrito', w / 2, h / 3 + 20);

        if (this.activeSubmenu === 'options') {
            // Submenu Opções
            ctx.fillStyle = CONFIG.colors.white;
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillText('OPÇÕES', w / 2, h / 2 - 40);

            ctx.font = '16px "Courier New", monospace';
            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.fillText('Áudio e Gráficos: Padrão (Pressione ESC para voltar)', w / 2, h / 2 + 20);
        } else if (this.activeSubmenu === 'credits') {
            // Submenu Créditos
            ctx.fillStyle = CONFIG.colors.white;
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillText('CRÉDITOS', w / 2, h / 2 - 60);

            ctx.font = '16px "Courier New", monospace';
            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.fillText('Desenvolvido para a Jam PocketCode / Meus Apps', w / 2, h / 2 - 10);
            ctx.fillText('Estilo Visual: Noir / Detective Thriller', w / 2, h / 2 + 20);
            ctx.fillText('(Pressione ESC para voltar)', w / 2, h / 2 + 70);
        } else {
            // Menu Principal
            let startY = h / 2 + 20;
            for (let i = 0; i < this.options.length; i++) {
                const isSelected = (i === this.selectedOption);
                ctx.fillStyle = isSelected ? CONFIG.colors.redAccent : CONFIG.colors.white;
                ctx.font = (isSelected ? 'bold ' : '') + '20px "Courier New", monospace';
                
                const text = isSelected ? `> ${this.options[i]} <` : this.options[i];
                ctx.fillText(text, w / 2, startY + (i * 45));
            }

            // Rodapé
            ctx.fillStyle = CONFIG.colors.grayMid;
            ctx.font = '14px "Courier New", monospace';
            ctx.fillText('Use W/S ou Setas para navegar, Enter para selecionar', w / 2, h - 50);
        }

        ctx.restore();
    }
}

window.MenuUI = MenuUI;