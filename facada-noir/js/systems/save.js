/**
 * Facada Noir - Sistema de Salvamento (save.js)
 * Serialização e desserialização do estado completo do jogo (player, flags, inventário, capítulo, tempo).
 */

window.SaveSystem = class SaveSystem {
    constructor() {
        this.saveKey = CONFIG.storage.saveKey || 'facada_noir_save_v1';
    }

    saveGame(gameInstance) {
        if (!gameInstance) {
            console.error('[SaveSystem] Instância do jogo inválida para salvamento.');
            return false;
        }

        try {
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                chapter: gameInstance.progression ? gameInstance.progression.currentChapter : 1,
                playTime: gameInstance.playTime || 0,
                player: gameInstance.player ? gameInstance.player.serialize() : null,
                progression: gameInstance.progression ? gameInstance.progression.serialize() : null,
                inventory: gameInstance.inventory ? gameInstance.inventory.items : [],
                investigation: gameInstance.investigation ? gameInstance.investigation.serialize() : null,
                currentScene: gameInstance.currentSceneKey || 'rua-principal'
            };

            const success = Utils.storage.save(this.saveKey, saveData);
            if (success) {
                console.log('[SaveSystem] Jogo salvo com sucesso.');
                if (window.AudioSystem) {
                    window.AudioSystem.playSfx('menu_select');
                }
                return true;
            }
            return false;
        } catch (e) {
            console.error('[SaveSystem] Erro ao serializar dados do jogo:', e);
            return false;
        }
    }

    loadGame(gameInstance) {
        if (!gameInstance) {
            console.error('[SaveSystem] Instância do jogo inválida para carregamento.');
            return false;
        }

        try {
            const saveData = Utils.storage.load(this.saveKey, null);
            if (!saveData) {
                console.log('[SaveSystem] Nenhum save encontrado.');
                return false;
            }

            // Restaurar dados do jogador
            if (gameInstance.player && saveData.player) {
                gameInstance.player.deserialize(saveData.player);
            }

            // Restaurar progressão
            if (gameInstance.progression && saveData.progression) {
                gameInstance.progression.deserialize(saveData.progression);
            }

            // Restaurar inventário
            if (gameInstance.inventory && saveData.inventory) {
                gameInstance.inventory.items = [...saveData.inventory];
            }

            // Restaurar investigação
            if (gameInstance.investigation && saveData.investigation) {
                gameInstance.investigation.deserialize(saveData.investigation);
            }

            // Restaurar tempo e cena
            gameInstance.playTime = saveData.playTime || 0;
            if (saveData.currentScene && gameInstance.changeScene) {
                gameInstance.changeScene(saveData.currentScene);
            }

            console.log('[SaveSystem] Jogo carregado com sucesso.');
            if (window.AudioSystem) {
                window.AudioSystem.playSfx('menu_select');
            }
            return true;
        } catch (e) {
            console.error('[SaveSystem] Erro ao carregar dados do jogo:', e);
            return false;
        }
    }

    hasSave() {
        const saveData = Utils.storage.load(this.saveKey, null);
        return saveData !== null;
    }

    deleteSave() {
        const success = Utils.storage.remove(this.saveKey);
        if (success) {
            console.log('[SaveSystem] Save deletado com sucesso.');
        }
        return success;
    }
};