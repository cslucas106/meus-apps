/**
 * Facada Noir - Cena: Submundo (submundo.js)
 * Capítulo 4: Clube noturno clandestino, chefão, confronto final e múltiplos finais.
 */

window.SubmundoScene = class SubmundoScene extends SceneBase {
    constructor() {
        super('submundo');
        this.bounds = { width: 2800, height: 1600 };
    }

    init(game) {
        super.init(game);
        console.log('[SubmundoScene] Inicializando Capítulo 4: O Submundo');

        this.bounds = { width: 2800, height: 1600 };

        // Spawn do Jogador na entrada do clube
        if (game.player) {
            game.player.x = 200;
            game.player.y = 800;
            this.addEntity(game.player);
        }

        // Chefão / Criminoso Principal (NPC Interativo)
        const chefeMáfia = new NPC(2200, 750, {
            id: 'chefe_mafia',
            name: 'Don Salvatore',
            dialogueId: 'submundo_confronto_final',
            width: 50,
            height: 90
        });
        this.addEntity(chefeMáfia);

        // Pista Final / Prova Definitiva
        const provaFinal = new Interactable(2250, 850, {
            id: 'prova_definitiva',
            name: 'Maleta de Provas',
            type: 'clue',
            clueId: 'confissao_assinada',
            prompt: 'Pegar provas',
            width: 45,
            height: 35
        });
        this.addEntity(provaFinal);

        // Porta de saída para a rua
        const portaSaida = new Interactable(100, 800, {
            id: 'porta_saida_sub',
            name: 'Rua Principal',
            type: 'door',
            targetScene: 'rua-principal',
            prompt: 'Voltar para a Rua',
            width: 60,
            height: 110
        });
        this.addEntity(portaSaida);

        // Iluminação dramática de boate clandestina / luzes vermelhas e estrobos
        const luzPalco = new Light(2200, 780, {
            radius: 350,
            color: 'rgba(255, 26, 26, 0.25)',
            intensity: 1.0
        });
        this.addEntity(luzPalco);

        if (game.audio && typeof game.audio.playMusic === 'function') {
            game.audio.playMusic('noir_boss');
        }
    }

    update(dt, game) {
        super.update(dt, game);

        for (const ent of this.interactables) {
            if (ent.type === 'door' && game.player && Utils.checkCollision(game.player, ent)) {
                if (game.input && game.input.isJustPressed('interact')) {
                    console.log(`[SubmundoScene] Indo para ${ent.targetScene}`);
                    if (typeof game.changeScene === 'function') {
                        game.changeScene(ent.targetScene);
                    }
                }
            }
        }
    }

    drawBackground(ctx) {
        ctx.save();
        // Piso escuro de clube noturno (azulejos pretos molhados)
        ctx.fillStyle = '#0f0c0c';
        ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // Padrão de piso xadrez escuro / neon apagado
        ctx.strokeStyle = '#1c1212';
        ctx.lineWidth = 1;
        const gridSize = 90;
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

        // Área do Bar ao fundo
        ctx.fillStyle = '#140808';
        ctx.fillRect(1200, 200, 600, 180);
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(1200, 200, 600, 180);

        ctx.fillStyle = '#ff1a1a';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BAR & CLUBE O SUBMUNDO - CONFRONTO FINAL', this.bounds.width / 2, 70);

        ctx.restore();
    }

    teardown(game) {
        super.teardown(game);
        console.log('[SubmundoScene] Saindo do Submundo.');
    }
};