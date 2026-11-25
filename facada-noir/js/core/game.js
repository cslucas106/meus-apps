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

        // Instancia UI & HUD
        if (window.HUD) this.hud = new window.HUD();
        if (window.DialogueBox) this.dialogueBox = new window.DialogueBox();
        if (window.NotebookUI) this.notebook = new window.NotebookUI();
        if (window.MenuUI) this.menuUI = new window.MenuUI();
        if (window.TransitionSystem) this.transition = new window.TransitionSystem();

        // Registra cenas disponíveis
        if (window.RuaPrincipalScene) {
            this.scenes['rua-principal'] = new window.RuaPrincipalScene();
        }

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
                if (this.currentScene && typeof this.currentScene.update === 'function') {
                    this.currentScene.update(dt, this);
                }
                if (this.hud && typeof this.hud.update === 'function') {
                    this.hud.update(dt, this);
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
                    this.hud.draw(this.renderer);
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

        // Entra no estado de menu inicial
        this.stateMachine.change('menu');
    }

    startNewGame() {
        console.log('[Game] Iniciando Novo Jogo...');
        this.playTime = 0;

        // Cria o Jogador se a classe Player existir
        if (window.Player) {
            this.player = new window.Player(400, 300);
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