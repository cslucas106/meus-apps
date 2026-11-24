window.DialogueSystem = class DialogueSystem {
    constructor() {
        this.active = false;
        this.dialogueData = null;
        this.currentDialogueId = null;
        this.currentNodeId = null;
        this.currentNode = null;
        this.speaker = '';
        this.text = '';
        this.displayedText = '';
        this.charIndex = 0;
        this.timer = 0;
        this.charSpeed = 0.02; // tempo por caractere
        this.choices = [];
        this.selectedChoiceIndex = 0;
        this.portrait = '';
        this.onComplete = null;
    }

    init(dialoguesJson) {
        this.dialogueData = dialoguesJson || {};
    }

    startDialogue(dialogueId, onComplete = null) {
        if (!this.dialogueData || !this.dialogueData[dialogueId]) {
            console.warn(`Diálogo não encontrado: ${dialogueId}`);
            if (onComplete) onComplete();
            return;
        }

        this.currentDialogueId = dialogueId;
        this.active = true;
        this.onComplete = onComplete;
        this.currentNodeId = 'start';
        this.loadNode(this.currentNodeId);
    }

    loadNode(nodeId) {
        const dialogue = this.dialogueData[this.currentDialogueId];
        if (!dialogue || !dialogue[nodeId]) {
            this.endDialogue();
            return;
        }

        this.currentNodeId = nodeId;
        this.currentNode = dialogue[nodeId];
        this.speaker = this.currentNode.speaker || '';
        this.text = this.currentNode.text || '';
        this.portrait = this.currentNode.portrait || '';
        this.choices = this.currentNode.choices || [];
        this.selectedChoiceIndex = 0;

        this.displayedText = '';
        this.charIndex = 0;
        this.timer = 0;

        // Executar ações se houver
        if (this.currentNode.action && window.Game && window.Game.handleDialogueAction) {
            window.Game.handleDialogueAction(this.currentNode.action);
        }
    }

    update(dt) {
        if (!this.active) return;

        // Digitação do texto
        if (this.charIndex < this.text.length) {
            this.timer += dt;
            if (this.timer >= this.charSpeed) {
                this.timer = 0;
                this.charIndex++;
                this.displayedText = this.text.substring(0, this.charIndex);
            }
        }

        // Input
        const input = window.Input;
        if (input) {
            if (input.isJustPressed('action') || input.isJustPressed('enter') || input.isJustPressed('space')) {
                this.advance();
            }

            if (this.choices.length > 0 && this.charIndex >= this.text.length) {
                if (input.isJustPressed('up') || input.isJustPressed('w')) {
                    this.selectedChoiceIndex = (this.selectedChoiceIndex - 1 + this.choices.length) % this.choices.length;
                    if (window.AudioSystem) window.AudioSystem.playSfx('menu_move');
                }
                if (input.isJustPressed('down') || input.isJustPressed('s')) {
                    this.selectedChoiceIndex = (this.selectedChoiceIndex + 1) % this.choices.length;
                    if (window.AudioSystem) window.AudioSystem.playSfx('menu_move');
                }
            }
        }
    }

    advance() {
        if (this.charIndex < this.text.length) {
            // Revelar texto todo instantaneamente
            this.charIndex = this.text.length;
            this.displayedText = this.text;
            return;
        }

        if (this.choices.length > 0) {
            const chosen = this.choices[this.selectedChoiceIndex];
            if (chosen) {
                if (window.AudioSystem) window.AudioSystem.playSfx('menu_select');
                if (chosen.next) {
                    this.loadNode(chosen.next);
                } else {
                    this.endDialogue();
                }
            }
        } else {
            if (window.AudioSystem) window.AudioSystem.playSfx('menu_select');
            if (this.currentNode.next) {
                this.loadNode(this.currentNode.next);
            } else {
                this.endDialogue();
            }
        }
    }

    endDialogue() {
        this.active = false;
        const callback = this.onComplete;
        this.onComplete = null;
        if (callback) callback();
    }

    draw(ctx) {
        if (!this.active) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const boxHeight = 160;
        const boxY = h - boxHeight - 20;
        const boxX = 20;
        const boxWidth = w - 40;

        ctx.save();

        // Fundo da caixa de diálogo (Preto Noir com borda vermelha)
        ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 3;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Nome do falante
        if (this.speaker) {
            ctx.fillStyle = '#ff3333';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(this.speaker.toUpperCase(), boxX + 20, boxY + 30);
        }

        // Texto falado
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '16px monospace';
        this.wrapText(ctx, this.displayedText, boxX + 20, boxY + 60, boxWidth - 40, 24);

        // Escolhas (se houver e texto completo)
        if (this.choices.length > 0 && this.charIndex >= this.text.length) {
            let choiceY = boxY + boxHeight - (this.choices.length * 28) - 15;
            this.choices.forEach((choice, index) => {
                const isSelected = index === this.selectedChoiceIndex;
                ctx.fillStyle = isSelected ? '#ff3333' : '#a0a0a0';
                ctx.font = isSelected ? 'bold 15px monospace' : '15px monospace';
                const prefix = isSelected ? '> ' : '  ';
                ctx.fillText(prefix + choice.text, boxX + 30, choiceY);
                choiceY += 28;
            });
        } else if (this.charIndex >= this.text.length) {
            // Indicador para continuar
            ctx.fillStyle = '#ff3333';
            ctx.font = '12px monospace';
            ctx.fillText('[Pressione ESPAÇO/ENTER para continuar]', boxX + boxWidth - 320, boxY + boxHeight - 15);
        }

        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const paragraphs = text.split('\n');
        let currentY = y;

        for (let p = 0; p < paragraphs.length; p++) {
            const words = paragraphs[p].split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, currentY);
            currentY += lineHeight;
        }
    }
};