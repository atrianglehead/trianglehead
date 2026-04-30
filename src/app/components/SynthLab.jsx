'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { colors, fonts, styles } from '../styles';

const NOTES = [
  ['Sa', 220],
  ['re', 233.08],
  ['Re', 246.94],
  ['ga', 261.63],
  ['Ga', 277.18],
  ['ma', 293.66],
  ['Ma', 311.13],
  ['Pa', 329.63],
  ['dha', 349.23],
  ['Dha', 370],
  ['ni', 392],
  ['Ni', 415.3],
  ["Sa'", 440],
];

const DEFAULT_SETTINGS = {
  waveform: 'triangle',
  volume: 0.26,
  attack: 0.05,
  release: 0.24,
  brightness: 4600,
  detune: 4,
  harmonic: 0.15,
  vibrato: 0.8,
  delay: 0.14,
  feedback: 0.18,
  duration: 1.72,
};

const DEFAULT_DRONE = {
  waveform: 'square',
  dry: 0.2,
  wet: 0.22,
  feedback: 0.42,
  brightness: 1400,
};
const DEFAULT_GAME_MIX = {
  cue: 1.2,
  drone: 0.9,
  drums: 0.85,
  result: 1,
};
const KOMAL_NOTES = new Set(['re', 'ga', 'dha', 'ni']);

function renderPitchLabel(label) {
  if (KOMAL_NOTES.has(label)) {
    return (
      <span style={{ textDecorationLine: 'underline', textDecorationThickness: 2, textUnderlineOffset: 3 }}>
        {label}
      </span>
    );
  }

  if (label === 'Ma') {
    return (
      <span style={{ position: 'relative', display: 'inline-block', paddingTop: 4 }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 2,
            height: 5,
            background: 'currentColor',
            transform: 'translateX(-50%)',
          }}
        />
        {label}
      </span>
    );
  }

  return label;
}

function formatValue(value) {
  return Number(value).toFixed(2);
}

