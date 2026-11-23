window.Controls = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  
  init() {
    window.addEventListener('keydown', e => this.set(e.code, true));
    window.addEventListener('keyup', e => this.set(e.code, false));
    
    const leftBtn = document.getElementById('btn-left');
    const rightBtn = document.getElementById('btn-right');
    const upBtn = document.getElementById('btn-up');
    const downBtn = document.getElementById('btn-down');
    const fireBtn = document.getElementById('btn-fire');
    
    const addTouch = (btn, prop) => {
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); this[prop] = true; }, { passive: false });
      btn.addEventListener('touchend', e => { e.preventDefault(); this[prop] = false; }, { passive: false });
      btn.addEventListener('mousedown', e => { e.preventDefault(); this[prop] = true; });
      btn.addEventListener('mouseup', e => { e.preventDefault(); this[prop] = false; });
      btn.addEventListener('mouseleave', e => { this[prop] = false; });
    };
    
    addTouch(leftBtn, 'left');
    addTouch(rightBtn, 'right');
    addTouch(upBtn, 'up');
    addTouch(downBtn, 'down');
    addTouch(fireBtn, 'fire');
  },
  
  set(code, value) {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': this.left = value; break;
      case 'ArrowRight': case 'KeyD': this.right = value; break;
      case 'ArrowUp': case 'KeyW': this.up = value; break;
      case 'ArrowDown': case 'KeyS': this.down = value; break;
      case 'Space': case 'KeyK': case 'KeyJ': this.fire = value; break;
    }
  }
};