import {
  BEAT_SECONDS,
  CUE_SECONDS,
  NOTE_CHANGE_SECONDS,
  DRONE_DRY_GAIN,
  DRONE_WET_GAIN,
  CRASH_TONE_SECONDS,
} from './constants';
import { LOW_TIVRA_MA_FREQ, LOW_SA_FREQ, LOW_PA_FREQ, SA_FREQ } from './notes';

export function getCueStartTime(impactTime, cueStartBeats) {
  return impactTime - cueStartBeats * BEAT_SECONDS;
}

function unlockIOSAudio(audioCtx) {
  try {
    const dest = audioCtx.createMediaStreamDestination();
    const src = audioCtx.createBufferSource();
    src.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    src.connect(dest);
    const el = document.createElement('audio');
    el.srcObject = dest.stream;
    el.play().then(() => src.start()).catch(() => {});
  } catch (e) {}
}

export function getCueAudio(cueAudioRef) {
  if (!cueAudioRef.current || cueAudioRef.current.state === 'closed') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    cueAudioRef.current = new AudioContextClass();
    unlockIOSAudio(cueAudioRef.current);
  }
  if (cueAudioRef.current.state === 'suspended') {
    cueAudioRef.current.resume().catch(() => {});
  }
  return cueAudioRef.current;
}

export function stopCueNodes(cueNodesRef) {
  cueNodesRef.current.forEach((node) => {
    try {
      node.stop();
    } catch (error) {}
  });
  cueNodesRef.current = [];
}

export function stopDrone({ droneNodesRef, droneDryGainRef, droneWetGainRef }) {
  droneNodesRef.current.forEach((node) => {
    try {
      node.stop();
    } catch (error) {}
    try {
      node.disconnect();
    } catch (error) {}
  });
  droneNodesRef.current = [];
  droneDryGainRef.current = null;
  droneWetGainRef.current = null;
}

export function stopDrum({
  drumTimerRef,
  drumNodesRef,
  drumStartTimeRef,
  drumNextBeatTimeRef,
  drumBeatIndexRef,
}) {
  if (drumTimerRef.current) {
    clearInterval(drumTimerRef.current);
    drumTimerRef.current = null;
  }
  drumNodesRef.current.forEach((node) => {
    try {
      node.stop();
    } catch (error) {}
  });
  drumNodesRef.current = [];
  drumStartTimeRef.current = 0;
  drumNextBeatTimeRef.current = 0;
  drumBeatIndexRef.current = 0;
}

function scheduleCueFrequency(param, safeLane, level, start, multiplier = 1, cueSeconds = CUE_SECONDS, noteChangeSeconds = NOTE_CHANGE_SECONDS) {
  const low = level.lowFreq || SA_FREQ;
  const high = level.highFreq || low * level.ratio;

  if (level.cueType === 'single-note') {
    param.setValueAtTime(level.cueByLane[safeLane] * multiplier, start);
  } else if (level.cueType === 'sequence') {
    const switchTime = start + noteChangeSeconds;
    const sequence = level.cueByLane[safeLane];
    param.setValueAtTime(sequence[0] * multiplier, start);
    param.setValueAtTime(sequence[1] * multiplier, switchTime);
  } else if (level.cueType === 'anchored-two-note') {
    const switchTime = start + noteChangeSeconds;
    const base = level.baseFreq || low;
    param.setValueAtTime(base * multiplier, start);
    param.setValueAtTime((safeLane === 0 ? high : low) * multiplier, switchTime);
  } else if (level.cueType === 'two-note') {
    const switchTime = start + noteChangeSeconds;
    param.setValueAtTime((safeLane === 0 ? low : high) * multiplier, start);
    param.setValueAtTime((safeLane === 0 ? high : low) * multiplier, switchTime);
  } else {
    param.setValueAtTime((safeLane === 0 ? low : high) * multiplier, start);
    param.exponentialRampToValueAtTime((safeLane === 0 ? high : low) * multiplier, start + cueSeconds);
  }
}

