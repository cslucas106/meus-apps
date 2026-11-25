/**
 * facada-noir/js/entities/interactable.js
 * Objetos interativos no mundo: pistas, portas, alavancas, corpos, notas.
 */

class Interactable extends Entity {
    constructor(x, y, type, data = {}) {
        super(x, y, data.width || 32, data.height || 32);
        this.type = type; // 'clue', 'door', 'item', 'corpse', 'note'
        this.data = data;
        this.id = data.id || `interactable_${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name || 'Objeto';
        this.interacted = data.interacted || false;
        this.active = data.active !== undefined ? data.active : true;
        this.radius = data.radius || 48; // Raio de interação
        this.promptText = data.promptText || `Pressionar E para examinar ${this.name}`;
    }

    canInteract(player) {
        if (!this.active) return false;
        const dist = this.distanceTo(player);
        return dist <= this.radius;
    }

    interact(gameInstance) {
        if (!this.active) return;
        
        switch (this.type) {
            case 'clue':
                this.interacted = true;
                this.active = false; // Coletado ou examinado
                if (gameInstance.investigationSystem) {
                    gameInstance.investigationSystem.discoverClue(this.id, this.data);
                }
                if (gameInstance.audio) {
                    gameInstance.audio.playSFX('clue_found');
                }
                break;

            case 'door':
                if (this.data.locked) {
                    if (gameInstance.inventory && gameInstance.inventory.hasItem(this.data.keyId)) {
                        this.data.locked = false;
                        if (gameInstance.audio) gameInstance.audio.playSFX('door_unlock');
                        if (gameInstance.hud) gameInstance.hud.showNotification('Porta destrancada.');
                    } else {
                        if (gameInstance.audio) gameInstance.audio.playSFX('door_locked');
                        if (gameInstance.hud) gameInstance.hud.showNotification('Está trancada. Precisa de uma chave.');
                    }
                } else {
                    if (gameInstance.audio) gameInstance.audio.playSFX('door_open');
                    if (this.data.targetScene && gameInstance.changeScene) {
                        gameInstance.changeScene(this.data.targetScene, this.data.spawnPoint);
                    }
                }
                break;

            case 'item':
                this.interacted = true;
                this.active = false;
                if (gameInstance.inventory) {
                    gameInstance.inventory.addItem(this.data.itemId, this.data);
                }
                if (gameInstance.audio) {
                    gameInstance.audio.playSFX('item_pickup');
                }
                if (gameInstance.hud) {
                    gameInstance.hud.showNotification(`Item obtido: ${this.name}`);
                }
                break;

            case 'note':
            case 'corpse':
                this.interacted = true;
                if (gameInstance.dialogueSystem && this.data.dialogueId) {
                    gameInstance.dialogueSystem.startDialogue(this.data.dialogueId);
                }
                break;

            default:
                break;
        }

        if (this.data.onInteract && typeof this.data.onInteract === 'function') {
            this.data.onInteract(gameInstance, this);
        }
    }

    update(dt) {
        super.update(dt);
    }

    draw(renderer) {
        if (!this.active) return;

        const ctx = renderer.ctx || renderer;
        ctx.save();

        ctx.fillStyle = (typeof CONFIG !== 'undefined' && CONFIG.COLORS && CONFIG.COLORS.ACCENT_RED) ? CONFIG.COLORS.ACCENT_RED : '#8b0000';
        
        if (this.type === 'clue') {
            const pulse = Math.sin(Date.now() * 0.008) * 2 + 6;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, pulse, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'door') {
            ctx.fillStyle = '#444';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = this.data.locked ? '#8b0000' : '#fff';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.restore();
    }
}