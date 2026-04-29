'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { colors, fonts, styles } from '../styles';

const LANE_NAMES = {
  2: ['top', 'bottom'],
  3: ['top', 'middle', 'bottom'],
  4: ['top', 'upper middle', 'lower middle', 'bottom'],
};
const BIRD_X = 92;
const BIRD_SIZE = 34;
const WALL_W = 76;
const INITIAL_OBSTACLE_COUNT = 7;
const VISIBLE_TUTORIAL_COUNT = 5;
const SPEED = 128;
const BEAT_SECONDS = 0.3375;
const NOTE_CHANGE_SECONDS = BEAT_SECONDS * 2;
const CUE_START_BEATS_BEFORE_IMPACT = 5;
const CUE_END_BEFORE_IMPACT_SECONDS = 0.3;
const CUE_LEAD_SECONDS = CUE_START_BEATS_BEFORE_IMPACT * BEAT_SECONDS;
const CUE_SECONDS = CUE_LEAD_SECONDS - CUE_END_BEFORE_IMPACT_SECONDS;
const BAR_SECONDS = BEAT_SECONDS * 4;
const OBSTACLE_SPACING_BARS = 3;
const LEVEL_GRID_SIZE = 25;
const DEFAULT_SYNTH = {
  waveform: 'triangle',
  detune: 4,
  harmonic: 0.15,
  brightness: 4600,
  attack: 0.05,
  release: 0.24,
  delay: 0.14,
  vibrato: 0.8,
  volume: 0.26,
};
const CRASH_TONE_SECONDS = 1.1;
const LOW_TIVRA_MA_FREQ = 155.56;
const LEVELS = [
  {
    id: 1,
    title: 'Level 1',
    interval: 'Octave',
    cueType: 'slide',
    ratio: 2,
    description: 'Wide pitch slides.',
  },
  {
    id: 2,
    title: 'Level 2',
    interval: 'Fifth',
    cueType: 'slide',
    ratio: 1.5,
    description: 'Smaller pitch slides.',
  },
  {
    id: 3,
    title: 'Level 3',
    interval: 'Two notes',
    cueType: 'two-note',
    lowFreq: 220,
    highFreq: 440,
    description: 'Compare two Sa notes.',
  },
  {
    id: 4,
    title: 'Level 4',
    interval: 'From Sa',
    cueType: 'anchored-two-note',
    lowFreq: 110,
    baseFreq: 220,
    highFreq: 440,
    description: 'Hear whether Sa moves up or down.',
  },
  {
    id: 5,
    title: 'Level 5',
    interval: 'Sa to Pa',
    cueType: 'anchored-two-note',
    lowFreq: 164.815,
    baseFreq: 220,
    highFreq: 329.63,
    description: 'Hear whether Pa is above or below Sa.',
  },
  {
    id: 6,
    title: 'Level 6',
    interval: 'Sa or Pa',
    cueType: 'anchored-two-note',
    lowFreq: 220,
    baseFreq: 220,
    highFreq: 329.63,
    description: 'Low cue repeats Sa. High cue moves to Pa.',
  },
  {
    id: 7,
    title: 'Level 7',
    interval: 'Three zones',
    cueType: 'sequence',
    zoneCount: 3,
    cueByLane: {
      0: [220, 329.63],
      1: [220, 220],
      2: [220, 164.815],
    },
    description: 'Top, middle, and bottom safe zones.',
  },
  {
    id: 8,
    title: 'Level 8',
    interval: 'Dha or Ga',
    cueType: 'sequence',
    zoneCount: 3,
    cueByLane: {
      0: [220, 277.18],
      1: [220, 220],
      2: [220, 185],
    },
    description: 'Low Dha, repeated Sa, or Ga.',
  },
  {
    id: 9,
    title: 'Level 9',
    interval: 'Ni or Re',
    cueType: 'sequence',
    zoneCount: 3,
    cueByLane: {
      0: [220, 246.94],
      1: [220, 220],
      2: [220, 207.65],
    },
    description: 'Low Ni, repeated Sa, or Re.',
  },
  {
    id: 10,
    title: 'Level 10',
    interval: 'Sa Pa Sa',
    cueType: 'sequence',
    zoneCount: 3,
    cueByLane: {
      0: [220, 440],
      1: [220, 329.63],
      2: [220, 220],
    },
    description: 'Repeated Sa, Pa, or high Sa.',
  },
  {
    id: 11,
    title: 'Level 11',
    interval: 'Sa Ga Pa',
    cueType: 'sequence',
    zoneCount: 3,
    laneLabels: ['Pa', 'Ga', 'Sa'],
    cueByLane: {
      0: [220, 329.63],
      1: [220, 277.18],
      2: [220, 220],
    },
    description: 'Repeated Sa, Ga, or Pa.',
  },
  {
    id: 12,
    title: 'Level 12',
    interval: 'Sa Re Ga',
    cueType: 'sequence',
    zoneCount: 3,
    laneLabels: ['Ga', 'Re', 'Sa'],
    cueByLane: {
      0: [220, 277.18],
      1: [220, 246.94],
      2: [220, 220],
    },
    description: 'Repeated Sa, Re, or Ga.',
  },
  {
    id: 13,
    title: 'Level 13',
    interval: 'Sa Re Ga Pa',
    cueType: 'sequence',
    zoneCount: 4,
    laneLabels: ['Pa', 'Ga', 'Re', 'Sa'],
    cueByLane: {
      0: [220, 329.63],
      1: [220, 277.18],
      2: [220, 246.94],
      3: [220, 220],
    },
    helpText: 'Sa-Sa means bottom. Sa-Re, Sa-Ga, and Sa-Pa move upward through the higher zones.',
    description: 'Four zones from Sa to Pa.',
  },
];