function scheduleNoiseHit(audio, time, duration, filterType, frequency, gainValue, mixerRef, drumNodesRef) {
  const frameCount = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, frameCount, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(gainValue * mixerRef.current.drums, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  source.start(time);
  source.stop(time + duration + 0.02);
  drumNodesRef.current.push(source);
  source.onended = () => {
    drumNodesRef.current = drumNodesRef.current.filter((node) => node !== source);
  };
}

function scheduleKick(audio, time, mixerRef, drumNodesRef) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(92, time);
  osc.frequency.exponentialRampToValueAtTime(44, time + 0.16);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.26 * mixerRef.current.drums, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(time);
  osc.stop(time + 0.22);
  drumNodesRef.current.push(osc);
  osc.onended = () => {
    drumNodesRef.current = drumNodesRef.current.filter((node) => node !== osc);
  };
}

export function scheduleDrumBeat(audio, time, beatIndex, mixerRef, drumNodesRef) {
  scheduleNoiseHit(audio, time, 0.045, 'highpass', 5200, 0.07, mixerRef, drumNodesRef);

  if (beatIndex % 4 === 0 || beatIndex % 4 === 2) {
    scheduleKick(audio, time, mixerRef, drumNodesRef);
  }
  if (beatIndex % 4 === 1 || beatIndex % 4 === 3) {
    scheduleNoiseHit(audio, time, 0.12, 'bandpass', 1500, 0.11, mixerRef, drumNodesRef);
  }
}

export function startDrum(level, refs) {
  const {
    cueAudioRef,
    mixerRef,
    drumTimerRef,
    drumNodesRef,
    drumStartTimeRef,
    drumNextBeatTimeRef,
    drumBeatIndexRef,
  } = refs;

  stopDrum(refs);
  if (level.id < 3) return;

  const audio = getCueAudio(cueAudioRef);
  const start = audio.currentTime + 0.05;
  drumStartTimeRef.current = start;
  drumNextBeatTimeRef.current = start;
  drumBeatIndexRef.current = 0;

  function scheduleAhead() {
    const scheduleUntil = audio.currentTime + 0.35;
    while (drumNextBeatTimeRef.current < scheduleUntil) {
      scheduleDrumBeat(audio, drumNextBeatTimeRef.current, drumBeatIndexRef.current, mixerRef, drumNodesRef);
      drumNextBeatTimeRef.current += BEAT_SECONDS;
      drumBeatIndexRef.current += 1;
    }
  }

  scheduleAhead();
  drumTimerRef.current = setInterval(scheduleAhead, 80);
}

export function getNextDrumBeatTime(audio, drumStartTimeRef) {
  if (!drumStartTimeRef.current) return audio.currentTime;
  const beatsElapsed = Math.ceil((audio.currentTime - drumStartTimeRef.current + 0.025) / BEAT_SECONDS);
  return drumStartTimeRef.current + Math.max(0, beatsElapsed) * BEAT_SECONDS;
}

export function startDrone(level, refs) {
  const {
    cueAudioRef,
    mixerRef,
    droneNodesRef,
    droneDryGainRef,
    droneWetGainRef,
  } = refs;

  stopDrone(refs);
  if (level.id < 21) return;

  const audio = getCueAudio(cueAudioRef);
  const start = audio.currentTime + 0.03;
  const dryGain = audio.createGain();
  const delay = audio.createDelay();
  const feedback = audio.createGain();
  const wetGain = audio.createGain();
  const filter = audio.createBiquadFilter();
  const voices = [
    { frequency: SA_FREQ, gain: 0.16 },
    { frequency: LOW_PA_FREQ, gain: 0.1 },
    { frequency: LOW_SA_FREQ, gain: 0.13 },
  ];

  dryGain.gain.setValueAtTime(0, start);
  dryGain.gain.linearRampToValueAtTime(DRONE_DRY_GAIN * mixerRef.current.drone, start + 0.55);
  delay.delayTime.setValueAtTime(0.38, start);
  feedback.gain.setValueAtTime(0.42, start);
  wetGain.gain.setValueAtTime(DRONE_WET_GAIN * mixerRef.current.drone, start);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, start);
  filter.Q.setValueAtTime(0.4, start);

  voices.forEach((voice) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(voice.frequency, start);
    gain.gain.setValueAtTime(voice.gain, start);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(start);
    droneNodesRef.current.push(osc);
  });

  filter.connect(dryGain);
  dryGain.connect(audio.destination);
  dryGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(audio.destination);
  droneDryGainRef.current = dryGain;
  droneWetGainRef.current = wetGain;
  droneNodesRef.current.push(dryGain, delay, feedback, wetGain, filter);
}

