/**
 * Facada Noir - Configurações Globais (config.js)
 * Constantes, paleta de cores, resoluções e estados do jogo.
 */

const CONFIG = {
    // Canvas e Resolução
    canvas: {
        width: 1280,
        height: 720,
        pixelArt: false
    },

    // Paleta Noir com acentos vermelhos
    colors: {
        bg: '#0a0a0a',
        black: '#000000',
        white: '#f4f4f4',
        grayLight: '#cccccc',
        grayMid: '#777777',
        grayDark: '#333333',
        redBlood: '#8b0000',
        redAccent: '#ff1a1a',
        redGlow: 'rgba(255, 26, 26, 0.4)',
        shadow: 'rgba(0, 0, 0, 0.85)'
    },

    // Camadas Z (Z-Index para renderização)
    layers: {
        background: 0,
        decor: 1,
        entities: 2,
        player: 3,
        foreground: 4,
        lighting: 5,
        ui: 6,
        transition: 7
    },

    // Estados do Jogo (Máquina de Estados)
    states: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        DIALOGUE: 'dialogue',
        INVESTIGATION: 'investigation',
        GAMEOVER: 'gameover',
        CREDITS: 'credits'
    },

    // Chaves para LocalStorage
    storage: {
        saveKey: 'facada_noir_save_v1',
        settingsKey: 'facada_noir_settings_v1'
    },

    // Configurações de Gameplay
    player: {
        speed: 220,
        runMultiplier: 1.6,
        staminaMax: 100,
        staminaDrain: 25,
        staminaRegen: 30,
        flashlightBatteryMax: 100,
        flashlightDrainRate: 2.5 // por segundo ligado
    },

    // Configurações de Áudio Padrão
    audio: {
        masterVolume: 0.8,
        sfxVolume: 1.0,
        musicVolume: 0.7
    }
};

// Congela o objeto de configuração para evitar mutações acidentais
Object.freeze(CONFIG);