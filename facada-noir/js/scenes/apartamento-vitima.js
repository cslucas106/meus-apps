/**
 * Facada Noir - Cena: Apartamento da Vítima (apartamento-vitima.js)
 * Capítulo 3: Cena do crime, pistas forenses, indícios de luta e segredos.
 */

window.ApartamentoVitimaScene = class ApartamentoVitimaScene extends SceneBase {
    constructor() {
        super('apartamento-vitima');
        this.bounds = { width: 2200, height: 1300 };
    }

    init(game) {
        super.init(game);
        console.log('[ApartamentoVitimaScene] Inicializando Capítulo 3: A Cena do Crime');

        this.bounds = { width: 2200, height: 1300 };

        // Spawn do Jogador na porta de entrada do apartamento
        if (game.player) {
            game.player.x = 200;
            game.player.y = 650;
            this.addEntity(game.player);
        }

        // Objetos Interativos na Cena do Crime
        const corpoVitima = new Interactable(1200, 600, {
            id: 'corpo_vitima',
            name: 'Corpo da Vítima',
            type: 'clue',
            clueId: 'marca_punhal_especial',
            prompt: 'Examinar o corpo',
            width: 70,
            height: 45
        });
        this.addEntity(corpoVitima);

        const cartaMisteriosa = new Interactable(1600, 400, {
            id: 'carta_misteriosa',
            name: 'Carta Rasgada',
            type: 'clue',
            clueId: 'carta_ameaca',
            prompt: 'Ler carta',
            width: 35,
            height: 35
        });
        this.addEntity(cartaMisteriosa);

        const portaSaida = new Interactable(100, 650, {
            id: 'porta_saida_apt',
            name: 'Rua Principal',
            type: 'door',
            targetScene: 'rua-principal',
            prompt: 'Sair do Prédio',
            width: 60,
            height: 100
        });
        this.addEntity(portaSaida);

        // Luzes e atmosfera lúgubre
        const luzCenaCrime = new Light(1200, 620, {
            radius: 280,
            color: 'rgba(139, 0, 0, 0.18)', // tom avermelhado de sangue/crime
            intensity: 0.95
        });
        this.addEntity(luzCenaCrime);

        if (game.audio && typeof game.audio.playMusic === 'function') {
            game.audio.playMusic('noir_mystery');
        }
    }

    update(dt, game) {
        super.update(dt, game);

        for (const ent of this.interactables) {
            if (ent.type === 'door' && game.player && Utils.checkCollision(game.player, ent)) {
                if (game.input && game.input.isJustPressed('interact')) {
                    console.log(`[ApartamentoVitimaScene] Indo para ${ent.targetScene}`);
                    if (typeof game.changeScene === 'function') {
                        game.changeScene(ent.targetScene);
                    }
                }
            }
        }
    }

    drawBackground(ctx) {
        ctx.save();
        // Piso de madeira envelhecida do apartamento
        ctx.fillStyle = '#181210';
        ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // Tacos de madeira
        ctx.strokeStyle = '#241a16';
        ctx.lineWidth = 1;
        const gridW = 80;
        const gridH = 40;
        for (let x = 0; x < this.bounds.width; x += gridW) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.bounds.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.bounds.height; y += gridH) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.bounds.width, y);
            ctx.stroke();
        }

        // Tapete manchado na sala
        ctx.fillStyle = '#2d1818';
        ctx.fillRect(1050, 500, 320, 240);
        ctx.strokeStyle = '#4a2525';
        ctx.lineWidth = 2;
        ctx.strokeRect(1050, 500, 320, 240);

        // Estante de livros revirada ao fundo
        ctx.fillStyle = '#1c1512';
        ctx.fillRect(1500, 250, 280, 100);
        ctx.strokeStyle = '#332620';
        ctx.strokeRect(1500, 250, 280, 100);

        // Título do local na parede
        ctx.fillStyle = '#8b0000';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('APARTAMENTO 402 - CENA DO CRIME', this.bounds.width / 2, 80);

        ctx.restore();
    }

    teardown(game) {
        super.teardown(game);
        console.log('[ApartamentoVitimaScene] Saindo do Apartamento da Vítima.');
    }
};