/**
 * Facada Noir - Sistema de Inventário (inventory.js)
 * Gerenciamento de itens do detetive (chaves, documentos, faca, lanterninha)
 * com suporte a inspeção, combinação e uso no mundo.
 */

window.InventorySystem = class InventorySystem {
    constructor() {
        this.active = false;
        this.itemsData = {}; // Definições carregadas (id -> {name, description, sprite, combinableWith, result})
        this.items = []; // Itens atuais no inventário do jogador: [{id, count, data}]
        this.selectedItemIndex = 0;
        this.inspectingItem = null;
    }

    init(itemsJson) {
        this.itemsData = itemsJson || {};
        this.items = [];
        this.selectedItemIndex = 0;
        this.inspectingItem = null;
    }

    open() {
        this.active = true;
        this.selectedItemIndex = 0;
        this.inspectingItem = null;
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('menu_select');
        }
    }

    close() {
        this.active = false;
        this.inspectingItem = null;
    }

    toggle() {
        if (this.active) {
            this.close();
        } else {
            this.open();
        }
    }

    addItem(itemId, count = 1) {
        const itemDef = this.itemsData[itemId];
        if (!itemDef) {
            console.warn(`Item desconhecido: ${itemId}`);
            return false;
        }

        // Verificar se já possui o item (caso empilhável ou único)
        const existing = this.items.find(i => i.id === itemId);
        if (existing) {
            existing.count += count;
        } else {
            this.items.push({
                id: itemId,
                count: count,
                ...itemDef
            });
        }

        if (window.AudioSystem) {
            window.AudioSystem.playSfx('pickup');
        }
        console.log(`Item adicionado: ${itemId} (x${count})`);
        return true;
    }

    removeItem(itemId, count = 1) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            this.items[index].count -= count;
            if (this.items[index].count <= 0) {
                this.items.splice(index, 1);
                if (this.selectedItemIndex >= this.items.length) {
                    this.selectedItemIndex = Math.max(0, this.items.length - 1);
                }
            }
            return true;
        }
        return false;
    }

    hasItem(itemId, count = 1) {
        const item = this.items.find(i => i.id === itemId);
        return item && item.count >= count;
    }

    update(dt) {
        if (!this.active) return;

        const input = window.Input;
        if (!input) return;

        // Fechar com ESC ou botão de inventário
        if (input.isJustPressed('escape') || input.isJustPressed('inventory')) {
            this.close();
            return;
        }

        // Navegação pelo inventário com setas ou WASD
        if (this.items.length > 0) {
            if (input.isJustPressed('up') || input.isJustPressed('w')) {
                this.selectedItemIndex = (this.selectedItemIndex - 1 + this.items.length) % this.items.length;
                if (window.AudioSystem) window.AudioSystem.playSfx('menu_move');
            }
            if (input.isJustPressed('down') || input.isJustPressed('s')) {
                this.selectedItemIndex = (this.selectedItemIndex + 1) % this.items.length;
                if (window.AudioSystem) window.AudioSystem.playSfx('menu_move');
            }

            // Usar ou inspecionar item com Enter / Espaço
            if (input.isJustPressed('enter') || input.isJustPressed('space') || input.isJustPressed('interact')) {
                const currentItem = this.items[this.selectedItemIndex];
                if (currentItem) {
                    this.inspectItem(currentItem);
                }
            }
        }
    }

    inspectItem(item) {
        this.inspectingItem = item;
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('menu_select');
        }
        console.islands && console.log(`Inspecionando item: ${item.name}`);
    }

    draw(ctx) {
        if (!this.active) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.save();

        // Fundo semi-transparente escuro
        ctx.fillStyle = 'rgba(10, 10, 12, 0.95)';
        ctx.fillRect(0, 0, w, h);

        // Painel central
        const panelW = 800;
        const panelH = 500;
        const panelX = (w - panelW) / 2;
        const panelY = (h - panelH) / 2;

        ctx.fillStyle = '#141414';
        ctx.strokeStyle = '#ff1a1a';
        ctx.lineWidth = 2;
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        // Título
        ctx.fillStyle = '#ff1a1a';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('INVENTÁRIO DO DETETIVE', panelX + 30, panelY + 45);

        ctx.fillStyle = '#777777';
        ctx.font = '13px monospace';
        ctx.fillText('[Setas/WASD: Navegar | ENTER: Inspecionar | ESC: Fechar]', panelX + 30, panelY + 70);

        // Lista de itens à esquerda
        const listX = panelX + 30;
        const listY = panelY + 100;
        const listW = 340;
        const listH = 360;

        ctx.strokeStyle = '#333333';
        ctx.strokeRect(listX, listY, listW, listH);

        if (this.items.length === 0) {
            ctx.fillStyle = '#777777';
            ctx.font = '14px monospace';
            ctx.fillText('Inventário vazio.', listX + 20, listY + 40);
        } else {
            const itemHeight = 45;
            this.items.forEach((item, index) => {
                const itemY = listY + 10 + (index * itemHeight);
                const isSelected = (index === this.selectedItemIndex);

                ctx.fillStyle = isSelected ? '#261111' : '#1c1c1c';
                ctx.strokeStyle = isSelected ? '#ff1a1a' : '#2a2a2a';
                ctx.fillRect(listX + 10, itemY, listW - 20, itemHeight - 5);
                ctx.strokeRect(listX + 10, itemY, listW - 20, itemHeight - 5);

                // Nome do item
                ctx.fillStyle = isSelected ? '#ff1a1a' : '#f4f4f4';
                ctx.font = 'bold 14px monospace';
                ctx.fillText(item.name || item.id, listX + 25, itemY + 27);

                // Quantidade se > 1
                if (item.count > 1) {
                    ctx.fillStyle = '#aaaaaa';
                    ctx.font = '12px monospace';
                    ctx.fillText(`x${item.count}`, listX + listW - 55, itemY + 27);
                }
            });
        }

        // Detalhes do item selecionado à direita
        const detailX = panelX + 400;
        const detailY = panelY + 100;
        const detailW = 370;
        const detailH = 360;

        ctx.strokeStyle = '#333333';
        ctx.strokeRect(detailX, detailY, detailW, detailH);

        const currentItem = this.items[this.selectedItemIndex];
        if (currentItem) {
            ctx.fillStyle = '#f4f4f4';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(currentItem.name || currentItem.id, detailX + 25, detailY + 40);

            // Descrição
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '14px monospace';
            this.wrapText(ctx, currentItem.description || 'Nenhuma descrição disponível.', detailX + 25, detailY + 80, detailW - 50, 20);

            // Instrução de uso
            ctx.fillStyle = '#ff1a1a';
            ctx.font = '12px monospace';
            ctx.fillText('Pressione ENTER para inspecionar detalhes.', detailX + 25, detailY + detailH - 30);
        } else {
            ctx.fillStyle = '#555555';
            ctx.font = '14px monospace';
            ctx.fillText('Selecione um item para ver detalhes.', detailX + 25, detailY + 40);
        }

        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
};