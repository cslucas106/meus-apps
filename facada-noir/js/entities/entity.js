/**
 * Facada Noir - Entity Base Class
 * Classe base para todas as entidades do jogo (jogador, NPCs, itens interativos, luzes).
 */

class Entity {
    constructor(x = 0, y = 0, width = 32, height = 32, tags = []) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.speed = 100;
        this.direction = 'down'; // 'up', 'down', 'left', 'right'
        
        this.tags = Array.isArray(tags) ? tags : [tags];
        this.active = true;
        this.visible = true;
        this.zIndex = 0;
        
        // Hitbox relativa ou absoluta (por padrão, cobre o corpo todo)
        this.hitbox = {
            offsetX: 0,
            offsetY: 0,
            width: width,
            height: height
        };

        // Estado de animação simples
        this.animTime = 0;
        this.isMoving = false;
    }

    /**
     * Retorna a hitbox mundial da entidade.
     */
    getBounds() {
        return {
            x: this.x + this.hitbox.offsetX,
            y: this.y + this.hitbox.offsetY,
            width: this.hitbox.width,
            height: this.hitbox.height
        };
    }

    /**
     * Verifica colisão AABB com outra entidade ou objeto.
     */
    collidesWith(other) {
        const b1 = this.getBounds();
        const b2 = other.getBounds ? other.getBounds() : other;

        return b1.x < b2.x + b2.width &&
               b1.x + b1.width > b2.x &&
               b1.y < b2.y + b2.height &&
               b1.y + b1.height > b2.y;
    }

    /**
     * Atualiza lógica da entidade.
     * @param {number} dt Delta time em segundos
     */
    update(dt) {
        if (!this.active) return;

        // Movimento padrão baseado em velocidade
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Atualiza estado de movimento
        if (this.vx !== 0 || this.vy !== 0) {
            this.isMoving = true;
            this.animTime += dt;

            // Define direção predominante
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.direction = this.vx > 0 ? 'right' : 'left';
            } else {
                this.direction = this.vy > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }

        // Z-Index dinâmico baseado na base dos pés Y
        this.zIndex = Math.floor(this.y + this.height);
    }

    /**
     * Desenha a entidade (subclasses devem sobrescrever ou estender).
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.visible) return;

        // Placeholder visual Noir (Silhueta com detalhe vermelho)
        ctx.save();
        ctx.fillStyle = '#111111';
        ctx.strokeStyle = '#990000';
        ctx.lineWidth = 2;

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Indicador de direção simples (olhos/frente)
        ctx.fillStyle = '#990000';
        const eyeSize = 4;
        let ex = this.x + this.width / 2 - eyeSize / 2;
        let ey = this.y + 8;

        if (this.direction === 'up') ey = this.y + 4;
        if (this.direction === 'down') ey = this.y + this.height - 10;
        if (this.direction === 'left') ex = this.x + 6;
        if (this.direction === 'right') ex = this.x + this.width - 10;

        ctx.fillRect(ex, ey, eyeSize, eyeSize);

        ctx.restore();
    }

    /**
     * Destrói a entidade ou marca para remoção.
     */
    destroy() {
        this.active = false;
        this.visible = false;
    }
}