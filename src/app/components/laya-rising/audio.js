import {
  BEAT_SECONDS,
  CUE_SECONDS,
  CRASH_TONE_SECONDS,
} from './constants';

export function getCueStartTime(impactTime, cueStartBeats) {
  return impactTime - cueStartBeats * BEAT_SECONDS;
}

export function getCueAudio(cueAudioRef) {
  if (!cueAudioRef.current || cueAudioRef.current.state === 'closed') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    cueAudioRef.current = new AudioContextClass();
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
    try {
      node.disconnect();
    } catch (error) {}
  });
  cueNodesRef.current = [];
}

export function stopDrone() {}

export function stopDrum() {}

export function startDrum() {}

export function startDrone() {}

function scheduleTempoClick(audio, time, gainValue, mixerRef, cueNodesRef) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, time);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, time);
  filter.Q.setValueAtTime(7, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(gainValue * mixerRef.current.cue, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(time);
  osc.stop(time + 0.11);
  cueNodesRef.current.push(osc);
  osc.onended = () => {
    cueNodesRef.current = cueNodesRef.current.filter((node) => node !== osc);
  };
}

function scheduleTempoClicks(audio, start, duration, tempoRatio, mixerRef, cueNodesRef) {
  const maxClicks = 64;
  const interval = BEAT_SECONDS / tempoRatio;
  let clickTime = start;
  let clickCount = 0;

  while (clickTime < start + duration && clickCount < maxClicks) {
    scheduleTempoClick(audio, clickTime, clickCount % 2 === 0 ? 0.3 : 0.2, mixerRef, cueNodesRef);
    clickTime += interval;
    clickCount += 1;
  }
}

function playTempoPairCue(safeLane, level, start, options) {
  const {
    duration,
    cueChangeSeconds = duration / 2,
    cueAudioRef,
    cueNodesRef,
    mixerRef,
  } = options;
  const audio = getCueAudio(cueAudioRef);
  const firstDuration = cueChangeSeconds;
  const secondDuration = Math.max(0, duration - firstDuration);
  const tempoRatios = level.cueByLaneTempoRatios?.[safeLane]
    || (safeLane === 0 ? [1, level.ratio || 2] : [level.ratio || 2, 1]);
  const [firstTempoRatio, secondTempoRatio] = tempoRatios;

  scheduleTempoClicks(audio, start, firstDuration, firstTempoRatio, mixerRef, cueNodesRef);
  scheduleTempoClicks(audio, start + firstDuration, secondDuration, secondTempoRatio, mixerRef, cueNodesRef);
}

export function playCue(safeLane, level, options) {
  const {
    scheduledStart = null,
    duration = CUE_SECONDS,
    cueAudioRef,
    cueNodesRef,
    mixerRef,
  } = options;
  const audio = getCueAudio(cueAudioRef);
  const start = scheduledStart !== null
    ? Math.max(scheduledStart, audio.currentTime)
    : audio.currentTime;

  if (level.cueType === 'tempo-pair') {
    playTempoPairCue(safeLane, level, start, { ...options, duration });
    return;
  }

  const baseTempo = level.baseTempo || 96;
  const ratio = level.ratio || 2;
  const fromTempo = safeLane === 0 ? baseTempo : baseTempo * ratio;
  const toTempo = safeLane === 0 ? baseTempo * ratio : baseTempo;
  const maxClicks = 32;
  let clickTime = start;
  let clickCount = 0;

  while (clickTime < start + duration && clickCount < maxClicks) {
    const progress = Math.max(0, Math.min(1, (clickTime - start) / duration));
    const tempo = fromTempo * ((toTempo / fromTempo) ** progress);
    const interval = 60 / tempo;
    scheduleTempoClick(audio, clickTime, clickCount % 2 === 0 ? 0.3 : 0.2, mixerRef, cueNodesRef);
    clickTime += interval;
    clickCount += 1;
  }
}

export function playResultTone(success, { cueAudioRef, cueNodesRef, mixerRef }) {
  const audio = getCueAudio(cueAudioRef);
  const start = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const duration = success ? 0.18 : CRASH_TONE_SECONDS;

  osc.type = success ? 'triangle' : 'sawtooth';
  osc.frequency.setValueAtTime(success ? 880 : 155.56, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime((success ? 0.22 : 0.32) * mixerRef.current.result, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.04);
  cueNodesRef.current.push(osc);
  osc.onended = () => {
    cueNodesRef.current = cueNodesRef.current.filter((node) => node !== osc);
  };
}
