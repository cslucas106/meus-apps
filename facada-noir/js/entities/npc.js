/**
 * facada-noir/js/entities/npc.js
 * Entidade de NPC com IA simples (patrulha, idle, diálogo e reações).
 */

class NPC extends Entity {
    constructor(x, y, data = {}) {
        super(x, y, data.width || 32, data.height || 48, 'npc');
        this.name = data.name || 'Desconhecido';
        this.dialogueId = data.dialogueId || null;
        this.patrolPoints = data.patrolPoints || []; // [{x, y}, ...]
        this.currentPatrolIndex = 0;
        this.speed = data.speed || 1.2;
        this.state = 'idle'; // idle, patrol, talk
        this.idleTimer = 0;
        this.idleDuration = 2; // segundos parado antes de mudar de patrulha
        this.facing = data.facing || 'down'; // up, down, left, right
        this.spriteColor = data.color || '#cccccc';
        this.interactRadius = 50;
    }

    update(dt) {
        super.update(dt);

        if (this.state === 'patrol' && this.patrolPoints.length > 0) {
            const target = this.patrolPoints[this.currentPatrolIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4) {
                // Chegou ao ponto de patrulha
                this.x = target.x;
                this.y = target.y;
                this.vx = 0;
                this.vy = 0;
                this.state = 'idle';
                this.idleTimer = 0;
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            } else {
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
                this.x += this.vx;
                this.y += this.vy;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.facing = dx > 0 ? 'right' : 'left';
                } else {
                    this.facing = dy > 0 ? 'down' : 'up';
                }
            }
        } else if (this.state === 'idle') {
            this.vx = 0;
            this.vy = 0;
            if (this.patrolPoints.length > 0) {
                this.idleTimer += dt;
                if (this.idleTimer >= this.idleDuration) {
                    this.state = 'patrol';
                }
            }
        }
    }

    draw(ctx, renderer) {
        // Visual Noir para NPC: silhueta com paletó ou chapéu e acento vermelho se suspeito
        ctx.save();
        ctx.translate(this.x, this.y);

        // Corpo principal
        ctx.fillStyle = this.spriteColor;
        ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

        // Chapéu ou cabeça
        ctx.fillStyle = '#111111';
        ctx.fillRect(-this.width / 2 - 2, -this.height - 10, this.width + 4, 12);

        // Detalhe Noir (fita do chapéu vermelha ou gravata)
        ctx.fillStyle = '#cc0000';
        if (this.facing === 'down' || this.facing === 'left' || this.facing === 'right') {
            ctx.fillRect(-4, -this.height + 10, 8, 4); // gravata / detalhe
        }

        // Indicador de interação se perto do player (será tratado no renderer ou HUD, mas desenhamos ponto se necessário)
        ctx.restore();
    }

    interact(player) {
        // Interrompe patrulha e olha para o player
        this.state = 'idle';
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.facing = dx > 0 ? 'right' : 'left';
        } else {
            this.facing = dy > 0 ? 'down' : 'up';
        }

        console.log(`Interagindo com NPC: ${this.name} (Diálogo: ${this.dialogueId})`);
        return this.dialogueId;
    }
}