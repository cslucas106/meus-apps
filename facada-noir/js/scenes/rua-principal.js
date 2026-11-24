/**
 * Facada Noir - Cena: Rua Principal (rua-principal.js)
 * Capítulo 1: Becos escuros, bar de jazz, delegacia exterior e testemunhas.
 */

window.RuaPrincipalScene = class RuaPrincipalScene extends SceneBase {
    constructor() {
        super('rua-principal');
        this.bounds = { width: 3200, height: 1800 };
    }

    init(game) {
        super.init(game);
        console.log('[RuaPrincipalScene] Inicializando Capítulo 1: A Noite Chuvosa');

        // Configura limites de mundo maiores para exploração
        this.bounds = { width: 3000, height: 2000 };

        // Spawn do Jogador
        if (game.player) {
            game.player.x = 400;
            game.player.y = 1000;
            this.addEntity(game.player);
        }

        // Adiciona NPCs do Capítulo 1
        const testemunha = new NPC(800, 950, {
            name: 'Joe o Informante',
            dialogueId: 'ch1_informant',
            color: '#b22222',
            width: 32,
            height: 48,
            patrolPoints: [
                { x: 800, y: 950 },
                { x: 1100, y: 950 }
            ],
            speed: 1.0
        });
        this.addEntity(testemunha);

        const policialCorrupto = new NPC(1800, 600, {
            name: 'Oficial Miller',
            dialogueId: 'ch1_cop',
            color: '#444466',
            width: 36,
            height: 52,
            facing: 'left'
        });
        this.addEntity(policialCorrupto);

        // Adiciona Objetos Interativos (Pistas e Portas)
        const lataLixoPista = new Interactable(600, 1050, {
            id: 'lata_lixo_facao',
            name: 'Lata de Lixo Suspeita',
            type: 'clue',
            clueId: 'faca_ensanguentada',
            prompt: 'Investigar lixeira',
            width: 40,
            height: 40
        });
        this.addEntity(lataLixoPista);

        const portaBar = new Interactable(1400, 450, {
            id: 'porta_bar_jazz',
            name: 'Bar The Blue Note',
            type: 'door',
            targetScene: 'submundo',
            prompt: 'Entrar no Bar',
            width: 80,
            height: 100
        });
        this.addEntity(portaBar);

        const portaDelegacia = new Interactable(2200, 500, {
            id: 'porta_delegacia',
            name: 'Delegacia Central',
            type: 'door',
            targetScene: 'delegacia',
            prompt: 'Entrar na Delegacia',
            width: 90,
            height: 120
        });
        this.addEntity(portaDelegacia);

        // Adiciona Luzes Ambiente / Postes
        const poste1 = new Light(780, 900, {
            radius: 250,
            color: 'rgba(255, 220, 150, 0.15)',
            intensity: 0.8
        });
        this.addEntity(poste1);

        const poste2 = new Light(1780, 550, {
            radius: 280,
            color: 'rgba(255, 220, 150, 0.15)',
            intensity: 0.8
        });
        this.addEntity(poste2);

        // Define música ambiente se o sistema de áudio estiver pronto
        if (game.audio && typeof game.audio.playMusic === 'function') {
            game.audio.playMusic('noir_ambience_1');
        }
    }

    update(dt, game) {
        super.update(dt, game);

        // Lógica específica da cena (ex: checar transições de porta)
        for (const ent of this.interactables) {
            if (ent.type === 'door' && game.player && Utils.checkCollision(game.player, ent)) {
                if (game.input && game.input.isJustPressed('interact')) {
                    console.log(`[RuaPrincipalScene] Entrando em ${ent.targetScene}`);
                    if (typeof game.changeScene === 'function') {
                        game.changeScene(ent.targetScene);
                    }
                }
            }
        }
    }

    drawBackground(ctx) {
        ctx.save();
        // Asfalto escuro da rua
        ctx.fillStyle = '#0f0f12';
        ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // Calçadas e meios-fios (rua principal)
        ctx.fillStyle = '#1a1a1f';
        ctx.fillRect(0, 850, this.bounds.width, 400);

        // Linhas da rua (estilo noir)
        ctx.strokeStyle = '#33333d';
        ctx.lineWidth = 4;
        ctx.setLineDash([30, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 1050);
        ctx.lineTo(this.bounds.width, 1050);
        ctx.stroke();
        ctx.setLineDash([]);

        // Decoração de edifícios ao fundo
        ctx.fillStyle = '#08080a';
        // Prédio Esquerda (Bar)
        ctx.fillRect(1200, 100, 300, 450);
        // Prédio Direta (Delegacia)
        ctx.fillRect(2000, 150, 350, 450);

        // Letreiro luminoso do Bar "Blue Note"
        ctx.fillStyle = '#cc0000';
        ctx.shadowColor = '#ff1a1a';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 24px monospace';
        ctx.fillText('BLUE NOTE JAZZ', 1250, 150);

        ctx.restore();
    }

    teardown(game) {
        super.teardown(game);
        console.log('[RuaPrincipalScene] Saindo da Rua Principal.');
    }
};