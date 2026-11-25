/**
 * Facada Noir - Caderno de Detetive (notebook.js)
 * Aba lateral de anotações, pistas e perfis do investigador.
 */

class NotebookUI {
    constructor() {
        this.active = false;
        this.selectedTab = 'clues'; // 'clues', 'profiles', 'map'
        this.selectedItemIndex = 0;
    }

    toggle() {
        this.active = !this.active;
        if (this.active && window.AudioSystem) {
            window.AudioSystem.playSfx('menu_select');
        }
    }

    open() {
        this.active = true;
    }

    close() {
        this.active = false;
    }

    handleInput(type, event) {
        if (!this.active) return;

        if (type === 'keydown') {
            if (event.key === 'Escape' || event.key === 'n' || event.key === 'N') {
                this.close();
            } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
                this.switchTab(-1);
            } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
                this.switchTab(1);
            } else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
                this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
            } else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
                this.selectedItemIndex++;
            }
        }
    }

    switchTab(dir) {
        const tabs = ['clues', 'profiles', 'map'];
        let idx = tabs.indexOf(this.selectedTab);
        idx = (idx + dir + tabs.length) % tabs.length;
        this.selectedTab = tabs[idx];
        this.selectedItemIndex = 0;
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('menu_move');
        }
    }

    update(dt) {
        // Atualizações periódicas do caderno
    }

    draw(renderer) {
        if (!this.active) return;

        const ctx = renderer.ctx;
        const w = renderer.width;
        const h = renderer.height;

        ctx.save();

        // Fundo semitransparente escuro estilo capa de couro / bloco de notas
        ctx.fillStyle = 'rgba(15, 15, 18, 0.95)';
        ctx.strokeStyle = CONFIG.colors.redBlood;
        ctx.lineWidth = 4;

        const boxW = w * 0.75;
        const boxH = h * 0.8;
        const boxX = (w - boxW) / 2;
        const boxY = (h - boxH) / 2;

        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Abas do Caderno
        const tabs = [
            { id: 'clues', label: 'PISTAS' },
            { id: 'profiles', label: 'PERFIS' },
            { id: 'map', label: 'MAPA' }
        ];

        let tabX = boxX + 30;
        const tabY = boxY - 30;

        tabs.forEach(tab => {
            const isSelected = (this.selectedTab === tab.id);
            ctx.fillStyle = isSelected ? CONFIG.colors.redAccent : CONFIG.colors.grayDark;
            ctx.fillRect(tabX, tabY, 110, 30);
            ctx.strokeStyle = CONFIG.colors.white;
            ctx.strokeRect(tabX, tabY, 110, 30);

            ctx.fillStyle = isSelected ? CONFIG.colors.white : CONFIG.colors.grayLight;
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(tab.label, tabX + 55, tabY + 20);

            tabX += 120;
        });

        // Título interno e conteúdo
        ctx.textAlign = 'left';
        ctx.fillStyle = CONFIG.colors.white;
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillText(`CADERNETA DO DETETIVE — ${this.selectedTab.toUpperCase()}`, boxX + 30, boxY + 45);

        ctx.strokeStyle = CONFIG.colors.grayDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 30, boxY + 60);
        ctx.lineTo(boxX + boxW - 30, boxY + 60);
        ctx.stroke();

        // Conteúdo por aba
        ctx.font = '16px "Courier New", monospace';
        if (this.selectedTab === 'clues') {
            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.fillText('Nenhuma pista detalhada registrada ainda.', boxX + 30, boxY + 100);
            ctx.fillText('Explore os cenários e colete provas para avançar.', boxX + 30, boxY + 130);
        } else if (this.selectedTab === 'profiles') {
            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.fillText('Testemunhas e suspeitos interrogados aparecerão aqui.', boxX + 30, boxY + 100);
        } else if (this.selectedTab === 'map') {
            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.fillText('[Mapa do Sétimo Distrito - Bloqueado temporariamente]', boxX + 30, boxY + 100);
        }

        // Rodapé de Ajuda
        ctx.fillStyle = CONFIG.colors.redAccent;
        ctx.font = '13px "Courier New", monospace';
        ctx.fillText('[A/D ou Setas Esquerda/Direita] Mudar Aba   [N ou ESC] Fechar Caderno', boxX + 30, boxY + boxH - 25);

        ctx.restore();
    }
}

window.NotebookUI = NotebookUI;