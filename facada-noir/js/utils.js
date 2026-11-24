/**
 * Facada Noir - Utilitários e Helpers
 * Funções auxiliares para matemática, manipulação de dados e localStorage.
 */

const Utils = {
    // Retorna um número aleatório entre min e max (inclusivo)
    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Retorna um float aleatório entre min e max
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Garante que um valor está entre min e max
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    // Interpolação linear entre a e b por t (0 a 1)
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    // Calcula a distância euclidiana entre dois pontos
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Verifica colisão AABB (Axis-Aligned Bounding Box) entre dois retângulos
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    // Formata segundos em MM:SS
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    // Wrapper seguro para LocalStorage
    storage: {
        save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error("Erro ao salvar no localStorage:", e);
                return false;
            }
        },

        load(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error("Erro ao carregar do localStorage:", e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error("Erro ao remover do localStorage:", e);
                return false;
            }
        }
    }
};

window.Utils = Utils;