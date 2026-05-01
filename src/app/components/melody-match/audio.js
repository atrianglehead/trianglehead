import { MELODY_MATCH_SYNTH } from './constants';

export function getOrCreateAudio(audioCtxRef) {
  if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtxRef.current;
}

export function stopNodes(nodes) {
  nodes.forEach(n => { try { n.stop(); } catch (e) {} });
  nodes.length = 0;
}

export function scheduleSynthNote(audio, freq, start, duration, nodeStore = null) {
  const synth = MELODY_MATCH_SYNTH;
  const filter = audio.createBiquadFilter();
  const masterGain = audio.createGain();
  const delay = audio.createDelay();
  const feedback = audio.createGain();
  const wetGain = audio.createGain();
  const vibrato = audio.createOscillator();
  const vibratoGain = audio.createGain();
  const stopTime = start + duration + 0.04;
  const sustainUntil = Math.max(start + synth.attack, start + duration - synth.release);
  const voices = [
    { detune: 0, gain: 0.74, multiplier: 1 },
    { detune: synth.detune, gain: 0.44, multiplier: 1 },
    { detune: -synth.detune, gain: 0.34, multiplier: 1 },
    { detune: 0, gain: synth.harmonic, multiplier: 2 },
  ];

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(synth.brightness, start);
  filter.Q.setValueAtTime(0.7, start);

  masterGain.gain.setValueAtTime(0, start);
  masterGain.gain.linearRampToValueAtTime(synth.volume, start + synth.attack);
  masterGain.gain.setValueAtTime(synth.volume, sustainUntil);
  masterGain.gain.linearRampToValueAtTime(0, start + duration);

  delay.delayTime.setValueAtTime(0.18, start);
  feedback.gain.setValueAtTime(0.18, start);
  wetGain.gain.setValueAtTime(synth.delay, start);

  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5.2, start);
  vibratoGain.gain.setValueAtTime(synth.vibrato, start);
  vibrato.connect(vibratoGain);

  voices.forEach((voice) => {
    const osc = audio.createOscillator();
    const voiceGain = audio.createGain();

    osc.type = synth.waveform;
    osc.frequency.setValueAtTime(freq * voice.multiplier, start);
    osc.detune.setValueAtTime(voice.detune, start);
    vibratoGain.connect(osc.detune);

    voiceGain.gain.setValueAtTime(voice.gain, start);
    osc.connect(voiceGain);
    voiceGain.connect(filter);
    osc.start(start);
    osc.stop(stopTime);
    if (nodeStore) {
      nodeStore.push(osc);
      osc.onended = () => {
        const index = nodeStore.indexOf(osc);
        if (index !== -1) nodeStore.splice(index, 1);
      };
    }
  });

  filter.connect(masterGain);
  masterGain.connect(audio.destination);
  masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(audio.destination);

  vibrato.start(start);
  vibrato.stop(stopTime);
  if (nodeStore) {
    nodeStore.push(vibrato);
    vibrato.onended = () => {
      const index = nodeStore.indexOf(vibrato);
      if (index !== -1) nodeStore.splice(index, 1);
    };
  }
}

export function scheduleItems(ctx, items, nodeStore, beatMs) {
  const startTime = ctx.currentTime + 0.05;
  let t = startTime;
  const timeline = [];
  items.forEach(item => {
    const dur = item.beats * (beatMs / 1000);
    timeline.push({ audioTime: t, xPx: item.xPx });
    if (item.freq > 0) {
      scheduleSynthNote(ctx, item.freq, t, dur, nodeStore);
    }
    t += dur;
  });
  return { startTime, timeline, endTime: t };
}

export function playNotePreview(ctx, freq) {
  const t = ctx.currentTime;
  scheduleSynthNote(ctx, freq, t, 0.32);
}

export function playRhythmSwapPreview(ctx, noteFreq, beats, beatMs, nodeStore) {
  const dur = beats * (beatMs / 1000);
  const t = ctx.currentTime;
  scheduleSynthNote(ctx, noteFreq, t, dur, nodeStore);
}
