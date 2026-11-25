/**
 * Facada Noir - Motor Principal (Game Loop & State Manager)
 */
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.renderer = null;
        this.input = null;
        this.audio = null;
        this.stateMachine = null;
        this.assetLoader = null;

        // Sistemas de Jogo
        this.dialogue = null;
        this.inventory = null;
        this.investigation = null;
        this.progression = null;
        this.save = null;

        // UI & HUD
        this.hud = null;
        this.dialogueBox = null;
        this.notebook = null;
        this.menuUI = null;
        this.transition = null;

        // Entidades e Cenas
        this.player = null;
        this.currentScene = null;
        this.currentSceneKey = 'rua-principal';
        this.scenes = {};

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60;
        this.isRunning = false;
        this.playTime = 0;
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas principal não encontrado!');
            return;
        }

        // Inicializa Renderer e Input
        this.renderer = new Renderer(this.canvas);
        this.input = new InputManager();
        this.stateMachine = new StateMachine();

        // Expõe instância global
        window.gameInstance = this;

        // Carrega assets e dados JSON
        this.loadAssetsAndInit();
    }

    loadAssetsAndInit() {
        const manifest = {
            json: {
                items: 'data/items.json',
                clues: 'data/clues.json',
                scenes: 'data/scenes.json',
                progression: 'data/progression.json',
                dialogues: 'data/dialogues/pt-br.json'
            },
            images: {}
        };

        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');

        window.assets.loadQueue(
            manifest,
            (progress) => {
                if (loadingProgress) {
                    loadingProgress.style.width = `${progress * 100}%`;
                }
                if (loadingText) {
                    loadingText.innerText = `Carregando... ${Math.floor(progress * 100)}%`;
                }
            },
            () => {
                console.log('Assets carregados com sucesso.');
                this.initComponents();

                // Remove tela de carregamento
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.remove('active');
                }

                // Inicia loop principal e vai para o menu
                this.isRunning = true;
                this.lastTime = performance.now();
                requestAnimationFrame((time) => this.loop(time));
            }
        );
    }

    initComponents() {
        // Instancia subsistemas
        this.dialogue = new DialogueSystem();
        this.inventory = new InventorySystem();
        this.investigation = new InvestigationSystem();
        this.progression = new ProgressionSystem();
        this.save = new SaveSystem();

        // Inicializa com dados dos JSONs carregados
        const itemsJson = window.assets.get('items');
        const cluesJson = window.assets.get('clues');
        const scenesJson = window.assets.get('scenes');
        const progressionJson = window.assets.get('progression');
        const dialoguesJson = window.assets.get('dialogues');

        if (this.inventory && typeof this.inventory.init === 'function') {
            this.inventory.init(itemsJson);
        }
        if (this.investigation && typeof this.investigation.init === 'function') {
            this.investigation.init(cluesJson);
        }
        if (this.progression && typeof this.progression.init === 'function') {
            this.progression.init(progressionJson);
        }
        if (this.dialogue && typeof this.dialogue.init === 'function') {
            this.dialogue.init(dialoguesJson);
        }

        // Apelidos: outros arquivos usam estes nomes
        this.dialogueSystem = this.dialogue;
        this.investigationSystem = this.investigation;
        this.investigation.discoverClue = (id, data) => this.investigation.addClue((data && data.clueId) || id);
        window.Input = this.input;

        // Instancia UI & HUD
        if (window.HUD) this.hud = new window.HUD();
        if (this.hud && !this.hud.showNotification) this.hud.showNotification = (t) => this.hud.showPrompt(t);
        if (window.DialogueBox) this.dialogueBox = new window.DialogueBox();
        if (window.NotebookUI) this.notebook = new window.NotebookUI();
        if (window.MenuUI) this.menuUI = new window.MenuUI();
        if (window.TransitionSystem) this.transition = new window.TransitionSystem();

        // Registra cenas disponíveis
        if (window.RuaPrincipalScene) this.scenes['rua-principal'] = new window.RuaPrincipalScene();
        if (window.DelegaciaScene) this.scenes['delegacia'] = new window.DelegaciaScene();
        if (window.ApartamentoVitimaScene) this.scenes['apartamento-vitima'] = new window.ApartamentoVitimaScene();
        if (window.SubmundoScene) this.scenes['submundo'] = new window.SubmundoScene();

        // Registra estados na StateMachine
        this.stateMachine.add('menu', {
            enter: () => {},
            exit: () => {},
            update: (dt) => {
                if (this.menuUI && typeof this.menuUI.update === 'function') {
                    this.menuUI.update(dt);
                }
            },
            draw: (ctx) => {
                if (this.menuUI && typeof this.menuUI.draw === 'function') {
                    this.menuUI.draw(this.renderer);
                }
            },
            handleInput: (type, event) => {
                if (this.menuUI && typeof this.menuUI.handleInput === 'function') {
                    this.menuUI.handleInput(type, event);
                }
            }
        });

        this.stateMachine.add('playing', {
            enter: () => {},
            exit: () => {},
            update: (dt) => {
                this.playTime += dt;
                // Conversa em andamento: só ela é atualizada (toque à direita avança)
                if (this.dialogue && this.dialogue.active) {
                    this.dialogue.update(dt);
                    return;
                }
                if (this.currentScene && typeof this.currentScene.update === 'function') {
                    this.currentScene.update(dt, this);
                }
                this.nearTarget = this.findNearTarget();
                if (this.skipInteract) {
                    this.skipInteract = false;
                } else if (this.nearTarget && this.input.wasPressed('interact')) {
                    this.interactWith(this.nearTarget);
                }
                if (this.hud && typeof this.hud.update === 'function') {
                    this.hud.update(dt, this.player);
                }
                if (this.transition && typeof this.transition.update === 'function') {
                    this.transition.update(dt);
                }
            },
            draw: (ctx) => {
                if (this.currentScene && typeof this.currentScene.draw === 'function') {
                    this.currentScene.draw(ctx, this.renderer);
                }
                if (this.hud && typeof this.hud.draw === 'function') {
                    this.hud.draw(this.renderer, this.player, this);
                }
                if (this.nearTarget && !(this.dialogue && this.dialogue.active)) {
                    const t = this.nearTarget;
                    ctx.save();
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillRect(this.canvas.width / 2 - 220, this.canvas.height - 70, 440, 36);
                    ctx.fillStyle = '#f4f4f4';
                    ctx.font = '16px "Courier New", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('Toque à direita: ' + (t.prompt || t.name || 'interagir'), this.canvas.width / 2, this.canvas.height - 47);
                    ctx.restore();
                }
                if (this.dialogue && this.dialogue.active && this.dialogueBox) {
                    this.dialogueBox.draw(ctx, this.dialogue);
                }
                if (this.transition && typeof this.transition.draw === 'function') {
                    this.transition.draw(this.renderer);
                }
            },
            handleInput: (type, event) => {
                // Input de jogo tratado no update / input manager
            }
        });

        // Eventos de teclado globais para menu / UI
        window.addEventListener('keydown', (e) => {
            if (this.stateMachine) {
                this.stateMachine.handleInput('keydown', e);
            }
        });

        // Toque no menu (celular): toque numa opção para escolher
        this.canvas.addEventListener('pointerdown', (e) => {
            if (!this.stateMachine || this.stateMachine.currentStateName !== 'menu' || !this.menuUI) return;
            const r = this.canvas.getBoundingClientRect();
            const y = (e.clientY - r.top) * (this.canvas.height / r.height);
            const m = this.menuUI;
            if (m.activeSubmenu) { m.activeSubmenu = null; return; }
            const startY = this.canvas.height / 2 + 20;
            for (let i = 0; i < m.options.length; i++) {
                if (Math.abs(y - (startY + i * 45 - 7)) < 24) { m.selectedOption = i; m.selectOption(); break; }
            }
        });

        // Entra no estado de menu inicial
        this.stateMachine.change('menu');
    }

    // Acha o NPC ou objeto mais perto do jogador (até 90 px)
    findNearTarget() {
        if (!this.currentScene || !this.player) return null;
        const px = this.player.x + (this.player.width || 0) / 2;
        const py = this.player.y + (this.player.height || 0) / 2;
        let best = null, bd = 90;
        for (const e of this.currentScene.entities) {
            if (e === this.player || !e.active) continue;
            const tags = e.tags || [];
            if (!tags.includes('npc') && !tags.includes('interactable')) continue;
            const d = Math.hypot(e.x + (e.width || 0) / 2 - px, e.y + (e.height || 0) / 2 - py);
            if (d < bd) { bd = d; best = e; }
        }
        return best;
    }

    // Fala com o NPC ou usa o objeto
    interactWith(t) {
        if ((t.tags || []).includes('npc')) {
            if (typeof t.interact === 'function') t.interact(this.player);
            if (t.dialogueId) this.dialogue.startDialogue(t.dialogueId);
        } else if (typeof t.interact === 'function') {
            t.interact(this);
            if (t.type === 'clue' && this.hud) this.hud.showPrompt('Pista encontrada: ' + t.name);
        }
    }

    startNewGame() {
        console.log('[Game] Iniciando Novo Jogo...');
        this.playTime = 0;

        // Cria o Jogador se a classe Player existir
        if (typeof Player !== 'undefined') {
            this.player = new Player(400, 300);
        }

        // Carrega a cena inicial (Rua Principal)
        this.changeScene('rua-principal');

        // Muda para o estado playing
        if (this.stateMachine) {
            this.stateMachine.change('playing');
        }
    }

    loadGame() {
        console.log('[Game] Carregando Jogo Salvo...');
        if (this.save && typeof this.save.loadGame === 'function') {
            const success = this.save.loadGame(this);
            if (success && this.stateMachine) {
                this.stateMachine.change('playing');
            }
        }
    }

    changeScene(sceneKey) {
        if (!this.scenes[sceneKey]) {
            console.error(`[Game] Cena "${sceneKey}" não encontrada!`);
            return;
        }

        if (this.currentScene && typeof this.currentScene.teardown === 'function') {
            this.currentScene.teardown(this);
        }

        if (window.lightSystem && typeof window.lightSystem.clear === 'function') window.lightSystem.clear();
        this.skipInteract = true;
        this.currentSceneKey = sceneKey;
        this.currentScene = this.scenes[sceneKey];

        if (this.currentScene && typeof this.currentScene.init === 'function') {
            this.currentScene.init(this);
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        let frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (frameTime > 0.25) {
            frameTime = 0.25;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.step) {
            if (this.input && typeof this.input.update === 'function') {
                this.input.update();
            }
            if (this.stateMachine) {
                this.stateMachine.update(this.step);
            }
            this.accumulator -= this.step;
        }

        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    render() {
        if (!this.renderer) return;

        this.renderer.startFrame();
        this.renderer.clear();

        if (this.stateMachine && typeof this.stateMachine.draw === 'function') {
            this.stateMachine.draw(this.renderer.ctx);
        }

        this.renderer.endFrame();
    }
}

window.GameEngine = new Game();

window.addEventListener('DOMContentLoaded', () => {
    window.GameEngine.init();
});