/**
 * High-Precision Metronome Engine
 * Uses Web Audio API for < 5ms jitter
 *
 * Based on research: Auditory cueing has privileged access to motor cortex
 * Optimal range: 86-120 BPM for motor learning
 */

export type Subdivision = 'quarter' | 'eighth' | 'sixteenth' | 'triplet';
export type Dynamic = 'loud' | 'normal' | 'soft';

export class Metronome {
  private audioContext: AudioContext | null = null;
  private nextNoteTime: number = 0;
  private currentBeatIndex: number = 0;
  private currentSubdivision: number = 0; // Which click within the beat (0 to clicksPerBeat-1)
  private tempo: number = 60; // BPM
  private isPlaying: boolean = false;
  private schedulerTimer: number | null = null;

  // Pattern to play (4 notes)
  private pattern: number[] = [1, 2, 1, 3]; // Default 1213

  // Subdivision
  private subdivision: Subdivision = 'quarter';

  // Beat dynamics
  private beatDynamics: Dynamic[] = ['loud', 'normal', 'normal', 'normal'];

  // Mute flag for micro-burst rest periods
  private isMuted: boolean = false;

  // Volume control (0.0 to 1.0)
  private volume: number = 0.7;

  // Timing precision
  private readonly scheduleAheadTime: number = 0.1; // seconds
  private readonly lookahead: number = 25.0; // milliseconds

  // Beat tracking
  private beatCallbacks: ((beat: number, noteIndex: number) => void)[] = [];

  // Click tracking (fires on every click, not just beats)
  private clickCallbacks: (() => void)[] = [];

  // Oscillator settings
  private readonly baseFrequency: number = 800; // Hz
  private readonly accentFrequency: number = 1000; // Hz for beat 1
  private readonly noteDuration: number = 0.05; // seconds

  constructor(tempo: number = 60, pattern: number[] = [1, 2, 1, 3]) {
    this.tempo = tempo;
    this.pattern = pattern;
  }

