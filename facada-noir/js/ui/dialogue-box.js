/**
 * Facada Noir - Caixa de Diálogo UI (dialogue-box.js)
 * Gerencia a renderização avançada e o layout visual da caixa de diálogo.
 */

class DialogueBox {
    constructor() {
        this.width = 0;
        this.height = 160;
        this.x = 20;
        this.y = 0;
    }

    draw(ctx, dialogueSystem) {
        if (!dialogueSystem || !dialogueSystem.active) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        this.width = w - 40;
        this.y = h - this.height - 20;

        ctx.save();

        // Sombra / Fundo da Caixa Noir
        ctx.fillStyle = 'rgba(5, 5, 5, 0.92)';
        ctx.strokeStyle = CONFIG.colors.redBlood || '#8b0000';
        ctx.lineWidth = 3;

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Linha decorativa interna estilo policial/noir
        ctx.strokeStyle = 'rgba(255, 26, 26, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);

        // Retrato (se houver placeholder ou área reservada)
        const portraitWidth = 100;
        const hasPortrait = dialogueSystem.portrait && dialogueSystem.portrait !== '';
        
        let textStartX = this.x + 25;
        if (hasPortrait) {
            const portraitX = this.x + 20;
            const portraitY = this.y + 20;
            const portraitH = this.height - 40;

            ctx.fillStyle = CONFIG.colors.grayDark || '#222';
            ctx.fillRect(portraitX, portraitY, portraitWidth, portraitH);
            ctx.strokeStyle = CONFIG.colors.redAccent || '#ff1a1a';
            ctx.strokeRect(portraitX, portraitY, portraitWidth, portraitH);

            // Ícone genérico ou texto de retrato
            ctx.fillStyle = CONFIG.colors.grayLight || '#aaa';
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(dialogueSystem.portrait, portraitX + (portraitWidth / 2), portraitY + (portraitH / 2));

            textStartX = portraitX + portraitWidth + 20;
        }

        // Nome do falante
        if (dialogueSystem.speaker) {
            ctx.fillStyle = CONFIG.colors.redAccent || '#ff1a1a';
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(dialogueSystem.speaker.toUpperCase(), textStartX, this.y + 30);
        }

        // Texto falado com efeito de digitação
        ctx.fillStyle = CONFIG.colors.white || '#f4f4f4';
        ctx.font = '15px "Courier New", monospace';
        
        const maxTextWidth = (this.x + this.width) - textStartX - 25;
        this.wrapText(ctx, dialogueSystem.displayedText, textStartX, this.y + 60, maxTextWidth, 22);

        // Escolhas ou indicador de continuidade
        if (dialogueSystem.choices && dialogueSystem.choices.length > 0 && dialogueSystem.charIndex >= dialogueSystem.text.length) {
            let choiceY = this.y + this.height - (dialogueSystem.choices.length * 24) - 15;
            dialogueSystem.choices.forEach((choice, index) => {
                const isSelected = index === dialogueSystem.selectedChoiceIndex;
                ctx.fillStyle = isSelected ? (CONFIG.colors.redAccent || '#ff1a1a') : (CONFIG.colors.grayLight || '#aaa');
                ctx.font = isSelected ? 'bold 14px "Courier New", monospace' : '14px "Courier New", monospace';
                const prefix = isSelected ? '> ' : '  ';
                ctx.fillText(prefix + choice.text, textStartX, choiceY);
                choiceY += 24;
            });
        } else if (dialogueSystem.charIndex >= dialogueSystem.text.length) {
            ctx.fillStyle = CONFIG.colors.redAccent || '#ff1a1a';
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('[ESPAÇO/ENTER]', this.x + this.width - 20, this.y + this.height - 15);
        }

        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        if (!text) return;
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
}

window.DialogueBox = DialogueBox;