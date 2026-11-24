/**
 * Facada Noir - Sistema de Investigação (investigation.js)
 * Quadro de pistas (mind map), conexões, deduções e momento eureka.
 */

window.InvestigationSystem = class InvestigationSystem {
    constructor() {
        this.active = false;
        this.cluesData = {}; // Definições carregadas (id -> {name, description, category, sprite, unlocked})
        this.unlockedClues = []; // IDs de pistas descobertas
        this.connections = []; // Pares de IDs conectados pelo jogador: [{id1, id2, solved: false}]
        this.deductions = []; // Deduções possíveis ou resolvidas
        
        // UI e Interação do Quadro
        this.selectedClueId = null;
        this.connectingClueId = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Posições no quadro mental (id -> {x, y})
        this.nodePositions = {};
    }

    init(cluesJson) {
        this.cluesData = cluesJson || {};
        this.unlockedClues = [];
        this.connections = [];
        this.deductions = [];
        this.nodePositions = {};

        // Inicializar posições padrão em grid circular/espalhado para as pistas conhecidas
        let index = 0;
        const radius = 220;
        const centerX = 640;
        const centerY = 360;

        for (const id in this.cluesData) {
            const angle = (index / Math.max(1, Object.keys(this.cluesData).length)) * Math.PI * 2;
            this.nodePositions[id] = {
                x: centerX + Math.cos(angle) * radius + Utils.rand(-50, 50),
                y: centerY + Math.sin(angle) * radius + Utils.rand(-50, 50)
            };
            index++;
        }
    }

    open() {
        this.active = true;
        this.selectedClueId = null;
        this.connectingClueId = null;
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('menu_select');
        }
    }

    close() {
        this.active = false;
        this.selectedClueId = null;
        this.connectingClueId = null;
    }

    toggle() {
        if (this.active) {
            this.close();
        } else {
            this.open();
        }
    }

    addClue(clueId) {
        if (!this.cluesData[clueId]) {
            console.warn(`Pista desconhecida: ${clueId}`);
            return false;
        }

        if (!this.unlockedClues.includes(clueId)) {
            this.unlockedClues.push(clueId);
            if (window.AudioSystem) {
                window.AudioSystem.playSfx('clue_found');
            }
            console.log(`Pista descoberta: ${clueId}`);
            return true;
        }
        return false;
    }

    hasClue(clueId) {
        return this.unlockedClues.includes(clueId);
    }

    connectClues(id1, id2) {
        if (id1 === id2) return false;

        // Verificar se já existe conexão
        const exists = this.connections.some(c => 
            (c.id1 === id1 && c.id2 === id2) || (c.id1 === id2 && c.id2 === id1)
        );

        if (!exists) {
            const connection = { id1, id2, solved: false };
            
            // Verificar se esta conexão forma uma dedução válida
            const clueObj = this.cluesData[id1];
            if (clueObj && clueObj.connections && clueObj.connections.includes(id2)) {
                connection.solved = true;
                this.triggerEureka(id1, id2);
            } else {
                const clueObj2 = this.cluesData[id2];
                if (clueObj2 && clueObj2.connections && clueObj2.connections.includes(id1)) {
                    connection.solved = true;
                    this.triggerEureka(id2, id1);
                } else {
                    if (window.AudioSystem) window.AudioSystem.playSfx('menu_move');
                }
            }

            this.connections.push(connection);
            return true;
        }
        return false;
    }

    triggerEureka(id1, id2) {
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('eureka');
        }
        console.log(`Momento Eureka! Conexão correta entre ${id1} e ${id2}`);
        
        // Notificar o jogo sobre a dedução resolvida
        if (window.Game && window.Game.handleDeductionSolved) {
            window.Game.handleDeductionSolved(id1, id2);
        }
    }

    update(dt) {
        if (!this.active) return;

        const input = window.Input;
        if (!input) return;

        // Fechar com ESC ou botão de investigação
        if (input.isJustPressed('escape') || input.isJustPressed('investigation')) {
            this.close();
            return;
        }

        // Mouse pan e click nos nós de pistas
        const mouse = input.getMousePos();
        
        if (input.isMouseJustPressed(0)) {
            // Verificar clique em algum nó de pista desbloqueada
            let clickedClueId = null;
            for (const id of this.unlockedClues) {
                const pos = this.nodePositions[id];
                if (!pos) continue;
                const screenX = pos.x + this.offsetX;
                const screenY = pos.y + this.offsetY;
                const dist = Utils.distance(mouse.x, mouse.y, screenX, screenY);
                if (dist <= 40) {
                    clickedClueId = id;
                    break;
                }
            }

            if (clickedClueId) {
                if (!this.selectedClueId) {
                    this.selectedClueId = clickedClueId;
                } else if (this.selectedClueId === clickedClueId) {
                    this.selectedClueId = null; // Desmarcar
                } else {
                    // Tentar conectar a pista selecionada com a clicada
                    this.connectClues(this.selectedClueId, clickedClueId);
                    this.selectedClueId = null;
                }
            } else {
                // Iniciar arrastar o quadro (pan)
                this.isDragging = true;
                this.dragStartX = mouse.x - this.offsetX;
                this.dragStartY = mouse.y - this.offsetY;
            }
        }

        if (input.isMouseDown(0) && this.isDragging) {
            this.offsetX = mouse.x - this.dragStartX;
            this.offsetY = mouse.y - this.dragStartY;
        } else if (!input.isMouseDown(0)) {
            this.isDragging = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.save();

        // Fundo escuro texturizado do quadro de investigação
        ctx.fillStyle = 'rgba(5, 5, 8, 0.96)';
        ctx.fillRect(0, 0, w, h);

        // Grade sutil de fundo
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.4)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        const startX = this.offsetX % gridSize;
        const startY = this.offsetY % gridSize;
        for (let x = startX; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = startY; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Título do Quadro
        ctx.fillStyle = '#ff1a1a';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('QUADRO DE INVESTIGAÇÃO — PISTAS & DEDUÇÕES', 40, 50);

        ctx.fillStyle = '#888888';
        ctx.font = '14px monospace';
        ctx.fillText('[Clique em duas pistas para conectá-las | Arraste para mover o quadro | ESC para sair]', 40, 80);

        // Desenhar Conexões (Linhas vermelhas/brancas)
        this.connections.forEach(conn => {
            const p1 = this.nodePositions[conn.id1];
            const p2 = this.nodePositions[conn.id2];
            if (p1 && p2) {
                ctx.save();
                ctx.strokeStyle = conn.solved ? '#ff1a1a' : '#555555';
                ctx.lineWidth = conn.solved ? 3 : 1.5;
                if (!conn.solved) {
                    ctx.setLineDash([6, 6]);
                }
                ctx.beginPath();
                ctx.moveTo(p1.x + this.offsetX, p1.y + this.offsetY);
                ctx.lineTo(p2.x + this.offsetX, p2.y + this.offsetY);
                ctx.stroke();
                ctx.restore();
            }
        });

        // Desenhar Nós de Pistas Desbloqueadas
        this.unlockedClues.forEach(id => {
            const clue = this.cluesData[id];
            const pos = this.nodePositions[id];
            if (!clue || !pos) return;

            const screenX = pos.x + this.offsetX;
            const screenY = pos.y + this.offsetY;
            const isSelected = (this.selectedClueId === id);

            ctx.save();
            ctx.translate(screenX, screenY);

            // Caixa da pista (Cartão estilo noir)
            const boxW = 180;
            const boxH = 90;
            const boxX = -boxW / 2;
            const boxY = -boxH / 2;

            ctx.fillStyle = '#141414';
            ctx.strokeStyle = isSelected ? '#ff1a1a' : '#777777';
            ctx.lineWidth = isSelected ? 3 : 1.5;

            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            // Alfinete vermelho no topo do cartão
            ctx.fillStyle = '#ff1a1a';
            ctx.beginPath();
            ctx.arc(0, boxY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Texto da pista
            ctx.fillStyle = '#f4f4f4';
            ctx.font = 'bold 13px monospace';
            this.wrapSimpleText(ctx, clue.name || id, boxX + 10, boxY + 22, boxW - 20, 16, 2);

            ctx.fillStyle = '#aaaaaa';
            ctx.font = '11px monospace';
            this.wrapSimpleText(ctx, clue.description || '', boxX + 10, boxY + 50, boxW - 20, 14, 2);

            ctx.restore();
        });

        // Caso nenhuma pista descoberta
        if (this.unlockedClues.length === 0) {
            ctx.fillStyle = '#777777';
            ctx.font = '16px monospace';
            ctx.fillText('Nenhuma pista descoberta ainda. Explore a cena do crime e interaja com testemunhas.', 40, h / 2);
        }

        ctx.restore();
    }

    wrapSimpleText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let lineCount = 1;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
                lineCount++;
                if (lineCount > maxLines) {
                    // Adicionar reticências se cortar
                    break;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
};