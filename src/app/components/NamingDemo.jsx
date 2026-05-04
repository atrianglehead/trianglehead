'use client';

import { useRef, useState } from 'react';
import { unlockAudioSession } from './unlockAudio';

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

function CyclingButton({ labels, frequency }) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const ctxRef = useRef(null);
  const timerRef = useRef(null);

  function tap() {
    unlockAudioSession();
    if (ctxRef.current) { try { ctxRef.current.close(); } catch {} ctxRef.current = null; }
    clearTimeout(timerRef.current);

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    ctxRef.current = ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = frequency;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2;
    const osc2g = ctx.createGain();
    osc2g.gain.value = 0.1;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.75, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.28, now + 0.508);
    env.gain.setValueAtTime(0.28, now + 1.3);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 2);

    const reverb = buildReverb(ctx);
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    dry.gain.value = 0.65;
    wet.gain.value = 0.35;

    osc2.connect(osc2g);
    osc.connect(env);
    osc2g.connect(env);
    env.connect(dry);
    env.connect(reverb);
    reverb.connect(wet);
    dry.connect(ctx.destination);
    wet.connect(ctx.destination);

    osc.start(now); osc2.start(now);
    osc.stop(now + 2.1); osc2.stop(now + 2.1);

    setActive(true);
    setIndex(i => (i + 1) % labels.length);

    timerRef.current = setTimeout(() => {
      ctxRef.current = null;
      setActive(false);
    }, 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
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
        <div style={{ position: 'absolute', top: 5, left: 5, width: 120, height: 120, background: '#111' }} />
        <button
          onClick={tap}
          style={{
            position: 'relative',
            width: 120,
            height: 120,
            background: active ? '#E8473F' : '#F5C842',
            border: '2.5px solid #111',
            transform: active ? 'translate(5px, 5px)' : 'none',
            transition: 'background 0.1s, transform 0.08s',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
            fontSize: 36,
            lineHeight: 1,
            color: active ? '#F5F2EB' : '#111',
            transition: 'color 0.1s',
            pointerEvents: 'none',
          }}>
            {labels[index]}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function NamingDemo({ tFrequency = 220, uFrequency = 275 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '2em 0' }}>
      <CyclingButton labels={['T', 'A3', 'Sa', 'Bird']} frequency={tFrequency} />
      <CyclingButton labels={['U', 'C#4', 'Ga', 'Bunny']} frequency={uFrequency} />
    </div>
  );
}
