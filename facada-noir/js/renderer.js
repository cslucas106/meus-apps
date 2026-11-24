const Renderer = (function() {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let screenShakeTimer = 0;
  let screenShakeIntensity = 0;

  function init() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.error('Canvas #game-canvas not found!');
      return false;
    }
    
    ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.error('Could not get 2D context from canvas!');
      return false;
    }

    resize();
    window.addEventListener('resize', () => resize());
    window.addEventListener('orientationchange', () => {
      setTimeout(resize, 200);
    });

    return true;
  }

  function resize() {
    pixelRatio = window.devicePixelRatio || 1;
    
    // Get container width/height
    const container = document.getElementById('game-container');
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    // Logical game resolution from CONSTANTS
    const targetWidth = CONSTANTS.GAME.CANVAS_WIDTH;
    const targetHeight = CONSTANTS.GAME.CANVAS_HEIGHT;

    // Maintain aspect ratio or fit container
    const scaleX = containerWidth / targetWidth;
    const scaleY = containerHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);

    width = targetWidth;
    height = targetHeight;

    // Set CSS size (display size)
    canvas.style.width = `${Math.floor(targetWidth * scale)}px`;
    canvas.style.height = `${Math.floor(targetHeight * scale)}px`;

    // Set internal canvas resolution (for crisp rendering on Retina/HiDPI screens)
    canvas.width = Math.floor(targetWidth * pixelRatio);
    canvas.height = Math.floor(targetHeight * pixelRatio);

    ctx.resetTransform();
    ctx.scale(pixelRatio, pixelRatio);
  }

  function clear() {
    ctx.save();
    
    // Apply screen shake if active
    if (screenShakeTimer > 0) {
      const offsetX = (Math.random() * 2 - 1) * screenShakeIntensity;
      const offsetY = (Math.random() * 2 - 1) * screenShakeIntensity;
      ctx.translate(offsetX, offsetY);
      screenShakeTimer -= 1/60;
      screenShakeIntensity *= CONSTANTS.PHYSICS.SHAKE_DECAY;
    }

    // Draw noir background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, CONSTANTS.COLORS.NOIR_BLACK);
    bgGradient.addColorStop(0.5, CONSTANTS.COLORS.NOIR_DARK);
    bgGradient.addColorStop(1, CONSTANTS.COLORS.NOIR_GRAY);
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle atmospheric vignette
    drawVignette();

    ctx.restore();
  }

  function drawVignette() {
    ctx.save();
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.8
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(10, 10, 15, 0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function triggerScreenShake(intensity = CONSTANTS.PHYSICS.SHAKE_INTENSITY, duration = 0.2) {
    if (typeof SETTINGS !== 'undefined' && SETTINGS.screenShake === false) return;
    screenShakeIntensity = intensity;
    screenShakeTimer = duration;
  }

  function drawTarget(target) {
    if (!target) return;
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(target.rotation);

    const radius = target.radius || 80;
    
    // Outer wooden/metallic ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = target.color || '#5d4037';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = target.ringColor || '#3e2723';
    ctx.stroke();

    // Inner concentric circles (dartboard pattern)
    const rings = 4;
    for (let i = 1; i < rings; i++) {
      const r = radius * (1 - i / rings);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? (target.color || '#5d4037') : (target.ringColor || '#3e2723');
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = CONSTANTS.COLORS.NOIR_GOLD_DIM;
      ctx.stroke();
    }

    // Bullseye center
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = CONSTANTS.COLORS.NOIR_RED_BRIGHT;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = CONSTANTS.COLORS.NOIR_GOLD;
    ctx.stroke();

    ctx.restore();
  }

  function drawKnife(knife) {
    if (!knife) return;
    ctx.save();
    ctx.translate(knife.x, knife.y);
    ctx.rotate(knife.rotation);

    const w = knife.width || 6;
    const h = knife.height || 72;
    const halfW = w / 2;
    const halfH = h / 2;

    // Trail effect if moving fast
    if (knife.trail && knife.trail.length > 1) {
      ctx.save();
      ctx.resetTransform();
      ctx.beginPath();
      ctx.moveTo(knife.trail[0].x, knife.trail[0].y);
      for (let i = 1; i < knife.trail.length; i++) {
        ctx.lineTo(knife.trail[i].x, knife.trail[i].y);
      }
      ctx.strokeStyle = knife.trailColor || CONSTANTS.COLORS.NOIR_GOLD;
      ctx.lineWidth = w * 0.8;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.restore();
    }

    // Blade
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(halfW, -halfH + h * 0.3);
    ctx.lineTo(halfW, halfH * 0.2);
    ctx.lineTo(0, halfH);
    ctx.lineTo(-halfW, halfH * 0.2);
    ctx.lineTo(-halfW, -halfH + h * 0.3);
    ctx.closePath();

    const bladeGradient = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    bladeGradient.addColorStop(0, '#a8a8a0');
    bladeGradient.addColorStop(0.5, '#ffffff');
    bladeGradient.addColorStop(1, '#787870');
    ctx.fillStyle = bladeGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = CONSTANTS.COLORS.NOIR_BLACK;
    ctx.stroke();

    // Guard (Crossguard)
    ctx.beginPath();
    ctx.rect(-halfW * 2.5, halfH * 0.2 - 3, halfW * 5, 6);
    ctx.fillStyle = CONSTANTS.COLORS.NOIR_GOLD;
    ctx.fill();
    ctx.strokeStyle = CONSTANTS.COLORS.NOIR_BLACK;
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.rect(-halfW * 0.8, halfH * 0.2 + 3, halfW * 1.6, h * 0.35);
    ctx.fillStyle = CONSTANTS.COLORS.NOIR_DARK;
    ctx.fill();
    ctx.stroke();

    // Pommel
    ctx.beginPath();
    ctx.arc(0, halfH - 4, halfW * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = CONSTANTS.COLORS.NOIR_GOLD;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles(particles) {
    if (!particles || particles.length === 0) return;
    ctx.save();
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha || 1;
      ctx.fillStyle = p.color || CONSTANTS.COLORS.NOIR_GOLD;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  function drawHUD(gameState) {
    // HUD is mostly handled by DOM overlay, but dynamic score popups or aim guides can be drawn here if needed.
  }

  return {
    init,
    resize,
    clear,
    drawTarget,
    drawKnife,
    drawParticles,
    drawHUD,
    triggerScreenShake,
    getContext: () => ctx,
    getWidth: () => width,
    getHeight: () => height,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}