function shuffle(values) {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickSafeLane(history, zoneCount) {
  const recent = history.slice(-3);
  const repeatedTooMuch = recent.length === 3 && recent.every((lane) => lane === recent[0]);
  const options = Array.from({ length: zoneCount }, (_, lane) => lane)
    .filter((lane) => !repeatedTooMuch || lane !== recent[0]);
  return options[Math.floor(Math.random() * options.length)];
}

function makeOpeningSafeLanes(zoneCount) {
  const lanes = shuffle(Array.from({ length: zoneCount }, (_, lane) => lane));

  while (lanes.length < VISIBLE_TUTORIAL_COUNT) {
    lanes.push(pickSafeLane(lanes, zoneCount));
  }

  return lanes;
}

function makeObstacle(id, x, safeLane, hidden = true, impactTime = null) {
  return {
    id,
    x,
    impactTime,
    safeLane,
    hidden,
    cued: false,
    revealed: !hidden,
    resolved: false,
    vanish: false,
  };
}

function getCueStartTime(impactTime) {
  return impactTime - CUE_START_BEATS_BEFORE_IMPACT * BEAT_SECONDS;
}

function scheduleCueFrequency(param, safeLane, level, start, multiplier = 1) {
  const low = level.lowFreq || 220;
  const high = level.highFreq || low * level.ratio;

  if (level.cueType === 'sequence') {
      const switchTime = start + NOTE_CHANGE_SECONDS;
    const sequence = level.cueByLane[safeLane];
    param.setValueAtTime(sequence[0] * multiplier, start);
    param.setValueAtTime(sequence[1] * multiplier, switchTime);
  } else if (level.cueType === 'anchored-two-note') {
      const switchTime = start + NOTE_CHANGE_SECONDS;
    const base = level.baseFreq || low;
    param.setValueAtTime(base * multiplier, start);
    param.setValueAtTime((safeLane === 0 ? high : low) * multiplier, switchTime);
  } else if (level.cueType === 'two-note') {
      const switchTime = start + NOTE_CHANGE_SECONDS;
    param.setValueAtTime((safeLane === 0 ? low : high) * multiplier, start);
    param.setValueAtTime((safeLane === 0 ? high : low) * multiplier, switchTime);
  } else {
    param.setValueAtTime((safeLane === 0 ? low : high) * multiplier, start);
    param.exponentialRampToValueAtTime((safeLane === 0 ? high : low) * multiplier, start + CUE_SECONDS);
  }
}

export default function PitchFlight() {
  const fieldRef = useRef(null);
  const rafRef = useRef(null);
  const crashTimeoutRef = useRef(null);
  const lastFrameRef = useRef(0);
  const nextIdRef = useRef(3);
  const obstaclesRef = useRef([]);
  const laneRef = useRef(1);
  const scoreRef = useRef(0);
  const cueAudioRef = useRef(null);
  const cueNodesRef = useRef([]);
  const drumTimerRef = useRef(null);
  const drumNodesRef = useRef([]);
  const drumStartTimeRef = useRef(0);
  const drumNextBeatTimeRef = useRef(0);
  const drumBeatIndexRef = useRef(0);

  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0]);
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [crashPending, setCrashPending] = useState(false);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [bestByLevel, setBestByLevel] = useState({});
  const synth = DEFAULT_SYNTH;
  const activeLevel = selectedLevel;
  const zoneCount = activeLevel.zoneCount || 2;
  const laneNames = LANE_NAMES[zoneCount];
  const laneLabels = activeLevel.laneLabels || laneNames;
  const best = bestByLevel[activeLevel.id] || 0;

  const getCueAudio = useCallback(() => {
    if (!cueAudioRef.current || cueAudioRef.current.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      cueAudioRef.current = new AudioContextClass();
    }
    if (cueAudioRef.current.state === 'suspended') {
      cueAudioRef.current.resume().catch(() => {});
    }
    return cueAudioRef.current;
  }, []);

  const stopCueNodes = useCallback(() => {
    cueNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (error) {}
    });
    cueNodesRef.current = [];
  }, []);

  const stopDrum = useCallback(() => {
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
  }, []);

  function scheduleNoiseHit(audio, time, duration, filterType, frequency, gainValue) {
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
    gain.gain.linearRampToValueAtTime(gainValue, time + 0.01);
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

  function scheduleKick(audio, time) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(92, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.16);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.26, time + 0.01);
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

  const scheduleDrumBeat = useCallback((audio, time, beatIndex) => {
    scheduleNoiseHit(audio, time, 0.045, 'highpass', 5200, 0.07);

    if (beatIndex % 4 === 0 || beatIndex % 4 === 2) {
      scheduleKick(audio, time);
    }
    if (beatIndex % 4 === 1 || beatIndex % 4 === 3) {
      scheduleNoiseHit(audio, time, 0.12, 'bandpass', 1500, 0.11);
    }
  }, []);

  const startDrum = useCallback((level) => {
    stopDrum();
    if (level.id < 3) return;

    const audio = getCueAudio();
    const start = audio.currentTime + 0.05;
    drumStartTimeRef.current = start;
    drumNextBeatTimeRef.current = start;
    drumBeatIndexRef.current = 0;

    function scheduleAhead() {
      const scheduleUntil = audio.currentTime + 0.35;
      while (drumNextBeatTimeRef.current < scheduleUntil) {
        scheduleDrumBeat(audio, drumNextBeatTimeRef.current, drumBeatIndexRef.current);
        drumNextBeatTimeRef.current += BEAT_SECONDS;
        drumBeatIndexRef.current += 1;
      }
    }

    scheduleAhead();
    drumTimerRef.current = setInterval(scheduleAhead, 80);
  }, [getCueAudio, scheduleDrumBeat, stopDrum]);

  const getNextDrumBeatTime = useCallback((audio) => {
    if (!drumStartTimeRef.current) return audio.currentTime;
    const beatsElapsed = Math.ceil((audio.currentTime - drumStartTimeRef.current + 0.025) / BEAT_SECONDS);
    return drumStartTimeRef.current + Math.max(0, beatsElapsed) * BEAT_SECONDS;
  }, []);

  const playCue = useCallback((safeLane, level, alignToDrum = false, scheduledStart = null) => {
    const audio = getCueAudio();
    const start = scheduledStart !== null
      ? Math.max(scheduledStart, audio.currentTime)
      : alignToDrum && level.id >= 3
        ? getNextDrumBeatTime(audio)
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
    masterGain.gain.linearRampToValueAtTime(synth.volume, start + synth.attack);
    masterGain.gain.setValueAtTime(synth.volume, start + CUE_SECONDS - synth.release);
    masterGain.gain.linearRampToValueAtTime(0, start + CUE_SECONDS);

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
      osc.detune.setValueAtTime(voice.detune, start);
      scheduleCueFrequency(osc.frequency, safeLane, level, start, voice.multiplier);
      vibratoGain.connect(osc.detune);

      voiceGain.gain.setValueAtTime(voice.gain, start);
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start(start);
      osc.stop(start + CUE_SECONDS + 0.04);
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
    vibrato.stop(start + CUE_SECONDS + 0.04);
    cueNodesRef.current.push(vibrato);
  }, [getCueAudio, getNextDrumBeatTime, synth]);

  const playResultTone = useCallback((success) => {
    const audio = getCueAudio();
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
    gain.gain.linearRampToValueAtTime(success ? 0.22 : 0.32, start + 0.015);
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
  }, [getCueAudio]);

  const resetObstacles = useCallback((level = selectedLevel, audioStartTime = null) => {
    const width = fieldRef.current?.clientWidth || 760;
    const currentZoneCount = level.zoneCount || 2;
    const safeLaneHistory = makeOpeningSafeLanes(currentZoneCount);
    const birdRight = BIRD_X + BIRD_SIZE / 2;
    const visibleLeadDistance = Math.max(0, width - WALL_W - birdRight);
    const maxVisibleBars = Math.max(1, Math.floor(visibleLeadDistance / (SPEED * BAR_SECONDS)));
    const firstLeadBars = Math.min(3, maxVisibleBars);
    const firstImpactTime = audioStartTime === null
      ? null
      : audioStartTime + firstLeadBars * BAR_SECONDS;
    let impactTime = firstImpactTime;
    let x = audioStartTime === null
      ? width - WALL_W
      : birdRight + SPEED * (impactTime - audioStartTime);
    const openingObstacles = [];

    for (let i = 0; i < INITIAL_OBSTACLE_COUNT; i += 1) {
      if (i >= safeLaneHistory.length) {
        safeLaneHistory.push(pickSafeLane(safeLaneHistory, currentZoneCount));
      }

      openingObstacles.push(makeObstacle(
        i,
        x,
        safeLaneHistory[i],
        i >= VISIBLE_TUTORIAL_COUNT,
        impactTime,
      ));
      if (impactTime !== null) {
        impactTime += OBSTACLE_SPACING_BARS * BAR_SECONDS;
        x = birdRight + SPEED * (impactTime - audioStartTime);
      } else {
        x += SPEED * BAR_SECONDS * OBSTACLE_SPACING_BARS;
      }
    }

    nextIdRef.current = INITIAL_OBSTACLE_COUNT;
    obstaclesRef.current = openingObstacles;
    setObstacles(obstaclesRef.current);
  }, [selectedLevel]);

  const moveToLane = useCallback((nextLane) => {
    const maxLane = (selectedLevel.zoneCount || 2) - 1;
    const clampedLane = Math.max(0, Math.min(maxLane, nextLane));
    laneRef.current = clampedLane;
    setLane(clampedLane);
  }, [selectedLevel]);

  const moveToTappedLane = useCallback((event) => {
    if (showLevelSelector) return;
    const field = fieldRef.current;
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const tapY = event.clientY - rect.top;
    const tappedLane = Math.floor((tapY / rect.height) * zoneCount);
    moveToLane(tappedLane);
  }, [moveToLane, showLevelSelector, zoneCount]);

  const startRun = useCallback((level = activeLevel) => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    const audio = getCueAudio();
    startDrum(level);
    setSelectedLevel(level);
    const startLane = Math.min(1, (level.zoneCount || 2) - 1);
    laneRef.current = startLane;
    setLane(startLane);
    setCrashed(false);
    setCrashPending(false);
    setScore(0);
    scoreRef.current = 0;
    lastFrameRef.current = 0;
    resetObstacles(level, drumStartTimeRef.current || audio.currentTime);
    setRunning(true);
  }, [activeLevel, getCueAudio, resetObstacles, startDrum, stopCueNodes]);

  const endRun = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    stopDrum();
    setRunning(false);
    setCrashed(true);
    setCrashPending(false);
    setBestByLevel((current) => ({
      ...current,
      [activeLevel.id]: Math.max(current[activeLevel.id] || 0, scoreRef.current),
    }));
  }, [activeLevel.id, stopCueNodes, stopDrum]);

  const openLevelSelector = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    stopDrum();
    setRunning(false);
    setCrashed(false);
    setCrashPending(false);
    setShowLevelSelector(true);
    setScore(0);
    scoreRef.current = 0;
    resetObstacles();
  }, [resetObstacles, stopCueNodes, stopDrum]);

  const updateGame = useCallback((time) => {
    if (!lastFrameRef.current) lastFrameRef.current = time;
    const dt = Math.min(0.032, (time - lastFrameRef.current) / 1000);
    lastFrameRef.current = time;

    const fieldWidth = fieldRef.current?.clientWidth || 760;
    const audio = cueAudioRef.current;
    const audioNow = audio?.currentTime ?? 0;
    const birdLeft = BIRD_X - BIRD_SIZE / 2;
    const birdRight = BIRD_X + BIRD_SIZE / 2;
    let nextScore = scoreRef.current;
    let hit = false;
    let nextObstacles = obstaclesRef.current.map((obstacle) => {
      const nextX = obstacle.impactTime === null
        ? obstacle.x - SPEED * dt
        : birdRight + (obstacle.impactTime - audioNow) * SPEED;
      const timeToCollision = obstacle.impactTime === null
        ? (nextX - birdRight) / SPEED
        : obstacle.impactTime - audioNow;
      const cueStartTime = obstacle.impactTime === null ? null : getCueStartTime(obstacle.impactTime);
      const shouldCue = !obstacle.cued && timeToCollision > 0 && (
        activeLevel.id >= 3 && cueStartTime !== null
          ? audioNow >= cueStartTime - 0.04
          : timeToCollision <= CUE_LEAD_SECONDS
      );
      const touched = !obstacle.resolved && birdRight > nextX && birdLeft < nextX + WALL_W;
      const safeLane = obstacle.safeLane;
      const safeTouch = touched && laneRef.current === safeLane;
      const crashTouch = touched && laneRef.current !== safeLane;

      if (shouldCue) {
        playCue(safeLane, activeLevel, false, activeLevel.id >= 3 ? cueStartTime : null);
      }

      if (safeTouch) {
        nextScore += 1;
        if (obstacle.hidden) {
          playResultTone(true);
        }
      }

      if (crashTouch) {
        hit = true;
      }

      return {
        ...obstacle,
        x: nextX,
        cued: obstacle.cued || shouldCue,
        revealed: obstacle.revealed || touched,
        resolved: obstacle.resolved || touched,
        vanish: obstacle.vanish || safeTouch,
      };
    });

    const lastObstacle = nextObstacles[nextObstacles.length - 1];
    if (lastObstacle && lastObstacle.x < fieldWidth + SPEED * BAR_SECONDS * OBSTACLE_SPACING_BARS) {
      const history = nextObstacles.map((obstacle) => obstacle.safeLane);
      const safeLane = pickSafeLane(history, zoneCount);
      const impactTime = lastObstacle.impactTime === null
        ? null
        : lastObstacle.impactTime + OBSTACLE_SPACING_BARS * BAR_SECONDS;
      nextObstacles.push(makeObstacle(
        nextIdRef.current,
        impactTime === null
          ? lastObstacle.x + SPEED * BAR_SECONDS * OBSTACLE_SPACING_BARS
          : birdRight + (impactTime - audioNow) * SPEED,
        safeLane,
        true,
        impactTime,
      ));
      nextIdRef.current += 1;
    }

    nextObstacles = nextObstacles.filter((obstacle) => obstacle.x > -WALL_W - 20);

    scoreRef.current = nextScore;
    setScore(nextScore);

    obstaclesRef.current = nextObstacles;
    setObstacles(nextObstacles);

    if (hit) {
      cancelAnimationFrame(rafRef.current);
      stopCueNodes();
      stopDrum();
      playResultTone(false);
      setRunning(false);
      setCrashPending(true);
      setBestByLevel((current) => ({
        ...current,
        [activeLevel.id]: Math.max(current[activeLevel.id] || 0, scoreRef.current),
      }));
      crashTimeoutRef.current = setTimeout(() => {
        setCrashPending(false);
        setCrashed(true);
      }, CRASH_TONE_SECONDS * 1000);
      return;
    }

    rafRef.current = requestAnimationFrame(updateGame);
  }, [activeLevel, endRun, playCue, playResultTone, stopCueNodes, stopDrum, zoneCount]);

  useEffect(() => {
    if (!running) return undefined;
    rafRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, updateGame]);

  useEffect(() => {
    resetObstacles();
  }, [resetObstacles]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        moveToLane(laneRef.current - 1);
      }
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
        event.preventDefault();
        moveToLane(laneRef.current + 1);
      }
      if (event.key === ' ' && !running) {
        event.preventDefault();
        if (!showLevelSelector) startRun();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moveToLane, running, showLevelSelector, startRun]);

  useEffect(() => () => {
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    stopDrum();
    cueAudioRef.current?.close().catch(() => {});
  }, [stopCueNodes, stopDrum]);

  const laneLabel = laneNames[lane];

  const S = {
    section: { border: `2px dashed ${colors.black}`, marginBottom: 0 },
    banner: {
      background: colors.bg,
      padding: '14px 20px',
      borderBottom: `2px solid ${colors.black}`,
    },
    bannerText: {
      fontSize: 26,
      fontWeight: 700,
      color: colors.black,
      fontFamily: fonts.display,
      letterSpacing: 2,
      lineHeight: 1,
    },
    bannerSub: {
      fontSize: 14,
      color: '#333',
      lineHeight: 1.45,
      marginTop: 6,
      fontFamily: fonts.mono,
    },
    inner: { padding: '20px 20px 24px', background: colors.yellow },
    gameShell: {
      position: 'relative',
    },
    levelGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: 8,
    },
    levelOverlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 6,
      display: showLevelSelector ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      background: 'rgba(245, 242, 235, 0.86)',
    },
    levelPanel: {
      width: 'min(430px, 100%)',
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `5px 5px 0 ${colors.black}`,
      padding: 14,
    },
    levelPanelTitle: {
      fontFamily: fonts.display,
      fontSize: 28,
      letterSpacing: 2,
      color: colors.black,
      lineHeight: 1,
      marginBottom: 10,
      textAlign: 'center',
    },
    levelTile: (available, active) => ({
      border: `2.5px solid ${colors.black}`,
      background: active ? colors.red : available ? '#fff' : '#EDEAE0',
      color: active ? colors.cream : available ? colors.black : colors.dimText,
      aspectRatio: '1 / 1',
      padding: 0,
      cursor: available ? 'pointer' : 'default',
      textAlign: 'center',
      boxShadow: available ? `3px 3px 0 ${colors.black}` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: available ? 1 : 0.52,
    }),
    levelNumber: {
      fontFamily: fonts.display,
      fontSize: 30,
      letterSpacing: 1,
      lineHeight: 1,
    },
    hud: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    statRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    stat: {
      border: `2px solid ${colors.black}`,
      background: '#fff',
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.black,
      minWidth: 88,
      textAlign: 'center',
    },
    playArea: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 12,
      position: 'relative',
    },
    field: {
      height: 340,
      flex: 1,
      minWidth: 0,
      border: `2.5px solid ${colors.black}`,
      background: colors.bg,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `4px 4px 0 ${colors.black}`,
      touchAction: 'none',
    },
    lane: (laneIdx) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${(laneIdx * 100) / zoneCount}%`,
      height: `${100 / zoneCount}%`,
      borderBottom: laneIdx < zoneCount - 1 ? `2px dashed ${colors.divider}` : 'none',
      background: laneIdx === lane ? 'rgba(245, 200, 66, 0.2)' : 'transparent',
    }),
    bird: {
      position: 'absolute',
      left: BIRD_X - BIRD_SIZE / 2,
      top: `${((lane + 0.5) * 100) / zoneCount}%`,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      transform: 'translateY(-50%)',
      transition: 'top 0.12s ease-out',
      border: `2.5px solid ${colors.black}`,
      background: colors.red,
      borderRadius: '50% 50% 46% 46%',
      zIndex: 3,
      boxShadow: `3px 3px 0 ${colors.black}`,
    },
    wing: {
      position: 'absolute',
      left: 7,
      top: 14,
      width: 17,
      height: 8,
      border: `2px solid ${colors.black}`,
      borderTop: 'none',
      background: colors.cream,
      transform: running ? 'rotate(-14deg)' : 'rotate(8deg)',
      transition: 'transform 0.15s',
    },
    beak: {
      position: 'absolute',
      right: -9,
      top: 11,
      width: 0,
      height: 0,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: `10px solid ${colors.black}`,
    },
    eye: {
      position: 'absolute',
      right: 8,
      top: 8,
      width: 5,
      height: 5,
      background: colors.black,
      borderRadius: '50%',
    },
    cloud: (obstacle) => ({
      position: 'absolute',
      left: obstacle.x,
      top: 0,
      width: WALL_W,
      height: '100%',
      opacity: obstacle.revealed ? (obstacle.vanish ? 0 : 0.18) : 1,
      transform: obstacle.vanish ? 'scale(1.16)' : 'scale(1)',
      transition: 'opacity 0.22s ease-out, transform 0.22s ease-out',
      zIndex: 2,
    }),
    cloudPuff: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: 18,
      bottom: 18,
      border: `2px solid ${colors.black}`,
      background: '#fff',
      boxShadow: `10px 16px 0 #EDEAE0, -7px 54px 0 #fff, 8px 110px 0 #EDEAE0, -5px 178px 0 #fff, 7px 246px 0 #EDEAE0`,
    },
    revealedWall: (obstacle, laneIdx) => ({
      position: 'absolute',
      left: obstacle.x,
      top: `${(laneIdx * 100) / zoneCount}%`,
      width: WALL_W,
      height: `${100 / zoneCount}%`,
      background: colors.black,
      border: `2px solid ${colors.black}`,
      boxSizing: 'border-box',
      zIndex: 1,
    }),
    wallStripe: {
      position: 'absolute',
      inset: 8,
      border: `2px solid ${colors.red}`,
      background: 'repeating-linear-gradient(135deg, #111 0 10px, #222 10px 20px)',
    },
    message: {
      position: 'absolute',
      inset: 0,
      display: running || crashPending ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      background: crashed ? 'rgba(232, 71, 63, 0.78)' : 'rgba(245, 242, 235, 0.82)',
      zIndex: 4,
    },
    messagePanel: {
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `5px 5px 0 ${colors.black}`,
      padding: 16,
      maxWidth: 360,
      textAlign: 'center',
    },
    messageTitle: {
      fontFamily: fonts.display,
      fontSize: 28,
      letterSpacing: 2,
      color: colors.black,
      lineHeight: 1,
      marginBottom: 8,
    },
    messageText: {
      ...styles.bodyText,
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 700,
      margin: '0 0 12px',
      lineHeight: 1.45,
      color: colors.black,
    },
    controls: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      width: 92,
      height: 340,
      flexShrink: 0,
    },
    button: (primary = false) => ({
      ...styles.btn,
      background: primary ? colors.red : '#fff',
      color: primary ? colors.cream : colors.black,
      cursor: 'pointer',
      boxShadow: primary ? `3px 3px 0 ${colors.black}` : 'none',
      borderRadius: 0,
    }),
    laneButton: (active) => ({
      ...styles.btn,
      background: active ? colors.red : '#fff',
      color: active ? colors.cream : colors.black,
      cursor: 'pointer',
      width: '100%',
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 0,
      padding: '8px 6px',
      whiteSpace: 'normal',
    }),
  };

  return (
    <section style={S.section}>
      <div style={S.banner}>
        <div style={S.bannerText}>Pitch Flight</div>
        <div style={S.bannerSub}>
          A pitch recognition game: hear the slide, choose the open lane, keep the run alive.
        </div>
      </div>

      <div style={S.inner}>
        <div style={S.gameShell}>
          <div style={S.levelOverlay}>
            <div style={S.levelPanel}>
              <div style={S.levelPanelTitle}>Choose Level</div>
              <div style={S.levelGrid}>
                {Array.from({ length: LEVEL_GRID_SIZE }, (_, index) => {
                  const levelNumber = index + 1;
                  const level = LEVELS.find((item) => item.id === levelNumber);
                  const available = Boolean(level);
                  const active = selectedLevel?.id === levelNumber;

                  return (
                    <button
                      key={levelNumber}
                      type="button"
                      style={S.levelTile(available, active)}
                      disabled={!available}
                      aria-label={available ? `Choose level ${levelNumber}` : `Level ${levelNumber} unavailable`}
                      onClick={() => {
                        if (!level) return;
                        setSelectedLevel(level);
                        setShowLevelSelector(false);
                        setCrashed(false);
                        setScore(0);
                        scoreRef.current = 0;
                        laneRef.current = Math.min(1, (level.zoneCount || 2) - 1);
                        setLane(laneRef.current);
                        resetObstacles(level);
                      }}
                    >
                      <span style={S.levelNumber}>{levelNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            <div style={S.hud}>
              <div style={S.statRow}>
                <div style={S.stat}>{activeLevel.title}</div>
                <div style={S.stat}>Score {score}</div>
                <div style={S.stat}>Best {best}</div>
              </div>
              <div style={S.statRow}>
                <button type="button" style={S.button(false)} onClick={openLevelSelector}>
                  Levels
                </button>
                <button type="button" style={S.button(true)} onClick={() => startRun()}>
                  {running ? 'Restart' : crashed ? 'Try Again' : 'Start'}
                </button>
              </div>
            </div>

            <div className="pf-play-area" style={S.playArea}>
              <div ref={fieldRef} className="pf-field" style={S.field} onPointerDown={moveToTappedLane}>
                {laneNames.map((name, laneIdx) => (
                  <div key={name} style={S.lane(laneIdx)} />
                ))}

                {obstacles.map((obstacle) => (
                  <div key={obstacle.id}>
                    {obstacle.revealed && laneNames.map((name, laneIdx) => (
                      laneIdx === obstacle.safeLane ? null : (
                        <div key={name} style={S.revealedWall(obstacle, laneIdx)}>
                          <div style={S.wallStripe} />
                        </div>
                      )
                    ))}
                    {obstacle.hidden && (
                      <div style={S.cloud(obstacle)}>
                        <div style={S.cloudPuff} />
                      </div>
                    )}
                  </div>
                ))}

                <div style={S.bird} aria-label={`Bird in ${laneLabel} lane`}>
                  <div style={S.wing} />
                  <div style={S.beak} />
                  <div style={S.eye} />
                </div>

                <div style={S.message}>
                  <div style={S.messagePanel}>
                    <div style={S.messageTitle}>{crashed ? 'Crashed' : activeLevel.title}</div>
                    <p style={S.messageText}>
                      {crashed
                        ? `Run ended at ${score}.`
                        : activeLevel.helpText
                          ? activeLevel.helpText
                        : activeLevel.cueType === 'sequence'
                          ? 'Sa-Pa means top. Sa-Sa means middle. Sa-low Pa means bottom.'
                        : activeLevel.cueType === 'two-note'
                          ? 'High Sa then Sa means bottom. Sa then high Sa means top.'
                          : activeLevel.cueType === 'anchored-two-note'
                            ? 'Sa then low Sa means bottom. Sa then high Sa means top.'
                          : `The ${activeLevel.interval.toLowerCase()} slide is your decision window: rising means top, falling means bottom.`}
                    </p>
                    <button type="button" style={S.button(true)} onClick={() => startRun()}>
                      {crashed ? 'Try Again' : 'Start Run'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pf-controls" style={S.controls}>
                {laneNames.map((name, laneIdx) => (
                  <button
                    key={name}
                    type="button"
                    style={S.laneButton(lane === laneIdx)}
                    onClick={() => moveToLane(laneIdx)}
                  >
                    {laneLabels[laneIdx]}
                  </button>
                ))}
              </div>
            </div>
        </div>

      </div>
      <style>{`
        @media (max-width: 620px) {
          .pf-play-area {
            display: block !important;
          }

          .pf-field {
            width: 100% !important;
            height: min(64vh, 520px) !important;
            min-height: 390px !important;
          }

          .pf-controls {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            width: 58px !important;
            height: auto !important;
            z-index: 5 !important;
            gap: 6px !important;
          }

          .pf-controls button {
            padding: 6px 4px !important;
            font-size: 10px !important;
            background: rgba(255, 255, 255, 0.9) !important;
          }
        }
      `}</style>
    </section>
  );
}