export function playCue(safeLane, level, options) {
  const {
    alignToDrum = false,
    scheduledStart = null,
    duration = CUE_SECONDS,
    cueAudioRef,
    cueNodesRef,
    mixerRef,
    drumStartTimeRef,
    synth,
    noteChangeSeconds = NOTE_CHANGE_SECONDS,
  } = options;
  const audio = getCueAudio(cueAudioRef);
  const start = scheduledStart !== null
    ? Math.max(scheduledStart, audio.currentTime)
    : alignToDrum && level.id >= 3
      ? getNextDrumBeatTime(audio, drumStartTimeRef)
      : audio.currentTime;

  const filter = audio.createBiquadFilter();
  const masterGain = audio.createGain();
  const delay = audio.createDelay();
  const feedback = audio.createGain();
  const wetGain = audio.createGain();
  const vibrato = audio.createOscillator();
  const vibratoGain = audio.createGain();
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
  masterGain.gain.linearRampToValueAtTime(synth.volume * mixerRef.current.cue, start + synth.attack);
  masterGain.gain.setValueAtTime(synth.volume * mixerRef.current.cue, start + duration - synth.release);
  masterGain.gain.linearRampToValueAtTime(0, start + duration);

  delay.delayTime.setValueAtTime(0.18, start);
  feedback.gain.setValueAtTime(0.18, start);
  wetGain.gain.setValueAtTime(synth.delay * mixerRef.current.cue, start);

  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5.2, start);
  vibratoGain.gain.setValueAtTime(synth.vibrato, start);
  vibrato.connect(vibratoGain);

  voices.forEach((voice) => {
    const osc = audio.createOscillator();
    const voiceGain = audio.createGain();

    osc.type = synth.waveform;
    osc.detune.setValueAtTime(voice.detune, start);
    scheduleCueFrequency(osc.frequency, safeLane, level, start, voice.multiplier, duration, noteChangeSeconds);
    vibratoGain.connect(osc.detune);

    voiceGain.gain.setValueAtTime(voice.gain, start);
    osc.connect(voiceGain);
    voiceGain.connect(filter);
    osc.start(start);
    osc.stop(start + duration + 0.04);
    cueNodesRef.current.push(osc);
    osc.onended = () => {
      cueNodesRef.current = cueNodesRef.current.filter((node) => node !== osc);
    };
  });

  filter.connect(masterGain);
  masterGain.connect(audio.destination);
  masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(audio.destination);
  vibrato.start(start);
  vibrato.stop(start + duration + 0.04);
  cueNodesRef.current.push(vibrato);
}

export function playResultTone(success, { cueAudioRef, cueNodesRef, mixerRef }) {
  const audio = getCueAudio(cueAudioRef);
  const start = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  const duration = success ? 0.18 : CRASH_TONE_SECONDS;

  osc.type = success ? 'triangle' : 'sawtooth';
  osc.frequency.setValueAtTime(success ? 880 : LOW_TIVRA_MA_FREQ, start);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(success ? 4200 : 900, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime((success ? 0.22 : 0.32) * mixerRef.current.result, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
  cueNodesRef.current.push(osc);
  osc.onended = () => {
    cueNodesRef.current = cueNodesRef.current.filter((node) => node !== osc);
  };
}
