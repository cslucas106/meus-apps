/**
 * input.js - Gerenciador de entrada (Teclado, Mouse e Touch / Joystick Virtual)
 * Facada Noir
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            isDown: false,
            wasPressed: false,
            isRightDown: false,
            wasRightPressed: false
        };
        this.touch = {
            active: false,
            id: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            vector: { x: 0, y: 0 }
        };
        this.actions = {
            up: false,
            down: false,
            left: false,
            right: false,
            interact: false,
            run: false,
            flashlight: false,
            notebook: false,
            pause: false
        };
        this.previousActions = {};
        
        // Mapeamento de teclas
        this.keyMap = {
            'KeyW': 'up',
            'ArrowUp': 'up',
            'KeyS': 'down',
            'ArrowDown': 'down',
            'KeyA': 'left',
            'ArrowLeft': 'left',
            'KeyD': 'right',
            'ArrowRight': 'right',
            'KeyE': 'interact',
            'Space': 'interact',
            'ShiftLeft': 'run',
            'ShiftRight': 'run',
            'KeyF': 'flashlight',
            'KeyTab': 'notebook',
            'KeyQ': 'notebook',
            'Escape': 'pause'
        };

        this._setupListeners();
    }

    _setupListeners() {
        // Eventos de Teclado
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Eventos de Mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Converter para coordenadas do canvas se necessário
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                this.mouse.canvasX = (e.clientX - rect.left) * scaleX;
                this.mouse.canvasY = (e.clientY - rect.top) * scaleY;
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = true;
                this.mouse.wasPressed = true;
            } else if (e.button === 2) {
                this.mouse.isRightDown = true;
                this.mouse.wasRightPressed = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = false;
            } else if (e.button === 2) {
                this.mouse.isRightDown = false;
            }
        });

        window.addEventListener('contextmenu', (e) => {
            // Prevenir menu de contexto em mobile/canvas se necessário
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        });

        // Configuração de Touch (Joystick Virtual)
        this._setupTouchControls();
    }

    _setupTouchControls() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            
            // Se tocar na metade esquerda, ativa o joystick virtual
            if (touch.clientX < window.innerWidth / 2 && !this.touch.active) {
                this.touch.active = true;
                this.touch.id = touch.identifier;
                this.touch.startX = touch.clientX;
                this.touch.startY = touch.clientY;
                this.touch.currentX = touch.clientX;
                this.touch.currentY = touch.clientY;
                this.touch.vector = { x: 0, y: 0 };
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.touch.id) {
                    this.touch.currentX = touch.clientX;
                    this.touch.currentY = touch.clientY;
                    
                    const dx = this.touch.currentX - this.touch.startX;
                    const dy = this.touch.currentY - this.touch.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 50; // Raio máximo do joystick
                    
                    if (dist > 0) {
                        const clampedDist = Math.min(dist, maxDist);
                        this.touch.vector.x = (dx / dist) * (clampedDist / maxDist);
                        this.touch.vector.y = (dy / dist) * (clampedDist / maxDist);
                    } else {
                        this.touch.vector.x = 0;
                        this.touch.vector.y = 0;
                    }
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.touch.id) {
                    this.touch.active = false;
                    this.touch.id = null;
                    this.touch.vector = { x: 0, y: 0 };
                }
            }
        };

        canvas.addEventListener('touchend', endTouch);
        canvas.addEventListener('touchcancel', endTouch);
    }

    update() {
        // Copiar ações atuais para anteriores para detectar 'justPressed'
        this.previousActions = { ...this.actions };
        this.previousKeys = { ...this.keys };
        
        this.mouse.wasPressed = false;
        this.mouse.wasRightPressed = false;

        // Resetar ações
        for (let action in this.actions) {
            this.actions[action] = false;
        }

        // Mapear teclado para ações
        for (let code in this.keyMap) {
            const action = this.keyMap[code];
            if (this.keys[code]) {
                this.actions[action] = true;
            }
        }

        // Integrar toque / joystick virtual nas ações de direção
        if (this.touch.active) {
            const threshold = 0.2;
            if (this.touch.vector.x < -threshold) this.actions.left = true;
            if (this.touch.vector.x > threshold) this.actions.right = true;
            if (this.touch.vector.y < -threshold) this.actions.up = true;
            if (this.touch.vector.y > threshold) this.actions.down = true;
        }
    }

    isDown(action) {
        return !!this.actions[action];
    }

    wasPressed(action) {
        return !!this.actions[action] && !this.previousActions[action];
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    wasKeyPressed(code) {
        return !!this.keys[code] && !this.previousKeys[code];
    }
}