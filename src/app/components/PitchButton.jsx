'use client';

import { useState, useRef } from 'react';

function buildReverb(ctx, duration = 1.5, decay = 2) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buffer;
  return conv;
}

export default function PitchButton({
  frequency = 440,
  duration = 3,
  attack = 0.008,
  decay = 0.5,
  sustain = 0.28,
  release = 0.7,
  reverbMix = 0.35,
  label = null,
}) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
  const envRef = useRef(null);
  const timerRef = useRef(null);

  function start() {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const now = ctx.currentTime;

    // Triangle oscillator — richer than sine, less harsh than sawtooth
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = frequency;

    // Quiet octave-above sine for brightness
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2;
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.1;

    // ADSR envelope
    const env = ctx.createGain();
    const sustainStart = now + attack + decay;
    const releaseStart = now + duration - release;

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.75, now + attack);
    env.gain.exponentialRampToValueAtTime(sustain, sustainStart);
    env.gain.setValueAtTime(sustain, Math.max(sustainStart, releaseStart));
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    envRef.current = env;

    // Reverb wet/dry
    const reverb = buildReverb(ctx);
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    dry.gain.value = 1 - reverbMix;
    wet.gain.value = reverbMix;

    // Signal chain
    osc2.connect(osc2Gain);
    osc.connect(env);
    osc2Gain.connect(env);
    env.connect(dry);
    env.connect(reverb);
    reverb.connect(wet);
    dry.connect(ctx.destination);
    wet.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);

    setPlaying(true);

    timerRef.current = setTimeout(() => {
      ctxRef.current = null;
      envRef.current = null;
      setPlaying(false);
    }, (duration + 0.5) * 1000);
  }

  function stop() {
    clearTimeout(timerRef.current);
    const ctx = ctxRef.current;
    const env = envRef.current;
    if (ctx && env) {
      const now = ctx.currentTime;
      env.gain.cancelScheduledValues(now);
      env.gain.setValueAtTime(env.gain.value, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      setTimeout(() => { ctx.close(); }, 350);
      ctxRef.current = null;
      envRef.current = null;
    }
    setPlaying(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '2em 0' }}>
      <span style={{
        fontFamily: 'var(--font-space-mono), monospace',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: '#777',
      }}>
        Tap to Listen
      </span>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 5, left: 5,
          width: 120, height: 120,
          background: '#111',
        }} />
        <button
          onClick={playing ? stop : start}
          aria-label={playing ? 'Stop' : 'Play'}
          style={{
            position: 'relative',
            width: 120,
            height: 120,
            background: playing ? '#E8473F' : '#F5C842',
            border: '2.5px solid #111',
            transform: playing ? 'translate(5px, 5px)' : 'none',
            transition: 'background 0.1s, transform 0.08s',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label && (
            <span style={{
              fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
              fontSize: 42,
              lineHeight: 1,
              color: playing ? '#F5F2EB' : '#111',
              transition: 'color 0.1s',
              pointerEvents: 'none',
            }}>
              {label}
            </span>
          )}
        </button>
      </div>
    </div>
  );

}
