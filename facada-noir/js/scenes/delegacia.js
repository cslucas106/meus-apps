/**
 * Facada Noir - Cena: Delegacia (delegacia.js)
 * Capítulo 2: Interior da delegacia, arquivos policiais, interrogatório e chefe corrupto.
 */

window.DelegaciaScene = class DelegaciaScene extends SceneBase {
    constructor() {
        super('delegacia');
        this.bounds = { width: 2400, height: 1400 };
    }

    init(game) {
        super.init(game);
        console.log('[DelegaciaScene] Inicializando Capítulo 2: A Casa dos Homens da Lei');

        this.bounds = { width: 2400, height: 1400 };

        // Spawn do Jogador na entrada da delegacia
        if (game.player) {
            game.player.x = 200;
            game.player.y = 700;
            this.addEntity(game.player);
        }

        // NPCs do Capítulo 2
        const chefePolicia = new NPC(1200, 500, {
            name: 'Delegado Sterling',
            dialogueId: 'ch2_boss_sterling',
            color: '#8b0000',
            width: 38,
            height: 54,
            facing: 'down'
        });
        this.addEntity(chefePolicia);

        const recepcionista = new NPC(500, 680, {
            name: 'Escrivã Nora',
            dialogueId: 'ch2_desk_nora',
            color: '#666688',
            width: 32,
            height: 48,
            facing: 'right'
        });
        this.addEntity(recepcionista);

        // Objetos Interativos (Arquivos confidenciais e saída)
        const arquivoConfidencial = new Interactable(1800, 400, {
            id: 'arquivo_confidencial',
            name: 'Gaveta de Arquivos Confidenciais',
            type: 'clue',
            clueId: 'documento_corrupcao',
            prompt: 'Vasculhar arquivos',
            width: 45,
            height: 60
        });
        this.addEntity(arquivoConfidencial);

        const portaSaida = new Interactable(100, 680, {
            id: 'porta_saida_delegacia',
            name: 'Rua Principal',
            type: 'door',
            targetScene: 'rua-principal',
            prompt: 'Voltar para a Rua',
            width: 60,
            height: 100
        });
        this.addEntity(portaSaida);

        // Luzes internas da delegacia
        const luzSalao = new Light(1200, 450, {
            radius: 350,
            color: 'rgba(255, 240, 200, 0.12)',
            intensity: 0.9
        });
        this.addEntity(luzSalao);

        if (game.audio && typeof game.audio.playMusic === 'function') {
            game.audio.playMusic('noir_tension');
        }
    }

    update(dt, game) {
        super.update(dt, game);

        for (const ent of this.interactables) {
            if (ent.type === 'door' && game.player && Utils.checkCollision(game.player, ent)) {
                if (game.input && game.input.isJustPressed('interact')) {
                    console.log(`[DelegaciaScene] Indo para ${ent.targetScene}`);
                    if (typeof game.changeScene === 'function') {
                        game.changeScene(ent.targetScene);
                    }
                }
            }
        }
    }

    drawBackground(ctx) {
        ctx.save();
        // Piso de cerâmica cinza/azulada da delegacia
        ctx.fillStyle = '#111318';
        ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // Linhas de azulejo
        ctx.strokeStyle = '#1d212b';
        ctx.lineWidth = 1;
        const gridSize = 48;
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

        // Balcão da recepção
        ctx.fillStyle = '#262933';
        ctx.fillRect(450, 620, 180, 100);
        ctx.strokeStyle = '#3a3f52';
        ctx.lineWidth = 3;
        ctx.strokeRect(450, 620, 180, 100);

        // Mesa do Delegado
        ctx.fillStyle = '#2a1a1a';
        ctx.fillRect(1100, 400, 220, 120);
        ctx.strokeStyle = '#522b2b';
        ctx.strokeRect(1100, 400, 220, 120);

        // Placa "DELEGACIA CENTRAL" na parede
        ctx.fillStyle = '#f4f4f4';
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DEPARTAMENTO DE POLÍCIA - 13º DISTRITO', this.bounds.width / 2, 80);

        ctx.restore();
    }

    teardown(game) {
        super.teardown(game);
        console.log('[DelegaciaScene] Saindo da Delegacia.');
    }
};