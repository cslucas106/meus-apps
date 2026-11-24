/**
 * Facada Noir - State Machine
 * Gerencia os estados principais do jogo (menu, playing, paused, dialogue, investigation, gameover, credits)
 */

class StateMachine {
    constructor() {
        this.states = {};
        this.currentState = null;
        this.currentStateName = null;
        this.previousStateName = null;
    }

    /**
     * Registra um novo estado
     * @param {string} name 
     * @param {Object} stateObj - Contém enter, exit, update, draw, handleInput
     */
    add(name, stateObj) {
        this.states[name] = stateObj;
    }

    /**
     * Alterna para um novo estado
     * @param {string} name 
     * @param {Object} data - Dados opcionais passados para o método enter
     */
    async change(name, data = {}) {
        if (!this.states[name]) {
            console.warn(`[StateMachine] Estado "${name}" não encontrado.`);
            return false;
        }

        this.previousStateName = this.currentStateName;

        // Executa saída do estado atual
        if (this.currentState && typeof this.currentState.exit === 'function') {
            await this.currentState.exit();
        }

        this.currentStateName = name;
        this.currentState = this.states[name];

        // Executa entrada no novo estado
        if (this.currentState && typeof this.currentState.enter === 'function') {
            await this.currentState.enter(data);
        }

        return true;
    }

    /**
     * Atualiza o estado atual
     * @param {number} dt 
     */
    update(dt) {
        if (this.currentState && typeof this.currentState.update === 'function') {
            this.currentState.update(dt);
        }
    }

    /**
     * Renderiza o estado atual
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (this.currentState && typeof this.currentState.draw === 'function') {
            this.currentState.draw(ctx);
        }
    }

    /**
     * Trata eventos de input no estado atual
     * @param {string} type - Tipo de evento (keydown, click, etc.)
     * @param {Object} event - Objeto do evento
     */
    handleInput(type, event) {
        if (this.currentState && typeof this.currentState.handleInput === 'function') {
            this.currentState.handleInput(type, event);
        }
    }
}

window.StateMachine = StateMachine;