  /**
   * Initialize audio context (must be called on user interaction)
   */
  public async initialize(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Start the metronome
   */
  public async start(): Promise<void> {
    if (this.isPlaying) return;

    await this.initialize();

    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    this.isPlaying = true;
    this.currentBeatIndex = 0;
    this.currentSubdivision = 0;
    this.nextNoteTime = this.audioContext.currentTime;

    this.scheduler();
  }

  /**
   * Stop the metronome
   */
  public stop(): void {
    this.isPlaying = false;

    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  /**
   * Set tempo (BPM)
   */
  public setTempo(bpm: number): void {
    if (bpm < 20 || bpm > 300) {
      throw new Error('Tempo must be between 20 and 300 BPM');
    }
    this.tempo = bpm;
  }

  /**
   * Get current tempo
   */
  public getTempo(): number {
    return this.tempo;
  }

  /**
   * Set pattern
   */
  public setPattern(pattern: number[]): void {
    if (pattern.length !== 4) {
      throw new Error('Pattern must be exactly 4 notes');
    }
    this.pattern = pattern;
  }

  /**
   * Set subdivision
   */
  public setSubdivision(subdivision: Subdivision): void {
    this.subdivision = subdivision;
    // Reset subdivision counter to avoid timing issues when changing mid-playback
    this.currentSubdivision = 0;
  }

  /**
   * Get current subdivision
   */
  public getSubdivision(): Subdivision {
    return this.subdivision;
  }

  /**
   * Set beat dynamics
   */
  public setBeatDynamics(dynamics: Dynamic[]): void {
    if (dynamics.length !== 4) {
      throw new Error('Beat dynamics must be exactly 4 values');
    }
    this.beatDynamics = dynamics;
  }

  /**
   * Set mute state (for micro-burst rest periods)
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Set volume (0.0 to 2.0, where 1.0 is 100%)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, volume);
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Register callback for beat events
   * Used to update UI or track user input timing
   */
  public onBeat(callback: (beat: number, noteIndex: number) => void): void {
    this.beatCallbacks.push(callback);
  }

  /**
   * Clear all beat callbacks
   */
  public clearBeatCallbacks(): void {
    this.beatCallbacks = [];
  }

  /**
   * Register callback for click events (fires on every click)
   * Used for tracking total clicks for rep counting
   */
  public onClick(callback: () => void): void {
    this.clickCallbacks.push(callback);
  }

  /**
   * Clear all click callbacks
   */
  public clearClickCallbacks(): void {
    this.clickCallbacks = [];
  }

  /**
   * Scheduler - checks if notes need to be scheduled
   * Runs every 25ms (lookahead)
   */
  private scheduler(): void {
    if (!this.audioContext) return;

    // Schedule all notes that need to be played before the next scheduler call
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeatIndex, this.nextNoteTime);
      this.nextNote();
    }

    if (this.isPlaying) {
      this.schedulerTimer = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  /**
   * Schedule a single note/beat
   */
  private scheduleNote(beatIndex: number, time: number): void {
    if (!this.audioContext) return;

    // Only play sound if not muted
    if (!this.isMuted) {
      // Create oscillator for click sound
      const osc = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();

      // Get dynamic for this beat
      const dynamic = this.beatDynamics[beatIndex];

      // Set frequency and gain based on dynamic
      let frequency: number;
      let gain: number;

      switch (dynamic) {
        case 'loud':
          frequency = this.accentFrequency; // 1000 Hz
          gain = 1.0;
          break;
        case 'normal':
          frequency = this.baseFrequency; // 800 Hz
          gain = 0.6;
          break;
        case 'soft':
          frequency = this.baseFrequency - 100; // 700 Hz
          gain = 0.3;
          break;
      }

      osc.frequency.value = frequency;
      envelope.gain.setValueAtTime(gain * this.volume, time); // Set gain at note start time
      envelope.gain.exponentialRampToValueAtTime(0.001, time + this.noteDuration);

      osc.connect(envelope);
      envelope.connect(this.audioContext.destination);

      osc.start(time);
      osc.stop(time + this.noteDuration);
    }

    // Only trigger beat callbacks on the first subdivision of each beat
    // This ensures visual indicators update once per beat, not per click
    if (this.currentSubdivision === 0) {
      const noteIndex = this.pattern[beatIndex];
      this.beatCallbacks.forEach(callback => {
        // Schedule callback to fire at the beat time
        const delay = (time - this.audioContext!.currentTime) * 1000;
        setTimeout(() => callback(beatIndex, noteIndex), Math.max(0, delay));
      });
    }

    // Always trigger click callbacks (for rep counting)
    this.clickCallbacks.forEach(callback => {
      const delay = (time - this.audioContext!.currentTime) * 1000;
      setTimeout(() => callback(), Math.max(0, delay));
    });
  }

  /**
   * Advance to next note in pattern
   */
  private nextNote(): void {
    const secondsPerBeat = 60.0 / this.tempo;

    // Get clicks per beat based on subdivision
    let clicksPerBeat = 1;
    switch (this.subdivision) {
      case 'quarter':
        clicksPerBeat = 1;
        break;
      case 'eighth':
        clicksPerBeat = 2;
        break;
      case 'sixteenth':
        clicksPerBeat = 4;
        break;
      case 'triplet':
        clicksPerBeat = 3;
        break;
    }

    // Interval between clicks
    const clickInterval = secondsPerBeat / clicksPerBeat;

    this.nextNoteTime += clickInterval;

    // Advance subdivision counter
    this.currentSubdivision++;

    // If we've completed all subdivisions for this beat, move to next beat
    if (this.currentSubdivision >= clicksPerBeat) {
      this.currentSubdivision = 0;
      this.currentBeatIndex = (this.currentBeatIndex + 1) % 4;
    }
  }

  /**
   * Check if metronome is playing
   */
  public isRunning(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Adaptive Tempo Controller
 * Maintains 70% accuracy by auto-adjusting tempo
 */
export class AdaptiveTempoController {
  private metronome: Metronome;
  private recentAttempts: boolean[] = [];
  private readonly windowSize: number = 20;
  private readonly targetAccuracy = { min: 0.6, optimal: 0.7, max: 0.8 };

  constructor(metronome: Metronome) {
    this.metronome = metronome;
  }

  /**
   * Record an attempt (correct or incorrect)
   */
  public recordAttempt(correct: boolean): void {
    this.recentAttempts.push(correct);

    // Keep only last N attempts
    if (this.recentAttempts.length > this.windowSize) {
      this.recentAttempts.shift();
    }

    // Check if tempo should adjust
    if (this.recentAttempts.length >= this.windowSize) {
      this.checkAndAdjustTempo();
    }
  }

  /**
   * Calculate current success rate
   */
  public getSuccessRate(): number {
    if (this.recentAttempts.length === 0) return 0;

    const successes = this.recentAttempts.filter(x => x).length;
    return successes / this.recentAttempts.length;
  }

  /**
   * Check if tempo adjustment needed and apply
   */
  private checkAndAdjustTempo(): void {
    const rate = this.getSuccessRate();
    const currentTempo = this.metronome.getTempo();

    if (rate > this.targetAccuracy.max) {
      // Too easy - increase tempo by 0.8%
      const newTempo = Math.round(currentTempo * 1.008);
      this.metronome.setTempo(newTempo);
      console.log(`Tempo increased: ${currentTempo} → ${newTempo} BPM (accuracy: ${(rate * 100).toFixed(1)}%)`);

    } else if (rate < this.targetAccuracy.min) {
      // Too hard - decrease tempo by 1.2% (faster descent)
      const newTempo = Math.round(currentTempo * 0.988);
      this.metronome.setTempo(newTempo);
      console.log(`Tempo decreased: ${currentTempo} → ${newTempo} BPM (accuracy: ${(rate * 100).toFixed(1)}%)`);
    }
    // If between 60-80%, maintain tempo (optimal challenge)
  }

  /**
   * Reset attempt history
   */
  public reset(): void {
    this.recentAttempts = [];
  }
}

/**
 * Burst Timer
 * Tracks 7-10 second max speed bursts with rest periods
 */
export class BurstTimer {
  private burstDurationSeconds: number;
  private restDurationSeconds: number;
  private isInBurst: boolean = false;
  private currentBurstStartTime: number = 0;
  private timer: number | null = null;
  private onBurstEndCallback?: () => void;
  private onRestEndCallback?: () => void;

  constructor(burstSeconds: number = 10, restSeconds: number = 20) {
    this.burstDurationSeconds = burstSeconds;
    this.restDurationSeconds = restSeconds;
  }

  /**
   * Start a burst
   */
  public startBurst(): void {
    this.isInBurst = true;
    this.currentBurstStartTime = Date.now();

    // Auto-end after burst duration
    this.timer = window.setTimeout(() => {
      this.endBurst();
    }, this.burstDurationSeconds * 1000);
  }

  /**
   * End current burst and start rest
   */
  public endBurst(): void {
    this.isInBurst = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.onBurstEndCallback) {
      this.onBurstEndCallback();
    }

    // Start rest timer
    this.timer = window.setTimeout(() => {
      if (this.onRestEndCallback) {
        this.onRestEndCallback();
      }
    }, this.restDurationSeconds * 1000);
  }

  /**
   * Get remaining time in current phase
   */
  public getRemainingTime(): number {
    if (this.isInBurst) {
      const elapsed = (Date.now() - this.currentBurstStartTime) / 1000;
      return Math.max(0, this.burstDurationSeconds - elapsed);
    }
    return 0;
  }

  /**
   * Check if currently in burst
   */
  public inBurst(): boolean {
    return this.isInBurst;
  }

  /**
   * Set callbacks
   */
  public onBurstEnd(callback: () => void): void {
    this.onBurstEndCallback = callback;
  }

  public onRestEnd(callback: () => void): void {
    this.onRestEndCallback = callback;
  }

  /**
   * Clean up
   */
  public dispose(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * Dotted Rhythm Generator
 * Implements Cziffra's rhythmic variation method
 */
export class DottedRhythmGenerator {
  private currentVariation: 'even' | 'long-short' | 'short-long' = 'even';

  constructor(_baseTempo: number) {
    // baseTempo reserved for future use
  }

  /**
   * Get duration multipliers for current variation
   * Returns array of 4 multipliers for the 4-note pattern
   */
  public getDurationMultipliers(): [number, number, number, number] {
    switch (this.currentVariation) {
      case 'even':
        return [1, 1, 1, 1]; // Standard even rhythm

      case 'long-short':
        // Dotted rhythm: LONG-short-LONG-short (3:1 ratio)
        return [1.5, 0.5, 1.5, 0.5];

      case 'short-long':
        // Inverse: short-LONG-short-LONG
        return [0.5, 1.5, 0.5, 1.5];
    }
  }

  /**
   * Set variation type
   */
  public setVariation(variation: 'even' | 'long-short' | 'short-long'): void {
    this.currentVariation = variation;
  }

  /**
   * Get current variation
   */
  public getVariation(): 'even' | 'long-short' | 'short-long' {
    return this.currentVariation;
  }

  /**
   * Cycle to next variation
   */
  public nextVariation(): void {
    const variations: Array<'even' | 'long-short' | 'short-long'> = ['even', 'long-short', 'short-long'];
    const currentIndex = variations.indexOf(this.currentVariation);
    const nextIndex = (currentIndex + 1) % variations.length;
    this.currentVariation = variations[nextIndex];
  }
}
