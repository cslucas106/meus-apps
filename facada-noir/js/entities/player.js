/**
 * Facada Noir - Player Entity
 * O detetive protagonista: movimento 8-direções, animações, stamina para correr,
 * lanterna ajustável, inventário e interação com o mundo.
 */

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, 48, 'player');
        
        // Atributos de movimento e física
        this.speed = CONFIG.PLAYER_SPEED || 140;
        this.runMultiplier = 1.6;
        this.vx = 0;
        this.vy = 0;
        this.facing = 'down'; // 'up', 'down', 'left', 'right'
        
        // Stamina
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaDrainRate = 35; // por segundo correndo
        this.staminaRegenRate = 25; // por segundo parado/andando
        this.isExhausted = false;
        
        // Lanterninha / Visão
        this.hasFlashlight = true;
        this.flashlightOn = true;
        this.flashlightAngle = 0;
        this.battery = 100;
        this.maxBattery = 100;
        this.batteryDrainRate = 1.5; // por segundo ligada
        
        // Inventário e Interação
        this.inventory = [];
        this.maxInventorySize = CONFIG.MAX_INVENTORY || 8;
        this.interactionRadius = 40;
        this.currentInteractable = null;
        this.cluesFound = [];
        
        // Estado visual
        this.animTimer = 0;
        this.animFrame = 0;
        this.isMoving = false;
        this.isRunning = false;
        
        // Hitbox ajustada para os pés (detecção de colisão isométrica/top-down melhor)
        this.hitbox = {
            offsetX: 4,
            offsetY: 32,
            width: 20,
            height: 16
        };
    }

    update(dt, game) {
        // Obter inputs
        const input = game && game.input ? game.input : (window.game && window.game.input ? window.game.input : null);
        
        let moveX = 0;
        let moveY = 0;

        if (input) {
            // Teclado / Toque
            if (input.isDown('UP') || input.isDown('W')) moveY -= 1;
            if (input.isDown('DOWN') || input.isDown('S')) moveY += 1;
            if (input.isDown('LEFT') || input.isDown('A')) moveX -= 1;
            if (input.isDown('RIGHT') || input.isDown('D')) moveX += 1;

            // Suporte a Joystick Virtual (se mobile)
            if (input.joystick && input.joystick.active) {
                moveX = input.joystick.x;
                moveY = input.joystick.y;
            }

            // Alternar lanterna (tecla F ou botão)
            if (input.isPressed('FLASHLIGHT') || input.isPressed('F')) {
                this.toggleFlashlight();
            }

            // Ação / Interagir (tecla E, Enter ou Espaço)
            if (input.isPressed('INTERACT') || input.isPressed('E') || input.isPressed('SPACE')) {
                this.interact(game);
            }
        }

        // Normalizar vetor de movimento diagonal
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        if (length > 0) {
            moveX /= length;
            moveY /= length;
            this.isMoving = true;

            // Determinar direção predominante
            if (Math.abs(moveX) > Math.abs(moveY)) {
                this.facing = moveX > 0 ? 'right' : 'left';
            } else {
                this.facing = moveY > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }

        // Correr (Shift ou botão dedicado)
        let wantsToRun = input && (input.isDown('RUN') || input.isDown('SHIFT'));
        if (wantsToRun && this.isMoving && !this.isExhausted && this.stamina > 5) {
            this.isRunning = true;
            this.stamina -= this.staminaDrainRate * dt;
            if (this.stamina <= 0) {
                this.stamina = 0;
                this.isExhausted = true;
            }
        } else {
            this.isRunning = false;
            // Recuperar stamina
            if (!wantsToRun || !this.isMoving) {
                this.stamina += this.staminaRegenRate * dt;
                if (this.stamina >= this.maxStamina) {
                    this.stamina = this.maxStamina;
                    this.isExhausted = false;
                }
                if (this.isExhausted && this.stamina > CONFIG.STAMINA_RECOVERY_THRESHOLD || 30) {
                    this.isExhausted = false;
                }
            }
        }

        // Aplicar velocidade
        let currentSpeed = this.speed;
        if (this.isRunning) currentSpeed *= this.runMultiplier;
        if (this.isExhausted) currentSpeed *= 0.6;

        this.vx = moveX * currentSpeed;
        this.vy = moveY * currentSpeed;

        // Atualizar posição com base na velocidade e delta time
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Atualizar ângulo da lanterna com base no facing
        switch (this.facing) {
            case 'up': this.flashlightAngle = -Math.PI / 2; break;
            case 'down': this.flashlightAngle = Math.PI / 2; break;
            case 'left': this.flashlightAngle = Math.PI; break;
            case 'right': this.flashlightAngle = 0; break;
        }

        // Bateria da lanterna
        if (this.flashlightOn && this.hasFlashlight) {
            this.battery -= this.batteryDrainRate * dt;
            if (this.battery <= 0) {
                this.battery = 0;
                this.flashlightOn = false;
                if (window.AudioSystem) {
                    window.AudioSystem.playSFX('click');
                }
            }
        }

        // Animação frames
        if (this.isMoving) {
            this.animTimer += dt * (this.isRunning ? 12 : 8);
            if (this.animTimer >= 1) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra suave sob o detetive
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height - 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Estilo Noir: Detetive de sobretudo em tons monocromáticos com gravata vermelha
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        // Corpo / Sobretudo
        ctx.fillStyle = '#222222';
        ctx.fillRect(px + 4, py + 16, 20, 24);

        // Chapéu Fedora
        ctx.fillStyle = '#111111';
        ctx.fillRect(px + 2, py + 8, 24, 6);
        ctx.fillRect(px + 6, py + 2, 16, 7);

        // Acento Noir: Gravata vermelha sutil (marca registrada)
        ctx.fillStyle = CONFIG.ACCENT_COLOR || '#e74c3c';
        ctx.fillRect(px + 12, py + 18, 4, 8);

        // Rosto / Pele (sombreada)
        ctx.fillStyle = '#777777';
        ctx.fillRect(px + 8, py + 14, 12, 6);

        // Pernas (simulação simples de caminhada)
        ctx.fillStyle = '#1a1a1a';
        let legOffset = this.isMoving ? Math.sin(this.animTimer * Math.PI * 4) * 4 : 0;
        ctx.fillRect(px + 7, py + 40, 5, 8 + legOffset);
        ctx.fillRect(px + 16, py + 40, 5, 8 - legOffset);

        // Indicador visual se exausto
        if (this.isExhausted) {
            ctx.fillStyle = CONFIG.ACCENT_COLOR || '#e74c3c';
            ctx.font = '10px monospace';
            ctx.fillText('...', px + 10, py);
        }

        ctx.restore();
    }

    toggleFlashlight() {
        if (!this.hasFlashlight || this.battery <= 0) return;
        this.flashlightOn = !this.flashlightOn;
        if (window.AudioSystem) {
            window.AudioSystem.playSFX('click');
        }
    }

    interact(game) {
        // Se houver um interativo próximo, acionar
        if (this.currentInteractable && typeof this.currentInteractable.onInteract === 'function') {
            this.currentInteractable.onInteract(this, game);
        }
    }

    addItem(item) {
        if (this.inventory.length < this.maxInventorySize) {
            this.inventory.push(item);
            if (window.AudioSystem) {
                window.AudioSystem.playSFX('pickup');
            }
            return true;
        }
        return false;
    }

    hasItem(itemId) {
        return this.inventory.some(item => item.id === itemId);
    }

    addClue(clue) {
        if (!this.cluesFound.some(c => c.id === clue.id)) {
            this.cluesFound.push(clue);
            if (window.AudioSystem) {
                window.AudioSystem.playSFX('eureka');
            }
            return true;
        }
        return false;
    }

    getData() {
        return {
            x: this.x,
            y: this.y,
            facing: this.facing,
            stamina: this.stamina,
            battery: this.battery,
            flashlightOn: this.flashlightOn,
            inventory: this.inventory,
            cluesFound: this.cluesFound
        };
    }

    setData(data) {
        if (!data) return;
        this.x = data.x !== undefined ? data.x : this.x;
        this.y = data.y !== undefined ? data.y : this.y;
        this.facing = data.facing || this.facing;
        this.stamina = data.stamina !== undefined ? data.stamina : this.stamina;
        this.battery = data.battery !== undefined ? data.battery : this.battery;
        this.flashlightOn = data.flashlightOn !== undefined ? data.flashlightOn : this.flashlightOn;
        this.inventory = data.inventory || [];
        this.cluesFound = data.cluesFound || [];
    }
}