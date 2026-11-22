const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
const beep = (f, d, t = 'sine', v = 0.1) => {
  const o = AudioCtx.createOscillator(), g = AudioCtx.createGain();
  o.type = t; o.frequency.value = f; g.gain.value = v;
  o.connect(g); g.connect(AudioCtx.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.001, AudioCtx.currentTime + d);
  o.stop(AudioCtx.currentTime + d);
};
window.SFX = {
  shoot: () => beep(800, 0.08, 'square', 0.08),
  hit: () => beep(300, 0.1, 'sawtooth', 0.1),
  kill: () => { beep(600, 0.05); beep(400, 0.1); beep(200, 0.15); },
  power: () => { beep(500, 0.05); beep(700, 0.05); beep(900, 0.05); },
  hurt: () => beep(150, 0.2, 'sawtooth', 0.15)
};
window.resumeAudio = () => { if (AudioCtx.state === 'suspended') AudioCtx.resume(); };