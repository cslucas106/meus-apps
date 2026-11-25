/**
 * facada-noir/js/entities/light.js
 * Sistema de luz dinâmica: lanterninha do jogador, luzes fixas e sombras/iluminação ambiente.
 */

class LightSystem {
    constructor() {
        this.lights = [];
        this.ambientColor = 'rgba(5, 5, 8, 0.85)';
    }

    addLight(light) {
        this.lights.push(light);
    }

    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index !== -1) {
            this.lights.splice(index, 1);
        }
    }

    clear() {
        this.lights = [];
    }

    update(dt) {
        // Atualiza animações ou piscar de luzes se necessário
        for (let light of this.lights) {
            if (light.flicker) {
                light.flickerTimer = (light.flickerTimer || 0) + dt;
                if (light.flickerTimer > 0.1) {
                    light.currentIntensity = light.intensity + (Math.random() * 0.2 - 0.1);
                    light.flickerTimer = 0;
                }
            } else {
                light.currentIntensity = light.intensity;
            }
        }
    }

    render(ctx, camera, player) {
        if (!ctx) return;

        ctx.save();
        
        // Aplica escuridão ambiente no canvas inteiro
        ctx.fillStyle = this.ambientColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Configura composição para "cortar" a escuridão com luzes
        ctx.globalCompositeOperation = 'destination-out';

        // Renderiza luz fixa
        for (let light of this.lights) {
            const screenX = light.x - camera.x;
            const screenY = light.y - camera.y;

            // Culling simples
            if (screenX + light.radius < 0 || screenX - light.radius > ctx.canvas.width ||
                screenY + light.radius < 0 || screenY - light.radius > ctx.canvas.height) {
                continue;
            }

            const gradient = ctx.createRadialGradient(
                screenX, screenY, light.radius * 0.1,
                screenX, screenY, light.radius
            );
            gradient.addColorStop(0, `rgba(0, 0, 0, ${light.currentIntensity || light.intensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, light.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Renderiza lanterna do jogador se ativo
        if (player && player.flashlightOn && player.battery > 0) {
            const pScreenX = player.x + player.width / 2 - camera.x;
            const pScreenY = player.y + player.height / 2 - camera.y;

            const coneLength = 220;
            const coneAngle = Math.PI / 3; // 60 graus
            
            // Direção baseada na última direção do player
            let baseAngle = 0;
            if (player.dirX === 1 && player.dirY === 0) baseAngle = 0;
            else if (player.dirX === -1 && player.dirY === 0) baseAngle = Math.PI;
            else if (player.dirX === 0 && player.dirY === 1) baseAngle = Math.PI / 2;
            else if (player.dirX === 0 && player.dirY === -1) baseAngle = -Math.PI / 2;
            else if (player.dirX > 0 && player.dirY > 0) baseAngle = Math.PI / 4;
            else if (player.dirX < 0 && player.dirY > 0) baseAngle = (3 * Math.PI) / 4;
            else if (player.dirX < 0 && player.dirY < 0) baseAngle = (-3 * Math.PI) / 4;
            else if (player.dirX > 0 && player.dirY < 0) baseAngle = -Math.PI / 4;

            ctx.beginPath();
            ctx.moveTo(pScreenX, pScreenY);
            ctx.arc(pScreenX, pScreenY, coneLength, baseAngle - coneAngle / 2, baseAngle + coneAngle / 2);
            ctx.closePath();

            const coneGradient = ctx.createRadialGradient(
                pScreenX, pScreenY, 10,
                pScreenX, pScreenY, coneLength
            );
            coneGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
            coneGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
            coneGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = coneGradient;
            ctx.fill();

            // Orbe suave ao redor do jogador
            const playerGlow = ctx.createRadialGradient(
                pScreenX, pScreenY, 5,
                pScreenX, pScreenY, 60
            );
            playerGlow.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            playerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = playerGlow;
            ctx.beginPath();
            ctx.arc(pScreenX, pScreenY, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Instância global de luzes
window.lightSystem = new LightSystem();

class Light extends Entity {
    constructor(x, y, opts = {}) {
        super(x, y, 1, 1, ['light']);
        this.radius = opts.radius || 200;
        this.color = opts.color || 'rgba(255,220,150,0.15)';
        this.intensity = opts.intensity != null ? opts.intensity : 1;
        this.flicker = !!opts.flicker;
        window.lightSystem.addLight(this);
    }
}
window.Light = Light;