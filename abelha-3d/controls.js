// Controle Perfeito e Fluido para Dispositivos Móveis e Teclado (Movimento e Subida Simultâneos)
class Controls {
  constructor() {
    this.moveX = 0;
    this.moveZ = 0;
    this.moveY = 0;

    this.keys = {};
    this.touchMoveX = 0;
    this.touchMoveZ = 0;
    this.touchMoveY = 0;

    this.initKeyboard();
    this.initVirtualJoystick();
    this.initHeightButtons();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.updateKeyboardVector();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.updateKeyboardVector();
    });
  }

  updateKeyboardVector() {
    let x = 0;
    let z = 0;
    let y = 0;

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) z -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) z += 1;

    if (this.keys['Space'] || this.keys['KeyE'] || this.keys['KeyR']) y += 1;
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyQ'] || this.keys['KeyF']) y -= 1;

    this.keyMoveX = x;
    this.keyMoveZ = z;
    this.keyMoveY = y;

    this.combineInputs();
  }

  initVirtualJoystick() {
    const container = document.getElementById('joystick-container');
    const stick = document.getElementById('joystick-stick');
    if (!container || !stick) return;

    let active = false;
    let startX = 0;
    let startY = 0;
    const maxDist = 45;

    const onStart = (clientX, clientY) => {
      active = true;
      const rect = container.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };

    const onMove = (clientX, clientY) => {
      if (!active) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
      const angle = Math.atan2(dy, dx);

      const limitedX = Math.cos(angle) * dist;
      const limitedY = Math.sin(angle) * dist;

      stick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

      this.touchMoveX = limitedX / maxDist;
      this.touchMoveZ = limitedY / maxDist;
      this.combineInputs();
    };

    const onEnd = () => {
      active = false;
      stick.style.transform = `translate(0px, 0px)`;
      this.touchMoveX = 0;
      this.touchMoveZ = 0;
      this.combineInputs();
    };

    container.addEventListener('touchstart', (e) => {
      onStart(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (active && e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (active) onEnd();
    });

    container.addEventListener('mousedown', (e) => {
      onStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (active) onMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (active) onEnd();
    });
  }

  initHeightButtons() {
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    if (!btnUp || !btnDown) return;

    const bindTouchAndMouse = (btn, direction) => {
      const start = (e) => {
        e.preventDefault();
        this.touchMoveY = direction;
        this.combineInputs();
        btn.style.transform = 'scale(0.9)';
      };

      const end = (e) => {
        e.preventDefault();
        this.touchMoveY = 0;
        this.combineInputs();
        btn.style.transform = 'scale(1)';
      };

      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    };

    bindTouchAndMouse(btnUp, 1);
    bindTouchAndMouse(btnDown, -1);
  }

  combineInputs() {
    const kx = this.keyMoveX || 0;
    const kz = this.keyMoveZ || 0;
    const ky = this.keyMoveY || 0;

    const tx = this.touchMoveX || 0;
    const tz = this.touchMoveZ || 0;
    const ty = this.touchMoveY || 0;

    this.moveX = Math.max(-1, Math.min(1, kx + tx));
    this.moveZ = Math.max(-1, Math.min(1, kz + tz));
    this.moveY = Math.max(-1, Math.min(1, ky + ty));
  }
}

const controls = new Controls();