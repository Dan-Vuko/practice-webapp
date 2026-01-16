import type { Instrument } from '../types';

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
      return null;
    }
  }
  return audioContext;
};

export const playNote = (frequency: number, instrument: Instrument, duration: number = 1.2) => {
  const context = getAudioContext();
  if (!context) return;
  
  if (context.state === 'suspended') {
    context.resume();
  }
  
  const now = context.currentTime;
  const gainNode = context.createGain();
  const filterNode = context.createBiquadFilter();
  
  gainNode.connect(context.destination);
  filterNode.connect(gainNode);

  // Pluck-like envelope
  const initialGain = instrument === 'pluck' ? 0.6 : 0.3;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(initialGain, now + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Filter for warmth
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(2000, now);
  filterNode.frequency.exponentialRampToValueAtTime(400, now + duration);

  const oscillator = context.createOscillator();
  oscillator.connect(filterNode);
  
  if (instrument === 'pluck') {
    oscillator.type = 'triangle';
    // Add a quick transient for pluck effect
    const noiseGain = context.createGain();
    const noise = context.createOscillator();
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(frequency * 2, now);
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(filterNode);
    noise.start(now);
    noise.stop(now + 0.05);
  } else {
    oscillator.type = instrument as OscillatorType;
  }
  
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.start(now);
  oscillator.stop(now + duration);
};