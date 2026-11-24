/**
 * facada-noir/js/core/renderer.js
 * Gerenciador de renderização com suporte a camadas, efeitos noir (vinheta, film grain) e screen shake.
 */

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Resolução lógica base
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    // Efeito de Screen Shake
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.shakeTimer = 0;

    // Configuração de redimensionamento
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const container = this.canvas.parentElement;
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    const scaleX = containerWidth / this.width;
    const scaleY = containerHeight / this.height;
    const scale = Math.min(scaleX, scaleY);

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;

    // Garante renderização pixel-art nítida se necessário
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BLACK;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  startFrame() {
    this.ctx.save();

    // Aplicação do Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeTimer += 1;
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.ctx.translate(offsetX, offsetY);

      this.shakeDuration -= 1;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  endFrame() {
    this.ctx.restore();
    this.applyNoirPostProcessing();
  }

  addShake(duration, intensity) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  applyNoirPostProcessing() {
    const ctx = this.ctx;
    
    // 1. Vinheta pesada nas bordas
    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.3,
      this.width / 2, this.height / 2, this.width * 0.8
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Film Grain sutil (ruído estático)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Métodos utilitários de desenho
  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawCircle(x, y, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawText(text, x, y, font = '16px Courier New', color = CONFIG.COLORS.WHITE, align = 'left') {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }
}