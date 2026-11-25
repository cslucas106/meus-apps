/**
 * Facada Noir - HUD (hud.js)
 * Exibe lanterna (bateria), stamina, capítulo, hora e dicas contextuais.
 */

class HUD {
    constructor() {
        this.visible = true;
        this.promptText = '';
        this.promptTimer = 0;
    }

    update(dt, player) {
        if (this.promptTimer > 0) {
            this.promptTimer -= dt;
            if (this.promptTimer <= 0) {
                this.promptText = '';
            }
        }
    }

    showPrompt(text, duration = 3) {
        this.promptText = text;
        this.promptTimer = duration;
    }

    draw(renderer, player, gameInstance) {
        if (!this.visible) return;

        const ctx = renderer.ctx;
        ctx.save();

        // 1. Canto Superior Esquerdo: Informações de Capítulo e Hora
        ctx.fillStyle = CONFIG.colors.white;
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'left';
        
        const currentChapter = gameInstance && gameInstance.progression ? `Capítulo ${gameInstance.progression.currentChapter}` : 'Capítulo 1';
        ctx.fillText(currentChapter, 30, 40);

        ctx.fillStyle = CONFIG.colors.grayMid;
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('02:45 AM - Sétimo Distrito', 30, 65);

        // 2. Canto Superior Direito: Barras de Status (Stamina e Lanterna)
        const barWidth = 180;
        const barHeight = 12;
        const startX = renderer.width - barWidth - 30;
        let startY = 30;

        // Stamina
        if (player) {
            const staminaRatio = Math.max(0, Math.min(1, player.stamina / CONFIG.player.staminaMax));
            
            ctx.fillStyle = CONFIG.colors.grayDark;
            ctx.fillRect(startX, startY, barWidth, barHeight);
            ctx.strokeStyle = CONFIG.colors.grayLight;
            ctx.strokeRect(startX, startY, barWidth, barHeight);

            ctx.fillStyle = CONFIG.colors.white;
            ctx.fillRect(startX + 2, startY + 2, (barWidth - 4) * staminaRatio, barHeight - 4);

            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('STAMINA', startX - 10, startY + 10);

            startY += 25;

            // Bateria da Lanterna
            const batteryRatio = Math.max(0, Math.min(1, player.flashlightBattery / CONFIG.player.flashlightBatteryMax));
            
            ctx.fillStyle = CONFIG.colors.grayDark;
            ctx.fillRect(startX, startY, barWidth, barHeight);
            ctx.strokeStyle = CONFIG.colors.grayLight;
            ctx.strokeRect(startX, startY, barWidth, barHeight);

            ctx.fillStyle = player.flashlightOn ? CONFIG.colors.redAccent : CONFIG.colors.grayMid;
            ctx.fillRect(startX + 2, startY + 2, (barWidth - 4) * batteryRatio, barHeight - 4);

            ctx.fillStyle = CONFIG.colors.grayLight;
            ctx.textAlign = 'right';
            ctx.fillText('LANTERNA', startX - 10, startY + 10);
        }

        // 3. Rodapé / Centro: Dicas Contextuais (Interações)
        if (this.promptText) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            const boxWidth = 500;
            const boxHeight = 40;
            const boxX = (renderer.width - boxWidth) / 2;
            const boxY = renderer.height - 80;

            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = CONFIG.colors.redAccent;
            ctx.lineWidth = 2;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = CONFIG.colors.white;
            ctx.font = 'bold 15px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.promptText, renderer.width / 2, boxY + 25);
        }

        ctx.restore();
    }
}

window.HUD = HUD;