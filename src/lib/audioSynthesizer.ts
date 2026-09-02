/**
 * Procedural Ambient Synthesizer using Web Audio API
 * Generates coffee shop procedural ambiance (warm acoustic resonance, steam hiss, gentle cafe hum)
 * and harmonic feedback chimes for operational triggers.
 */

class ProceduralAmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private steamNode: AudioNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public startAmbiance() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Warm Vinyl / Acoustic Room Tone (Dual Low Sine Oscillators with subtle beating)
    const now = this.ctx.currentTime;
    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc2 = this.ctx.createOscillator();

    this.humOsc1.type = 'sine';
    this.humOsc1.frequency.setValueAtTime(108, now); // 108Hz low warm drone

    this.humOsc2.type = 'triangle';
    this.humOsc2.frequency.setValueAtTime(110.5, now); // Slight binaural beat

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(240, now);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.06, now);

    this.humOsc1.connect(humFilter);
    this.humOsc2.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(this.masterGain);

    this.humOsc1.start();
    this.humOsc2.start();

    // 2. Gentle Espresso Steam / Pink Noise Filter
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(950, now);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    whiteNoise.start();
    this.steamNode = whiteNoise;
  }

  public stopAmbiance() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    try {
      if (this.humOsc1) {
        this.humOsc1.stop();
        this.humOsc1.disconnect();
        this.humOsc1 = null;
      }
      if (this.humOsc2) {
        this.humOsc2.stop();
        this.humOsc2.disconnect();
        this.humOsc2 = null;
      }
      if (this.steamNode) {
        (this.steamNode as AudioBufferSourceNode).stop();
        this.steamNode.disconnect();
        this.steamNode = null;
      }
    } catch {
      // safe cleanup
    }
  }

  public playChime(type: 'success' | 'alert' | 'action' | 'threat_block' = 'success') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'success') {
      // Upward major pentatonic ping (E5 -> B5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'threat_block') {
      // Lower double dissonant tap
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      // Double attention beep (A5)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Subtle click / tap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }
}

export const soundSynth = new ProceduralAmbientSynthesizer();
