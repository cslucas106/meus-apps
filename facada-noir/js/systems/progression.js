/**
 * Facada Noir - Sistema de Progressão (progression.js)
 * Gerenciamento de capítulos, objetivos, checkpoints, flags globais e New Game+.
 */

window.ProgressionSystem = class ProgressionSystem {
    constructor() {
        this.currentChapter = 1;
        this.flags = {}; // Flags globais de história (flagName -> boolean/value)
        this.objectives = []; // Lista de objetivos atuais
        this.progressionData = {}; // Dados carregados de progression.json
    }

    init(progressionJson) {
        this.progressionData = progressionJson || {};
        this.currentChapter = 1;
        this.flags = {};
        this.objectives = [
            { id: 'explore_scene', text: 'Investigue a cena do crime e descubra pistas iniciais.', completed: false }
        ];
    }

    setFlag(flagName, value = true) {
        this.flags[flagName] = value;
        console.log(`[Progression] Flag definida: ${flagName} = ${value}`);
        this.checkObjectives();
    }

    getFlag(flagName, defaultValue = false) {
        return this.flags[flagName] !== undefined ? this.flags[flagName] : defaultValue;
    }

    hasFlag(flagName) {
        return !!this.flags[flagName];
    }

    advanceChapter(nextChapter) {
        this.currentChapter = nextChapter;
        console.log(`[Progression] Avançou para o Capítulo ${this.currentChapter}`);
        if (window.AudioSystem) {
            window.AudioSystem.playSfx('eureka');
        }
        
        // Disparar evento global se necessário
        if (window.Game && window.Game.handleChapterChanged) {
            window.Game.handleChapterChanged(this.currentChapter);
        }
    }

    completeObjective(objectiveId) {
        const obj = this.objectives.find(o => o.id === objectiveId);
        if (obj && !obj.completed) {
            obj.completed = true;
            console.log(`[Progression] Objetivo concluído: ${obj.text}`);
            if (window.AudioSystem) {
                window.AudioSystem.playSfx('clue_found');
            }
            return true;
        }
        return false;
    }

    addObjective(id, text) {
        if (!this.objectives.some(o => o.id === id)) {
            this.objectives.push({ id, text, completed: false });
            console.log(`[Progression] Novo objetivo: ${text}`);
        }
    }

    checkObjectives() {
        // Lógica de verificação automática baseada em flags, se aplicável
    }

    serialize() {
        return {
            currentChapter: this.currentChapter,
            flags: { ...this.flags },
            objectives: [...this.objectives]
        };
    }

    deserialize(data) {
        if (!data) return;
        this.currentChapter = data.currentChapter || 1;
        this.flags = data.flags ? { ...data.flags } : {};
        this.objectives = data.objectives ? [...data.objectives] : [];
    }
};