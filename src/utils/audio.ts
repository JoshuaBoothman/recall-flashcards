// src/utils/audio.ts
let audioCtx: AudioContext | null = null;

export const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Unlock for iOS Safari
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// A pleasant, success "Ding" sound
export const playDing = () => {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
};

// A gentle, error "Buzz" sound (low double-buzz)
export const playBuzz = () => {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);

  // Double pulse volume envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);

  // Lowpass filter to make it gentle, not harsh
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
};
