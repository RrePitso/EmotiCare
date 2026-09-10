/**
 * Pure Web Audio API Synthesizer for ambient soundscapes & soothing chime bells.
 * Zero external mp3 dependencies; works offline and instantly!
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentMode: 'rain' | 'stream' | 'hearth' | 'bowl' | null = null;
  private nodes: {
    source?: AudioNode;
    filter?: BiquadFilterNode;
    gain?: GainNode;
    timer?: number;
  } = {};
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public playSoundscape(mode: 'rain' | 'stream' | 'hearth' | 'bowl') {
    this.stopSoundscape();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentMode = mode;

    if (mode === 'rain') {
      this.playRain();
    } else if (mode === 'stream') {
      this.playStream();
    } else if (mode === 'hearth') {
      this.playHearth();
    } else if (mode === 'bowl') {
      this.playSingingBowlLoop();
    }
  }

  private playRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Pink noise generation for soft soothing rain
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start();

    this.nodes = { source: whiteNoise, filter: lowpass, gain };
  }

  private playStream() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.nodes = { source, filter: bandpass, gain };
  }

  private playHearth() {
    if (!this.ctx || !this.masterGain) return;
    // Low drone + gentle warm crackles
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start();

    this.nodes = { source: osc, gain: oscGain };
  }

  private playSingingBowlLoop() {
    this.playChime(216);
    const timer = window.setInterval(() => {
      this.playChime(216);
    }, 9000);
    this.nodes.timer = timer;
  }

  public playChime(freq = 432) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Harmonic overtone
    const oscHarmonic = this.ctx.createOscillator();
    const harmonicGain = this.ctx.createGain();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.28, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.8);

    harmonicGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    harmonicGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    oscHarmonic.connect(harmonicGain);
    harmonicGain.connect(this.masterGain);

    osc.start();
    oscHarmonic.start();

    osc.stop(this.ctx.currentTime + 4.0);
    oscHarmonic.stop(this.ctx.currentTime + 4.0);
  }

  public stopSoundscape() {
    if (this.nodes.timer) {
      clearInterval(this.nodes.timer);
    }
    if (this.nodes.source) {
      try {
        (this.nodes.source as AudioScheduledSourceNode).stop();
      } catch {
        // already stopped
      }
    }
    this.nodes = {};
    this.currentMode = null;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(clamped * 0.3, this.ctx.currentTime);
    }
  }

  public getCurrentMode() {
    return this.currentMode;
  }
}

export const audioSynth = new AmbientSoundEngine();
