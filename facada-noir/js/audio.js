const AudioManager = (function() {
  let context = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let musicSource = null;
  let musicBuffer = null;
  let sfxBuffers = new Map();
  let enabled = false;
  let initialized = false;

  const SAMPLE_RATE = 44100;

  function init() {
    if (initialized) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
        masterGain = context.createGain();
        sfxGain = context.createGain();
        musicGain = context.createGain();

        sfxGain.connect(masterGain);
        musicGain.connect(masterGain);
        masterGain.connect(context.destination);

        masterGain.gain.value = CONSTANTS.AUDIO.MASTER_VOLUME;
        sfxGain.gain.value = CONSTANTS.AUDIO.SFX_VOLUME;
        musicGain.gain.value = CONSTANTS.AUDIO.MUSIC_VOLUME;

        enabled = CONSTANTS.AUDIO.ENABLED;
        initialized = true;

        generateSfxBuffers();
        generateMusicBuffer().then(resolve);
      } catch (e) {
        console.warn('Audio init failed:', e);
        enabled = false;
        resolve();
      }
    });
  }

  function resume() {
    if (context && context.state === 'suspended') {
      context.resume();
    }
  }

  function generateSfxBuffers() {
    const sfxDefs = {
      'knife_throw': { type: 'noise', duration: 0.15, freq: 800, decay: 0.3 },
      'knife_hit_wood': { type: 'impact', duration: 0.3, freq: 200, harmonics: 4 },
      'knife_hit_metal': { type: 'impact', duration: 0.4, freq: 400, harmonics: 8, metallic: true },
      'knife_hit_target': { type: 'impact', duration: 0.25, freq: 300, harmonics: 3 },
      'perfect_hit': { type: 'chime', duration: 0.5, freq: 660, harmonics: [1, 1.25, 1.5, 2] },
      'combo_hit': { type: 'chime', duration: 0.4, freq: 523, harmonics: [1, 1.33, 1.66, 2] },
      'miss': { type: 'fail', duration: 0.4, freq: 150, slide: true },
      'level_up': { type: 'fanfare', duration: 1.0, notes: [523, 659, 784, 1047] },
      'unlock': { type: 'sparkle', duration: 0.6, freq: 880 },
      'button_click': { type: 'click', duration: 0.08, freq: 1000 },
      'button_hover': { type: 'click', duration: 0.04, freq: 1500, volume: 0.3 },
      'menu_open': { type: 'whoosh', duration: 0.3, freq: 200 },
      'menu_close': { type: 'whoosh', duration: 0.2, freq: 300, reverse: true },
      'knife_spin': { type: 'spin', duration: 0.8, freq: 100, loops: 2 },
      'boss_hit': { type: 'impact', duration: 0.5, freq: 120, harmonics: 6, metallic: true },
      'boss_defeat': { type: 'fanfare', duration: 2.0, notes: [392, 523, 659, 784, 1047, 1319] },
      'game_over': { type: 'sad', duration: 1.5, notes: [440, 392, 349, 330] },
      'collect_coin': { type: 'coin', duration: 0.15, freq: 1200 },
      'purchase': { type: 'cash', duration: 0.3, freq: 600 },
      'error': { type: 'buzz', duration: 0.2, freq: 200 },
    };

    Object.entries(sfxDefs).forEach(([key, def]) => {
      sfxBuffers.set(key, generateSfxBuffer(def));
    });
  }

  function generateSfxBuffer(def) {
    const duration = def.duration;
    const length = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    switch (def.type) {
      case 'noise':
        generateNoise(data, def);
        break;
      case 'impact':
        generateImpact(data, def);
        break;
      case 'chime':
        generateChime(data, def);
        break;
      case 'fail':
        generateFail(data, def);
        break;
      case 'fanfare':
        generateFanfare(data, def);
        break;
      case 'sparkle':
        generateSparkle(data, def);
        break;
      case 'click':
        generateClick(data, def);
        break;
      case 'whoosh':
        generateWhoosh(data, def);
        break;
      case 'spin':
        generateSpin(data, def);
        break;
      case 'coin':
        generateCoin(data, def);
        break;
      case 'cash':
        generateCash(data, def);
        break;
      case 'buzz':
        generateBuzz(data, def);
        break;
      case 'sad':
        generateSad(data, def);
        break;
    }

    applyEnvelope(data, def);
    return buffer;
  }

  function generateNoise(data, def) {
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const freq = def.freq || 800;
    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      data[i] += Math.sin(t * freq * 2 * Math.PI) * 0.2 * Math.exp(-t * (def.decay || 10));
    }
  }

  function generateImpact(data, def) {
    const freq = def.freq || 200;
    const harmonics = def.harmonics || 3;
    const metallic = def.metallic || false;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      let sample = 0;
      const decay = Math.exp(-t * 15);

      for (let h = 1; h <= harmonics; h++) {
        const harmonicFreq = freq * h * (metallic ? (1 + h * 0.1) : 1);
        sample += Math.sin(t * harmonicFreq * 2 * Math.PI) / h;
      }

      const noise = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 30);
      data[i] = (sample + noise) * decay * 0.3;
    }
  }

  function generateChime(data, def) {
    const baseFreq = def.freq || 660;
    const harmonics = def.harmonics || [1, 1.25, 1.5, 2];

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      let sample = 0;
      const decay = Math.exp(-t * 3);

      harmonics.forEach((h, idx) => {
        sample += Math.sin(t * baseFreq * h * 2 * Math.PI) * (1 / (idx + 1)) * 0.2;
      });

      data[i] = sample * decay;
    }
  }

  function generateFail(data, def) {
    const freq = def.freq || 150;
    const slide = def.slide || false;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const currentFreq = slide ? freq * (1 - t * 2) : freq;
      const decay = Math.exp(-t * 4);
      data[i] = Math.sin(t * currentFreq * 2 * Math.PI) * decay * 0.3;
    }
  }

  function generateFanfare(data, def) {
    const notes = def.notes || [523, 659, 784, 1047];
    const noteDuration = def.duration / notes.length;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), notes.length - 1);
      const noteFreq = notes[noteIndex];
      const noteT = t - noteIndex * noteDuration;
      const decay = Math.exp(-noteT * 4);
      data[i] = Math.sin(noteT * noteFreq * 2 * Math.PI) * decay * 0.2;
    }
  }

  function generateSparkle(data, def) {
    const freq = def.freq || 880;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const decay = Math.exp(-t * 5);
      const vibrato = Math.sin(t * 20 * 2 * Math.PI) * 50;
      data[i] = Math.sin(t * (freq + vibrato) * 2 * Math.PI) * decay * 0.25;
    }
  }

  function generateClick(data, def) {
    const freq = def.freq || 1000;
    const volume = def.volume || 1;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const decay = Math.exp(-t * 50);
      data[i] = Math.sin(t * freq * 2 * Math.PI) * decay * 0.1 * volume;
    }
  }

  function generateWhoosh(data, def) {
    const freq = def.freq || 200;
    const reverse = def.reverse || false;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const progress = reverse ? 1 - t / def.duration : t / def.duration;
      const currentFreq = freq * (1 + progress * 5);
      const amplitude = Math.sin(progress * Math.PI) * 0.1;
      data[i] = (Math.random() * 2 - 1) * amplitude * Math.exp(-t * 3);
    }
  }

  function generateSpin(data, def) {
    const freq = def.freq || 100;
    const loops = def.loops || 1;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const progress = t / def.duration;
      const currentFreq = freq * (1 + progress * loops * 4);
      const decay = Math.exp(-t * 1.5);
      data[i] = Math.sin(t * currentFreq * 2 * Math.PI) * decay * 0.15;
    }
  }

  function generateCoin(data, def) {
    const freq = def.freq || 1200;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const decay = Math.exp(-t * 20);
      data[i] = Math.sin(t * freq * 2 * Math.PI) * decay * 0.2;
      if (t < 0.01) data[i] += (Math.random() * 2 - 1) * 0.1 * decay;
    }
  }

  function generateCash(data, def) {
    const freq = def.freq || 600;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const decay = Math.exp(-t * 8);
      const note1 = Math.sin(t * freq * 2 * Math.PI);
      const note2 = Math.sin(t * freq * 1.5 * 2 * Math.PI);
      data[i] = (note1 + note2 * 0.5) * decay * 0.15;
    }
  }

  function generateBuzz(data, def) {
    const freq = def.freq || 200;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const decay = Math.exp(-t * 10);
      data[i] = Math.sin(t * freq * 2 * Math.PI) * decay * 0.2;
      data[i] += Math.sin(t * freq * 2 * 2 * Math.PI) * decay * 0.1;
    }
  }

  function generateSad(data, def) {
    const notes = def.notes || [440, 392, 349, 330];
    const noteDuration = def.duration / notes.length;

    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const noteIndex = Math.min(Math.floor(t / noteDuration), notes.length - 1);
      const noteFreq = notes[noteIndex];
      const noteT = t - noteIndex * noteDuration;
      const decay = Math.exp(-noteT * 2);
      data[i] = Math.sin(noteT * noteFreq * 2 * Math.PI) * decay * 0.15;
    }
  }

  function applyEnvelope(data, def) {
    const attackTime = 0.005;
    const attackSamples = Math.ceil(context.sampleRate * attackTime);

    for (let i = 0; i < Math.min(attackSamples, data.length); i++) {
      data[i] *= i / attackSamples;
    }
  }

  async function generateMusicBuffer() {
    const duration = 30;
    const length = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(2, length, context.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const bpm = 70;
    const beatDuration = 60 / bpm;
    const beatsPerMeasure = 4;
    const measureDuration = beatDuration * beatsPerMeasure;
    const measures = Math.ceil(duration / measureDuration);

    const chords = [
      { root: 130.81, type: 'm7' },   // Cm7
      { root: 174.61, type: '7' },    // F7
      { root: 196.00, type: 'm7' },   // Gm7
      { root: 220.00, type: '7' },    // A7
    ];

    const bassNotes = [130.81, 174.61, 196.00, 220.00];

    for (let m = 0; m < measures; m++) {
      const chord = chords[m % chords.length];
      const bassFreq = bassNotes[m % bassNotes.length];
      const measureStart = m * measureDuration * context.sampleRate;
      const measureEnd = Math.min(measureStart + measureDuration * context.sampleRate, length);

      generateMeasure(left, right, measureStart, measureEnd, context.sampleRate, chord, bassFreq, beatDuration, m);
    }

    musicBuffer = buffer;
  }

  function generateMeasure(left, right, start, end, sampleRate, chord, bassFreq, beatDuration, measureIndex) {
    const chordNotes = getChordNotes(chord.root, chord.type);
    const beatSamples = beatDuration * sampleRate;

    for (let i = start; i < end; i++) {
      const t = (i - start) / sampleRate;
      const measurePos = t;
      const beatPos = measurePos % beatDuration;
      const beatNum = Math.floor(measurePos / beatDuration);

      let sampleL = 0;
      let sampleR = 0;

      if (beatPos < 0.1) {
        const decay = Math.exp(-beatPos * 30);
        sampleL += Math.sin(t * bassFreq * 2 * Math.PI) * decay * 0.15;
        sampleR += Math.sin(t * bassFreq * 2 * Math.PI) * decay * 0.15;

        if (beatNum % 2 === 0) {
          const decay2 = Math.exp(-(beatPos + 0.05) * 30);
          sampleL += Math.sin(t * bassFreq * 2 * 2 * Math.PI) * decay2 * 0.08;
          sampleR += Math.sin(t * bassFreq * 2 * 2 * Math.PI) * decay2 * 0.08;
        }
      }

      const chordVolume = 0.08;
      chordNotes.forEach((note, idx) => {
        const noteFreq = note;
        const pan = (idx - 1) * 0.3;
        const attack = Math.min(beatPos * 20, 1);
        const decay = Math.exp(-beatPos * 2);
        const vibrato = Math.sin(t * 5 * 2 * Math.PI) * 2;
        const wave = Math.sin(t * (noteFreq + vibrato) * 2 * Math.PI) * attack * decay * chordVolume;
        sampleL += wave * (1 - pan * 0.5);
        sampleR += wave * (1 + pan * 0.5);
      });

      if (beatNum === 3 && beatPos > beatDuration * 0.7) {
        const fillFreq = 300 + Math.random() * 200;
        const fillDecay = Math.exp(-(beatPos - beatDuration * 0.7) * 20);
        sampleL += Math.sin(t * fillFreq * 2 * Math.PI) * fillDecay * 0.05;
        sampleR += Math.sin(t * fillFreq * 2 * Math.PI) * fillDecay * 0.05;
      }

      const measureDecay = 1 - (m / measures) * 0.1;
      left[i] = sampleL * measureDecay;
      right[i] = sampleR * measureDecay;
    }
  }

  function getChordNotes(root, type) {
    const intervals = {
      'm7': [0, 3, 7, 10],
      '7': [0, 4, 7, 10],
      'maj7': [0, 4, 7, 11],
      'm': [0, 3, 7],
    };
    const steps = intervals[type] || intervals['m7'];
    return steps.map(step => root * Math.pow(2, step / 12));
  }

  function playSfx(key, options = {}) {
    if (!enabled || !initialized) return null;
    if (!CONSTANTS.AUDIO.SFX_VOLUME) return null;

    const buffer = sfxBuffers.get(key);
    if (!buffer) {
      console.warn(`SFX not found: ${key}`);
      return null;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    const gain = context.createGain();
    const volume = (options.volume ?? 1) * CONSTANTS.AUDIO.SFX_VOLUME * CONSTANTS.AUDIO.MASTER_VOLUME;
    gain.gain.value = volume;

    if (options.pitch) source.playbackRate.value = options.pitch;
    if (options.rate) source.playbackRate.value = options.rate;

    source.connect(gain);
    gain.connect(sfxGain);
    source.start(0);

    if (options.onEnd) source.onended = options.onEnd;

    return source;
  }

  function playMusic(key, options = {}) {
    if (!enabled || !initialized) return;
    if (!CONSTANTS.AUDIO.MUSIC_VOLUME) return;
    if (musicSource) stopMusic(options.fadeTime || 0);

    if (key === 'noir_theme' && musicBuffer) {
      musicSource = context.createBufferSource();
      musicSource.buffer = musicBuffer;
      musicSource.loop = options.loop !== false;

      musicGain.gain.value = (options.volume ?? 1) * CONSTANTS.AUDIO.MUSIC_VOLUME * CONSTANTS.AUDIO.MASTER_VOLUME;
      musicSource.connect(musicGain);
      musicSource.start(0, options.offset || 0);

      if (options.onEnd) musicSource.onended = options.onEnd;
    }
  }

  function stopMusic(fadeTime = 500) {
    if (!musicSource) return;

    if (fadeTime > 0 && context) {
      const startGain = musicGain.gain.value;
      const startTime = context.currentTime;
      const fadeDuration = fadeTime / 1000;

      const animateFade = () => {
        const elapsed = context.currentTime - startTime;
        const progress = Math.min(elapsed / fadeDuration, 1);
        musicGain.gain.value = startGain * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(animateFade);
        } else {
          musicSource.stop();
          musicSource = null;
          musicGain.gain.value = CONSTANTS.AUDIO.MUSIC_VOLUME * CONSTANTS.AUDIO.MASTER_VOLUME;
        }
      };
      requestAnimationFrame(animateFade);
    } else {
      musicSource.stop();
      musicSource = null;
    }
  }

  function setMasterVolume(volume) {
    if (masterGain) {
      masterGain.gain.value = Utils.math.clamp(volume, 0, 1);
      CONSTANTS.AUDIO.MASTER_VOLUME = masterGain.gain.value;
    }
  }

  function setSfxVolume(volume) {
    if (sfxGain) {
      sfxGain.gain.value = Utils.math.clamp(volume, 0, 1);
      CONSTANTS.AUDIO.SFX_VOLUME = sfxGain.gain.value;
    }
  }

  function setMusicVolume(volume) {
    if (musicGain) {
      musicGain.gain.value = Utils.math.clamp(volume, 0, 1);
      CONSTANTS.AUDIO.MUSIC_VOLUME = musicGain.gain.value;
    }
  }

  function isEnabled() {
    return enabled && initialized;
  }

  function toggleEnabled(state) {
    enabled = state !== undefined ? state : !enabled;
    CONSTANTS.AUDIO.ENABLED = enabled;
    if (!enabled) stopMusic(0);
    return enabled;
  }

  function preloadAll() {
    return Promise.resolve();
  }

  return {
    init,
    resume,
    playSfx,
    playMusic,
    stopMusic,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    isEnabled,
    toggleEnabled,
    preloadAll,
    getContext: () => context,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}