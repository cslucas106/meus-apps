const Utils = {
  math: {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    lerp(start, end, t) {
      return start + (end - start) * this.clamp(t, 0, 1);
    },

    lerpAngle(start, end, t) {
      const diff = ((end - start + Math.PI) % (2 * Math.PI)) - Math.PI;
      return start + diff * this.clamp(t, 0, 1);
    },

    map(value, inMin, inMax, outMin, outMax) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    random(min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
      return Math.floor(this.random(min, max + 1));
    },

    randomChoice(array) {
      return array[this.randomInt(0, array.length - 1)];
    },

    randomWeighted(weights) {
      const total = weights.reduce((sum, w) => sum + w.weight, 0);
      let rand = this.random(0, total);
      for (const item of weights) {
        rand -= item.weight;
        if (rand <= 0) return item.value;
      }
      return weights[weights.length - 1].value;
    },

    distance(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    },

    distanceSquared(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return dx * dx + dy * dy;
    },

    angle(x1, y1, x2, y2) {
      return Math.atan2(y2 - y1, x2 - x1);
    },

    degreesToRadians(deg) {
      return deg * Math.PI / 180;
    },

    radiansToDegrees(rad) {
      return rad * 180 / Math.PI;
    },

    normalizeAngle(angle) {
      while (angle < -Math.PI) angle += 2 * Math.PI;
      while (angle > Math.PI) angle -= 2 * Math.PI;
      return angle;
    },

    approach(current, target, step) {
      if (current < target) return Math.min(current + step, target);
      if (current > target) return Math.max(current - step, target);
      return current;
    },

    wrap(value, min, max) {
      const range = max - min;
      return ((value - min) % range + range) % range + min;
    },

    sign(value) {
      return value > 0 ? 1 : value < 0 ? -1 : 0;
    },

    roundTo(value, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(value * factor) / factor;
    },

    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    easeOutElastic(t) {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    easeOutBounce(t) {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  },

  vector: {
    create(x = 0, y = 0) {
      return { x, y };
    },

    copy(v) {
      return { x: v.x, y: v.y };
    },

    set(v, x, y) {
      v.x = x;
      v.y = y;
      return v;
    },

    add(v, x, y) {
      if (typeof x === 'object') {
        v.x += x.x;
        v.y += x.y;
      } else {
        v.x += x;
        v.y += y;
      }
      return v;
    },

    sub(v, x, y) {
      if (typeof x === 'object') {
        v.x -= x.x;
        v.y -= x.y;
      } else {
        v.x -= x;
        v.y -= y;
      }
      return v;
    },

    mul(v, scalar) {
      v.x *= scalar;
      v.y *= scalar;
      return v;
    },

    div(v, scalar) {
      v.x /= scalar;
      v.y /= scalar;
      return v;
    },

    length(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    lengthSquared(v) {
      return v.x * v.x + v.y * v.y;
    },

    normalize(v) {
      const len = this.length(v);
      if (len > 0) {
        v.x /= len;
        v.y /= len;
      }
      return v;
    },

    dot(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    },

    angle(v) {
      return Math.atan2(v.y, v.x);
    },

    fromAngle(angle, length = 1) {
      return { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
    },

    rotate(v, angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = v.x * cos - v.y * sin;
      const y = v.x * sin + v.y * cos;
      v.x = x;
      v.y = y;
      return v;
    },

    lerp(v1, v2, t) {
      v1.x = Utils.math.lerp(v1.x, v2.x, t);
      v1.y = Utils.math.lerp(v1.y, v2.y, t);
      return v1;
    },

    distance(v1, v2) {
      return Utils.math.distance(v1.x, v1.y, v2.x, v2.y);
    },

    clamp(v, min, max) {
      v.x = Utils.math.clamp(v.x, min.x, max.x);
      v.y = Utils.math.clamp(v.y, min.y, max.y);
      return v;
    },

    zero(v) {
      v.x = 0;
      v.y = 0;
      return v;
    },

    equals(v1, v2, epsilon = 0.0001) {
      return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
    },
  },

  color: {
    hexToRgb(hex) {
      const cleanHex = hex.replace('#', '');
      const bigint = parseInt(cleanHex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    },

    rgbToHex(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    hexToRgba(hex, alpha = 1) {
      const rgb = this.hexToRgb(hex);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },

    lerpColor(color1, color2, t) {
      const c1 = this.hexToRgb(color1);
      const c2 = this.hexToRgb(color2);
      const r = Math.round(Utils.math.lerp(c1.r, c2.r, t));
      const g = Math.round(Utils.math.lerp(c1.g, c2.g, t));
      const b = Math.round(Utils.math.lerp(c1.b, c2.b, t));
      return this.rgbToHex(r, g, b);
    },

    lighten(hex, amount) {
      const rgb = this.hexToRgb(hex);
      const factor = 1 + amount;
      return this.rgbToHex(
        Math.min(255, Math.round(rgb.r * factor)),
        Math.min(255, Math.round(rgb.g * factor)),
        Math.min(255, Math.round(rgb.b * factor))
      );
    },

    darken(hex, amount) {
      return this.lighten(hex, -amount);
    },

    withAlpha(hex, alpha) {
      return this.hexToRgba(hex, alpha);
    },

    parse(colorStr) {
      if (colorStr.startsWith('#')) {
        return this.hexToRgb(colorStr);
      }
      if (colorStr.startsWith('rgb')) {
        const match = colorStr.match(/[\d.]+/g);
        if (match) {
          return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]), a: parseFloat(match[3] || 1) };
        }
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    },

    toCss(r, g, b, a = 1) {
      if (a === 1) return `rgb(${r}, ${g}, ${b})`;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    },
  },

  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn(`Storage get failed for key: ${key}`, e);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn(`Storage set failed for key: ${key}`, e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn(`Storage remove failed for key: ${key}`, e);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        console.warn('Storage clear failed', e);
        return false;
      }
    },

    getAll(prefix = '') {
      const result = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(prefix)) {
            result[key] = JSON.parse(localStorage.getItem(key));
          }
        }
      } catch (e) {
        console.warn('Storage getAll failed', e);
      }
      return result;
    },
  },

  time: {
    now() {
      return performance.now();
    },

    formatMs(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    timestamp() {
      return Date.now();
    },

    dateString(date = new Date()) {
      return date.toISOString().split('T')[0];
    },

    timeSince(timestamp) {
      return Date.now() - timestamp;
    },
  },

  dom: {
    $(selector, parent = document) {
      return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
      return Array.from(parent.querySelectorAll(selector));
    },

    create(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') el.className = value;
        else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
        else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
        else if (key === 'dataset') Object.assign(el.dataset, value);
        else el.setAttribute(key, value);
      });
      children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
      });
      return el;
    },

    remove(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    },

    empty(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
    },

    show(el, display = 'flex') {
      el.style.display = display;
    },

    hide(el) {
      el.style.display = 'none';
    },

    toggle(el, force) {
      if (force === undefined) force = el.style.display === 'none';
      el.style.display = force ? 'flex' : 'none';
    },

    addClass(el, ...classes) {
      el.classList.add(...classes);
    },

    removeClass(el, ...classes) {
      el.classList.remove(...classes);
    },

    toggleClass(el, className, force) {
      el.classList.toggle(className, force);
    },

    hasClass(el, className) {
      return el.classList.contains(className);
    },

    on(el, event, handler, options) {
      el.addEventListener(event, handler, options);
      return () => el.removeEventListener(event, handler, options);
    },

    once(el, event, handler, options) {
      const wrapped = e => {
        handler(e);
        el.removeEventListener(event, wrapped, options);
      };
      el.addEventListener(event, wrapped, options);
    },

    delegate(parent, selector, event, handler) {
      return this.on(parent, event, e => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) handler.call(target, e, target);
      });
    },

    setStyle(el, styles) {
      Object.assign(el.style, styles);
    },

    getRect(el) {
      return el.getBoundingClientRect();
    },

    isVisible(el) {
      return el.offsetWidth > 0 && el.offsetHeight > 0;
    },

    focus(el) {
      el.focus({ preventScroll: true });
    },

    blur() {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    },
  },

  audio: {
    context: null,
    gainNode: null,
    sfxGainNode: null,
    musicGainNode: null,
    buffers: new Map(),
    playingMusic: null,

    init() {
      if (this.context) return;
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.sfxGainNode = this.context.createGain();
        this.musicGainNode = this.context.createGain();
        this.sfxGainNode.connect(this.gainNode);
        this.musicGainNode.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
      } catch (e) {
        console.warn('Audio context init failed', e);
      }
    },

    async loadBuffer(url, key) {
      if (!this.context) this.init();
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await this.context.decodeAudioData(arrayBuffer);
        this.buffers.set(key, buffer);
        return buffer;
      } catch (e) {
        console.warn(`Failed to load audio: ${url}`, e);
        return null;
      }
    },

    playSfx(key, options = {}) {
      if (!this.context || !CONSTANTS.AUDIO.ENABLED || !CONSTANTS.AUDIO.SFX_VOLUME) return;
      const buffer = this.buffers.get(key);
      if (!buffer) return;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      const gain = this.context.createGain();
      gain.gain.value = (options.volume ?? 1) * CONSTANTS.AUDIO.SFX_VOLUME * CONSTANTS.AUDIO.MASTER_VOLUME;
      if (options.pitch) source.playbackRate.value = options.pitch;
      source.connect(gain);
      gain.connect(this.sfxGainNode);
      source.start(0);
      if (options.onEnd) source.onended = options.onEnd;
      return source;
    },

    async playMusic(key, options = {}) {
      if (!this.context || !CONSTANTS.AUDIO.ENABLED || !CONSTANTS.AUDIO.MUSIC_VOLUME) return;
      if (this.playingMusic) this.stopMusic();
      const buffer = this.buffers.get(key);
      if (!buffer) return;
      this.playingMusic = this.context.createBufferSource();
      this.playingMusic.buffer = buffer;
      this.playingMusic.loop = options.loop !== false;
      const gain = this.context.createGain();
      gain.gain.value = (options.volume ?? 1) * CONSTANTS.AUDIO.MUSIC_VOLUME * CONSTANTS.AUDIO.MASTER_VOLUME;
      this.playingMusic.connect(gain);
      gain.connect(this.musicGainNode);
      this.playingMusic.start(0);
      if (options.onEnd) this.playingMusic.onended = options.onEnd;
    },

    stopMusic(fadeTime = 0) {
      if (!this.playingMusic) return;
      if (fadeTime > 0 && this.context) {
        const gain = this.playingMusic.gainNode || this.musicGainNode;
        const startGain = gain.gain.value;
        const startTime = this.context.currentTime;
        const animate = () => {
          const elapsed = this.context.currentTime - startTime;
          const progress = Math.min(elapsed / (fadeTime / 1000), 1);
          gain.gain.value = startGain * (1 - progress);
          if (progress < 1) requestAnimationFrame(animate);
          else this.playingMusic.stop();
        };
        requestAnimationFrame(animate);
      } else {
        this.playingMusic.stop();
      }
      this.playingMusic = null;
    },

    setMasterVolume(volume) {
      if (this.gainNode) this.gainNode.gain.value = Utils.math.clamp(volume, 0, 1);
    },

    setSfxVolume(volume) {
      if (this.sfxGainNode) this.sfxGainNode.gain.value = Utils.math.clamp(volume, 0, 1);
    },

    setMusicVolume(volume) {
      if (this.musicGainNode) this.musicGainNode.gain.value = Utils.math.clamp(volume, 0, 1);
    },

    resume() {
      if (this.context && this.context.state === 'suspended') this.context.resume();
    },
  },

  device: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    isAndroid() {
      return /Android/i.test(navigator.userAgent);
    },

    hasTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    hasHaptics() {
      return 'vibrate' in navigator;
    },

    vibrate(pattern) {
      if (this.hasHaptics()) navigator.vibrate(pattern);
    },

    getPixelRatio() {
      return window.devicePixelRatio || 1;
    },

    getScreenSize() {
      return { width: window.innerWidth, height: window.innerHeight };
    },

    isLandscape() {
      return window.innerWidth > window.innerHeight;
    },

    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    prefersHighContrast() {
      return window.matchMedia('(prefers-contrast: high)').matches;
    },

    supportsWebGL2() {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    },

    supportsOffscreenCanvas() {
      return typeof OffscreenCanvas !== 'undefined';
    },
  },

  debug: {
    enabled: false,
    logs: [],
    maxLogs: 100,

    log(...args) {
      if (!this.enabled) return;
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      const entry = { time: Utils.time.now(), msg };
      this.logs.push(entry);
      if (this.logs.length > this.maxLogs) this.logs.shift();
      console.log(`[DEBUG] ${msg}`);
    },

    warn(...args) {
      if (!this.enabled) return;
      console.warn('[DEBUG]', ...args);
    },

    error(...args) {
      console.error('[DEBUG]', ...args);
    },

    assert(condition, msg) {
      if (!condition) {
        this.error('Assertion failed:', msg);
        throw new Error(msg);
      }
    },

    time(label) {
      if (!this.enabled) return;
      console.time(label);
    },

    timeEnd(label) {
      if (!this.enabled) return;
      console.timeEnd(label);
    },

    group(label) {
      if (!this.enabled) return;
      console.group(label);
    },

    groupEnd() {
      if (!this.enabled) return;
      console.groupEnd();
    },

    table(data) {
      if (!this.enabled) return;
      console.table(data);
    },

    drawRect(ctx, x, y, w, h, color = '#ff0000', lineWidth = 2) {
      if (!this.enabled) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    },

    drawCircle(ctx, x, y, r, color = '#ff0000', fill = false) {
      if (!this.enabled) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    },

    drawVector(ctx, x, y, v, scale = 1, color = '#00ff00') {
      if (!this.enabled) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + v.x * scale, y + v.y * scale);
      ctx.stroke();
      ctx.restore();
    },

    drawText(ctx, text, x, y, color = '#ffffff', font = '12px monospace') {
      if (!this.enabled) return;
      ctx.save();
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    },
  },

  random: {
    seed: Date.now(),

    setSeed(seed) {
      this.seed = seed;
    },

    next() {
      this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
      return this.seed / 4294967296;
    },

    nextInt(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },

    nextFloat(min, max) {
      return this.next() * (max - min) + min;
    },

    nextChoice(array) {
      return array[this.nextInt(0, array.length - 1)];
    },

    shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.nextInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  },

  format: {
    number(num, decimals = 0) {
      if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
      if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
      if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
      return num.toLocaleString();
    },

    compactNumber(num) {
      return this.number(num, 1);
    },

    percent(value, max, decimals = 0) {
      return ((value / max) * 100).toFixed(decimals) + '%';
    },

    score(num) {
      return num.toLocaleString();
    },

    currency(num) {
      return num.toLocaleString() + ' 💰';
    },
  },

  async: {
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    waitFor(condition, timeout = 5000, interval = 50) {
      const start = Utils.time.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          if (condition()) return resolve(true);
          if (Utils.time.now() - start > timeout) return reject(new Error('Timeout'));
          setTimeout(check, interval);
        };
        check();
      });
    },

    retry(fn, retries = 3, delay = 1000) {
      return fn().catch(err => {
        if (retries <= 0) throw err;
        return Utils.async.sleep(delay).then(() => Utils.async.retry(fn, retries - 1, delay * 2));
      });
    },

    debounce(fn, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },

    throttle(fn, limit) {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          fn(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
  },

  pool: {
    create(createFn, resetFn, initialSize = 0) {
      const pool = [];
      const get = () => pool.pop() || createFn();
      const release = obj => {
        if (resetFn) resetFn(obj);
        pool.push(obj);
      };
      for (let i = 0; i < initialSize; i++) pool.push(createFn());
      return { get, release, pool, size: () => pool.length };
    },
  },

  events: {
    createEmitter() {
      const listeners = new Map();
      return {
        on(event, fn) {
          if (!listeners.has(event)) listeners.set(event, []);
          listeners.get(event).push(fn);
          return () => this.off(event, fn);
        },
        off(event, fn) {
          if (!listeners.has(event)) return;
          const arr = listeners.get(event);
          const idx = arr.indexOf(fn);
          if (idx >= 0) arr.splice(idx, 1);
        },
        emit(event, ...args) {
          if (!listeners.has(event)) return;
          listeners.get(event).forEach(fn => fn(...args));
        },
        once(event, fn) {
          const wrapper = (...args) => {
            fn(...args);
            this.off(event, wrapper);
          };
          this.on(event, wrapper);
        },
        clear(event) {
          if (event) listeners.delete(event);
          else listeners.clear();
        },
      };
    },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}