export default function SynthLab() {
  const audioRef = useRef(null);
  const activeNodesRef = useRef([]);
  const droneNodesRef = useRef([]);
  const droneGainRefs = useRef({ dry: null, wet: null });

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [drone, setDrone] = useState(DEFAULT_DRONE);
  const [gameMix, setGameMix] = useState(DEFAULT_GAME_MIX);
  const [droneOn, setDroneOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetText = useMemo(() => JSON.stringify({
    synth: settings,
    drone,
    pitchFlightMix: gameMix,
  }, null, 2), [settings, drone, gameMix]);

  function getAudio() {
    if (!audioRef.current || audioRef.current.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioRef.current = new AudioContextClass();
    }
    if (audioRef.current.state === 'suspended') {
      audioRef.current.resume().catch(() => {});
    }
    return audioRef.current;
  }

  function stopActiveNodes() {
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (error) {}
      try {
        node.disconnect();
      } catch (error) {}
    });
    activeNodesRef.current = [];
  }

  function stopDrone() {
    droneNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (error) {}
      try {
        node.disconnect();
      } catch (error) {}
    });
    droneNodesRef.current = [];
    droneGainRefs.current = { dry: null, wet: null };
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateDrone(key, value) {
    setDrone((current) => ({ ...current, [key]: value }));
  }

  function updateGameMix(key, value) {
    setGameMix((current) => ({ ...current, [key]: value }));
  }

  function playNote(frequency) {
    const audio = getAudio();
    const start = audio.currentTime;
    const duration = Math.max(0.2, settings.duration);
    const end = start + duration;
    const releaseStart = Math.max(start + settings.attack, end - settings.release);

    const filter = audio.createBiquadFilter();
    const masterGain = audio.createGain();
    const delay = audio.createDelay();
    const feedback = audio.createGain();
    const wetGain = audio.createGain();
    const vibrato = audio.createOscillator();
    const vibratoGain = audio.createGain();
    const voices = [
      { detune: 0, gain: 0.74, multiplier: 1 },
      { detune: settings.detune, gain: 0.44, multiplier: 1 },
      { detune: -settings.detune, gain: 0.34, multiplier: 1 },
      { detune: 0, gain: settings.harmonic, multiplier: 2 },
    ];

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(settings.brightness, start);
    filter.Q.setValueAtTime(0.7, start);

    masterGain.gain.setValueAtTime(0, start);
    masterGain.gain.linearRampToValueAtTime(settings.volume, start + settings.attack);
    masterGain.gain.setValueAtTime(settings.volume, releaseStart);
    masterGain.gain.linearRampToValueAtTime(0, end);

    delay.delayTime.setValueAtTime(0.18, start);
    feedback.gain.setValueAtTime(settings.feedback, start);
    wetGain.gain.setValueAtTime(settings.delay, start);

    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5.2, start);
    vibratoGain.gain.setValueAtTime(settings.vibrato, start);
    vibrato.connect(vibratoGain);

    voices.forEach((voice) => {
      const osc = audio.createOscillator();
      const voiceGain = audio.createGain();

      osc.type = settings.waveform;
      osc.frequency.setValueAtTime(frequency * voice.multiplier, start);
      osc.detune.setValueAtTime(voice.detune, start);
      vibratoGain.connect(osc.detune);

      voiceGain.gain.setValueAtTime(voice.gain, start);
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start(start);
      osc.stop(end + 0.04);
      activeNodesRef.current.push(osc);
      osc.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((node) => node !== osc);
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
    vibrato.stop(end + 0.04);
    activeNodesRef.current.push(vibrato);
  }

  function startDrone() {
    stopDrone();
    const audio = getAudio();
    const start = audio.currentTime + 0.03;
    const dryGain = audio.createGain();
    const wetGain = audio.createGain();
    const delay = audio.createDelay();
    const feedback = audio.createGain();
    const filter = audio.createBiquadFilter();
    const voices = [
      { frequency: 220, gain: 0.16 },
      { frequency: 164.815, gain: 0.1 },
      { frequency: 110, gain: 0.13 },
    ];

    dryGain.gain.setValueAtTime(0, start);
    dryGain.gain.linearRampToValueAtTime(drone.dry, start + 0.45);
    wetGain.gain.setValueAtTime(drone.wet, start);
    delay.delayTime.setValueAtTime(0.38, start);
    feedback.gain.setValueAtTime(drone.feedback, start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(drone.brightness, start);
    filter.Q.setValueAtTime(0.4, start);

    voices.forEach((voice) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = drone.waveform;
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
    droneGainRefs.current = { dry: dryGain, wet: wetGain };
    droneNodesRef.current.push(dryGain, wetGain, delay, feedback, filter);
  }

  useEffect(() => {
    if (!droneOn) return;
    startDrone();
    // Drone changes intentionally restart the current audition graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drone, droneOn]);

  useEffect(() => () => {
    stopActiveNodes();
    stopDrone();
    audioRef.current?.close().catch(() => {});
  }, []);

  const S = {
    wrap: {
      border: `2px dashed ${colors.black}`,
      background: colors.bg,
      padding: 14,
      marginTop: 16,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 28,
      letterSpacing: 2,
      lineHeight: 1,
      marginBottom: 10,
      color: colors.black,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 10,
    },
    panel: {
      border: `2px solid ${colors.black}`,
      background: '#fff',
      padding: 10,
      minWidth: 0,
    },
    label: {
      ...styles.label,
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 6,
      color: colors.black,
    },
    slider: {
      width: '100%',
      accentColor: colors.red,
    },
    select: {
      ...styles.formInput,
      fontFamily: fonts.mono,
      fontSize: 12,
      padding: '8px 10px',
      borderColor: colors.black,
    },
    noteGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(46px, 1fr))',
      gap: 6,
      marginTop: 8,
    },
    noteButton: {
      ...styles.btn,
      padding: '8px 6px',
      minWidth: 0,
      justifyContent: 'center',
      background: colors.yellow,
      borderRadius: 0,
      cursor: 'pointer',
    },
    actionRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    textarea: {
      ...styles.formInput,
      fontFamily: fonts.mono,
      fontSize: 11,
      minHeight: 190,
      resize: 'vertical',
      borderColor: colors.black,
    },
  };

  const slider = (group, key, label, min, max, step = 0.01) => {
    const value = group === 'synth' ? settings[key] : drone[key];
    const update = group === 'synth' ? updateSetting : updateDrone;

    return (
      <label style={S.panel}>
        <span style={S.label}>
          <span>{label}</span>
          <span>{formatValue(value)}</span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={S.slider}
          onChange={(event) => update(key, Number(event.target.value))}
        />
      </label>
    );
  };

  const mixSlider = (key, label, max = 2) => (
    <label style={S.panel}>
      <span style={S.label}>
        <span>{label}</span>
        <span>{formatValue(gameMix[key])}</span>
      </span>
      <input
        type="range"
        min="0"
        max={max}
        step="0.05"
        value={gameMix[key]}
        style={S.slider}
        onChange={(event) => updateGameMix(key, Number(event.target.value))}
      />
    </label>
  );

  return (
    <section style={S.wrap}>
      <div style={S.title}>Synth Lab</div>
      <div style={S.grid}>
        <div style={S.panel}>
          <label style={S.label} htmlFor="synth-waveform">
            <span>Waveform</span>
          </label>
          <select
            id="synth-waveform"
            value={settings.waveform}
            style={S.select}
            onChange={(event) => updateSetting('waveform', event.target.value)}
          >
            {['sine', 'triangle', 'square', 'sawtooth'].map((waveform) => (
              <option key={waveform} value={waveform}>{waveform}</option>
            ))}
          </select>
        </div>
        {slider('synth', 'volume', 'Volume', 0, 1, 0.01)}
        {slider('synth', 'attack', 'Attack', 0.001, 0.6, 0.001)}
        {slider('synth', 'release', 'Release', 0.02, 1.4, 0.01)}
        {slider('synth', 'brightness', 'Brightness', 200, 9000, 10)}
        {slider('synth', 'detune', 'Detune', 0, 24, 0.1)}
        {slider('synth', 'harmonic', 'Harmonic', 0, 0.7, 0.01)}
        {slider('synth', 'vibrato', 'Vibrato', 0, 5, 0.05)}
        {slider('synth', 'delay', 'Delay wet', 0, 0.7, 0.01)}
        {slider('synth', 'feedback', 'Delay feedback', 0, 0.8, 0.01)}
        {slider('synth', 'duration', 'Duration', 0.25, 4, 0.05)}
      </div>

      <div style={S.noteGrid}>
        {NOTES.map(([name, frequency]) => (
          <button key={name} type="button" style={S.noteButton} onClick={() => playNote(frequency)}>
            {renderPitchLabel(name)}
          </button>
        ))}
      </div>

      <div style={S.actionRow}>
        <button
          type="button"
          style={S.noteButton}
          onClick={() => {
            stopActiveNodes();
            playNote(220);
          }}
        >
          Test Sa
        </button>
        <button
          type="button"
          style={S.noteButton}
          onClick={() => {
            if (droneOn) {
              setDroneOn(false);
              stopDrone();
            } else {
              setDroneOn(true);
            }
          }}
        >
          {droneOn ? 'Stop Drone' : 'Start Drone'}
        </button>
        <button type="button" style={S.noteButton} onClick={() => setSettings(DEFAULT_SETTINGS)}>
          Reset Synth
        </button>
        <button type="button" style={S.noteButton} onClick={() => setDrone(DEFAULT_DRONE)}>
          Reset Drone
        </button>
        <button type="button" style={S.noteButton} onClick={() => setGameMix(DEFAULT_GAME_MIX)}>
          Reset Mix
        </button>
        <button
          type="button"
          style={S.noteButton}
          onClick={() => {
            navigator.clipboard?.writeText(presetText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1100);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy Preset'}
        </button>
      </div>

      <div style={{ ...S.grid, marginTop: 10 }}>
        <div style={S.panel}>
          <label style={S.label} htmlFor="drone-waveform">
            <span>Drone Waveform</span>
          </label>
          <select
            id="drone-waveform"
            value={drone.waveform}
            style={S.select}
            onChange={(event) => updateDrone('waveform', event.target.value)}
          >
            {['sine', 'triangle', 'square', 'sawtooth'].map((waveform) => (
              <option key={waveform} value={waveform}>{waveform}</option>
            ))}
          </select>
        </div>
        {slider('drone', 'dry', 'Drone dry', 0, 1, 0.01)}
        {slider('drone', 'wet', 'Drone wet', 0, 1, 0.01)}
        {slider('drone', 'feedback', 'Drone feedback', 0, 0.9, 0.01)}
        {slider('drone', 'brightness', 'Drone brightness', 200, 4000, 10)}
      </div>

      <div style={{ ...S.grid, marginTop: 10 }}>
        {mixSlider('cue', 'Svara Rising cue', 2)}
        {mixSlider('drone', 'Svara Rising drone', 5)}
        {mixSlider('drums', 'Svara Rising drums', 2)}
        {mixSlider('result', 'Svara Rising result', 2)}
      </div>

      <textarea readOnly value={presetText} style={{ ...S.textarea, marginTop: 10 }} />
    </section>
  );
}
