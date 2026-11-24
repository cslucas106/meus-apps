/**
 * Facada Noir - Classe Base de Cenas (scene-base.js)
 * Define a estrutura comum para todas as cenas/capítulos do jogo.
 */

window.SceneBase = class SceneBase {
    constructor(key) {
        this.key = key;
        this.entities = [];
        this.interactables = [];
        this.npcs = [];
        this.lights = [];
        this.camera = { x: 0, y: 0, width: CONFIG.canvas.width, height: CONFIG.canvas.height };
        this.bounds = { width: 2560, height: 1440 }; // Tamanho padrão do mundo da cena
        this.ambienceMusic = null;
        this.isLoaded = false;
    }

    /**
     * Inicializa a cena (spawn de entidades, configuração inicial).
     * @param {Object} game 
     */
    init(game) {
        console.log(`[SceneBase] Inicializando cena: ${this.key}`);
        this.entities = [];
        this.interactables = [];
        this.npcs = [];
        this.lights = [];
        this.isLoaded = true;
    }

    /**
     * Adiciona uma entidade à cena.
     */
    addEntity(entity) {
        this.entities.push(entity);
        if (entity.tags && entity.tags.includes('interactable')) {
            this.interactables.push(entity);
        }
        if (entity.tags && entity.tags.includes('npc')) {
            this.npcs.push(entity);
        }
        if (entity.tags && entity.tags.includes('light')) {
            this.lights.push(entity);
        }
    }

    /**
     * Remove uma entidade da cena.
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
        const intIndex = this.interactables.indexOf(entity);
        if (intIndex !== -1) {
            this.interactables.splice(intIndex, 1);
        }
        const npcIndex = this.npcs.indexOf(entity);
        if (npcIndex !== -1) {
            this.npcs.splice(npcIndex, 1);
        }
        const lightIndex = this.lights.indexOf(entity);
        if (lightIndex !== -1) {
            this.lights.splice(lightIndex, 1);
        }
    }

    /**
     * Atualiza a lógica da cena e suas entidades.
     * @param {number} dt 
     * @param {Object} game 
     */
    update(dt, game) {
        // Atualiza todas as entidades ativas
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            if (ent && ent.active) {
                ent.update(dt, game);
            } else if (ent && !ent.active) {
                // Remove entidades inativas se necessário
                // this.entities.splice(i, 1);
            }
        }

        // Ordena entidades por Z-Index para renderização correta (isometric/depth sort)
        this.entities.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        // Seguir jogador com a câmera
        if (game.player) {
            this.updateCamera(game.player);
        }
    }

    /**
     * Atualiza a posição da câmera centralizada no alvo (jogador).
     */
    updateCamera(target) {
        const targetX = target.x + target.width / 2 - this.camera.width / 2;
        const targetY = target.y + target.height / 2 - this.camera.height / 2;

        // Limita a câmera aos limites do mundo da cena
        this.camera.x = Utils.clamp(targetX, 0, this.bounds.width - this.camera.width);
        this.camera.y = Utils.clamp(targetY, 0, this.bounds.height - this.camera.height);
    }

    /**
     * Renderiza a cena.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx, renderer) {
        ctx.save();
        
        // Aplica translação da câmera
        ctx.translate(-this.camera.x, -this.camera.y);

        // Desenha fundo de placeholder ou grid noir
        this.drawBackground(ctx);

        // Desenha entidades ordenadas
        for (const ent of this.entities) {
            if (ent && ent.visible) {
                ent.draw(ctx);
            }
        }

        ctx.restore();
    }

    /**
     * Desenha o fundo da cena.
     */
    drawBackground(ctx) {
        ctx.save();
        // Fundo padrão cinza escuro / asfalto noir
        ctx.fillStyle = CONFIG.colors.bg || '#0a0a0a';
        ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // Linhas de grade sutis para dar textura de beco/chão
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 1;
        const gridSize = 64;

        for (let x = 0; x < this.bounds.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.bounds.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.bounds.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.bounds.width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Limpeza ao sair da cena.
     */
    teardown(game) {
        console.log(`[SceneBase] Saindo da cena: ${this.key}`);
        this.isLoaded = false;
    }
};