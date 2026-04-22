'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const NOTES = [
  { name: "Sa'", freq: 523.25 },
  { name: 'Ni',  freq: 493.88 },
  { name: 'Dha', freq: 440.00 },
  { name: 'Pa',  freq: 392.00 },
  { name: 'Ma',  freq: 349.23 },
  { name: 'Ga',  freq: 329.63 },
  { name: 'Re',  freq: 293.66 },
  { name: 'Sa',  freq: 261.63 },
];

const MELODIES = [
  [
    { noteIdx: 7, beats: 1 }, { noteIdx: 6, beats: 1 },
    { noteIdx: 5, beats: 1 }, { noteIdx: 4, beats: 2 },
    { noteIdx: 3, beats: 1 }, { noteIdx: 5, beats: 1 },
    { noteIdx: 6, beats: 1 }, { noteIdx: 7, beats: 2 },
  ],
  [
    { noteIdx: 7, beats: 2 }, { noteIdx: 4, beats: 1 },
    { noteIdx: 3, beats: 2 }, { noteIdx: 5, beats: 1 },
    { noteIdx: 6, beats: 1 }, { noteIdx: 7, beats: 2 },
    { noteIdx: 6, beats: 1 },
  ],
  [
    { noteIdx: 3, beats: 1 }, { noteIdx: 2, beats: 1 },
    { noteIdx: 1, beats: 1 }, { noteIdx: 0, beats: 2 },
    { noteIdx: 1, beats: 1 }, { noteIdx: 2, beats: 1 },
    { noteIdx: 3, beats: 2 }, { noteIdx: 4, beats: 1 },
  ],
  [
    { noteIdx: 7, beats: 1 }, { noteIdx: 6, beats: 1 },
    { noteIdx: 7, beats: 1 }, { noteIdx: 6, beats: 1 },
    { noteIdx: 5, beats: 2 }, { noteIdx: 4, beats: 1 },
    { noteIdx: 3, beats: 3 },
  ],
  [
    { noteIdx: 5, beats: 1 }, { noteIdx: 4, beats: 1 },
    { noteIdx: 3, beats: 1 }, { noteIdx: 2, beats: 2 },
    { noteIdx: 3, beats: 1 }, { noteIdx: 4, beats: 1 },
    { noteIdx: 5, beats: 2 }, { noteIdx: 6, beats: 1 },
  ],
];

const TOTAL_BEATS = 10;
const BEAT_MS = 420;
const NOTE_COUNT = NOTES.length;
const ROW_H = 36;
const GRAPH_H = NOTE_COUNT * ROW_H;

function computeBeatStarts(melody) {
  return melody.reduce((acc, g, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + melody[i - 1].beats);
    return acc;
  }, []);
}

export default function MelodyMatch() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const audioCtxRef = useRef(null);
  const goalNodesRef = useRef([]);
  const mineNodesRef = useRef([]);
  const playheadRafRef = useRef(null);
  const goalStopRef = useRef(null);
  const mineStopRef = useRef(null);

  const [melodyIdx, setMelodyIdx] = useState(0);
  const [currentTab, setCurrentTab] = useState('pitch');
  const [hintsOn, setHintsOn] = useState(false);
  const [userPitches, setUserPitches] = useState([]);
  const [userBeats, setUserBeats] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [status, setStatus] = useState('Tap note names on the left to begin');
  const [goalPlaying, setGoalPlaying] = useState(false);
  const [minePlaying, setMinePlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState(-1);

  const GOAL = MELODIES[melodyIdx];
  const GOAL_BEAT_STARTS = computeBeatStarts(GOAL);

  function getAudio() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function getPxPerBeat() {
    if (!wrapRef.current) return 40;
    return Math.floor(wrapRef.current.clientWidth / TOTAL_BEATS);
  }

  function getRhythmDuration(i, beats) {
    if (i < beats.length - 1) return beats[i + 1] - beats[i];
    if (beats.length === GOAL.length) return TOTAL_BEATS - beats[i];
    return 1;
  }

  function stopNodes(nodes) {
    nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    nodes.length = 0;
  }

  function stopPlayhead() {
    cancelAnimationFrame(playheadRafRef.current);
    setPlayheadX(-1);
  }

  function stopAll() {
    stopNodes(goalNodesRef.current);
    stopNodes(mineNodesRef.current);
    stopPlayhead();
  }

  function playNotePreview(freq) {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
    gain.gain.setValueAtTime(0.35, t + 0.22);
    gain.gain.linearRampToValueAtTime(0, t + 0.26);
    osc.start(t); osc.stop(t + 0.26);
  }

  function scheduleItems(items, nodeStore) {
    const ctx = getAudio();
    const startTime = ctx.currentTime + 0.05;
    let t = startTime;
    const timeline = [];
    items.forEach(item => {
      const dur = item.beats * (BEAT_MS / 1000);
      timeline.push({ audioTime: t, xPx: item.xPx });
      if (item.freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = item.freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.setValueAtTime(0.35, t + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.start(t); osc.stop(t + dur);
        nodeStore.push(osc);
      }
      t += dur;
    });
    return { startTime, timeline, endTime: t };
  }

  function startPlayheadAnim(startAudioTime, timeline, endAudioTime) {
    cancelAnimationFrame(playheadRafRef.current);
    const totalW = getPxPerBeat() * TOTAL_BEATS;
    function step() {
      const now = getAudio().currentTime;
      if (now >= endAudioTime) { setPlayheadX(-1); return; }
      let x = 0;
      for (let i = 0; i < timeline.length; i++) {
        const curr = timeline[i];
        const next = timeline[i + 1];
        const segEnd = next ? next.audioTime : endAudioTime;
        const segXEnd = next ? next.xPx : totalW;
        if (now <= segEnd) {
          const t2 = Math.max(0, (now - curr.audioTime) / (segEnd - curr.audioTime));
          x = curr.xPx + t2 * (segXEnd - curr.xPx);
          break;
        }
      }
      setPlayheadX(x);
      playheadRafRef.current = requestAnimationFrame(step);
    }
    playheadRafRef.current = requestAnimationFrame(step);
  }

  // ── GOAL PLAY/STOP ──────────────────────────────────────────
  function toggleGoal() {
    if (goalPlaying) {
      stopNodes(goalNodesRef.current);
      clearTimeout(goalStopRef.current);
      setGoalPlaying(false);
    } else {
      stopNodes(goalNodesRef.current);
      stopNodes(mineNodesRef.current);
      stopPlayhead();
      clearTimeout(mineStopRef.current);
      setMinePlaying(false);
      const ppb = getPxPerBeat();
      const items = GOAL.map((g, i) => ({
        freq: NOTES[g.noteIdx].freq, beats: g.beats,
        xPx: GOAL_BEAT_STARTS[i] * ppb,
      }));
      scheduleItems(items, goalNodesRef.current);
      setGoalPlaying(true);
      const totalMs = GOAL.reduce((s, g) => s + g.beats * BEAT_MS, 0);
      goalStopRef.current = setTimeout(() => setGoalPlaying(false), totalMs + 150);
    }
  }

  // ── MINE PLAY/STOP ──────────────────────────────────────────
  function toggleMine(tab, pitches, beats) {
    if (minePlaying) {
      stopNodes(mineNodesRef.current);
      stopPlayhead();
      clearTimeout(mineStopRef.current);
      setMinePlaying(false);
      return;
    }
    stopNodes(goalNodesRef.current);
    stopNodes(mineNodesRef.current);
    stopPlayhead();
    clearTimeout(goalStopRef.current);
    setGoalPlaying(false);

    const ppb = getPxPerBeat();
    let items = [];

    if (tab === 'pitch') {
      if (pitches.length === 0) { setStatus('Add some notes first!'); return; }
      items = pitches.map((ni, i) => ({
        freq: NOTES[ni].freq,
        beats: GOAL[i] ? GOAL[i].beats : 1,
        xPx: GOAL_BEAT_STARTS[i] * ppb,
      }));
    } else {
      if (beats.length === 0) { setStatus('Tap some beats first!'); return; }
      const beatMap = {};
      beats.forEach((b, i) => { beatMap[b] = i; });
      const lastIdx = beats.length - 1;
      const lastEnd = beats[lastIdx] + getRhythmDuration(lastIdx, beats);
      let b = 0;
      while (b < lastEnd) {
        if (beatMap[b] !== undefined) {
          const i = beatMap[b];
          const dur = getRhythmDuration(i, beats);
          items.push({ freq: NOTES[GOAL[i].noteIdx].freq, beats: dur, xPx: b * ppb });
          b += dur;
        } else {
          items.push({ freq: 0, beats: 1, xPx: b * ppb });
          b++;
        }
      }
    }

    const { startTime, timeline, endTime } = scheduleItems(items, mineNodesRef.current);
    startPlayheadAnim(startTime, timeline, endTime);
    setMinePlaying(true);
    const totalMs = items.reduce((s, item) => s + item.beats * BEAT_MS, 0);
    mineStopRef.current = setTimeout(() => {
      setMinePlaying(false);
      setPlayheadX(-1);
    }, totalMs + 150);
  }

  // ── NEXT MELODY ─────────────────────────────────────────────
  function nextMelody() {
    stopAll();
    clearTimeout(goalStopRef.current);
    clearTimeout(mineStopRef.current);
    setGoalPlaying(false);
    setMinePlaying(false);
    setUserPitches([]);
    setUserBeats([]);
    setMatchResult(null);
    setStatus('New melody — press Goal to hear it');
    const nextIdx = (melodyIdx + 1) % MELODIES.length;
    setMelodyIdx(nextIdx);
  }

  // Auto-play goal when melody changes (except on first load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    // Small delay to let state settle
    const t = setTimeout(() => {
      const goal = MELODIES[melodyIdx];
      const starts = computeBeatStarts(goal);
      const ppb = getPxPerBeat();
      const items = goal.map((g, i) => ({
        freq: NOTES[g.noteIdx].freq, beats: g.beats, xPx: starts[i] * ppb,
      }));
      const ctx = getAudio();
      const startTime = ctx.currentTime + 0.05;
      let t2 = startTime;
      items.forEach(item => {
        const dur = item.beats * (BEAT_MS / 1000);
        if (item.freq > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine'; osc.frequency.value = item.freq;
          gain.gain.setValueAtTime(0, t2);
          gain.gain.linearRampToValueAtTime(0.35, t2 + 0.02);
          gain.gain.setValueAtTime(0.35, t2 + dur - 0.05);
          gain.gain.linearRampToValueAtTime(0, t2 + dur);
          osc.start(t2); osc.stop(t2 + dur);
          goalNodesRef.current.push(osc);
        }
        t2 += dur;
      });
      setGoalPlaying(true);
      const totalMs = goal.reduce((s, g) => s + g.beats * BEAT_MS, 0);
      goalStopRef.current = setTimeout(() => setGoalPlaying(false), totalMs + 150);
    }, 100);
    return () => clearTimeout(t);
  }, [melodyIdx]);

  // ── DRAW CANVAS ─────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ppb = getPxPerBeat();
    const W = ppb * TOTAL_BEATS;
    canvas.width = W;
    canvas.height = GRAPH_H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, GRAPH_H);

    // Grid
    ctx.strokeStyle = '#F0EDE4'; ctx.lineWidth = 1;
    for (let i = 0; i <= NOTE_COUNT; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * ROW_H); ctx.lineTo(W, i * ROW_H); ctx.stroke();
    }
    for (let b = 0; b <= TOTAL_BEATS; b++) {
      ctx.beginPath(); ctx.moveTo(b * ppb, 0); ctx.lineTo(b * ppb, GRAPH_H); ctx.stroke();
    }

    // Hints
    if (hintsOn) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#C8C4B4'; ctx.lineWidth = 1.5;
      GOAL.forEach((g, i) => {
        const x = GOAL_BEAT_STARTS[i] * ppb;
        const y = g.noteIdx * ROW_H;
        const w = g.beats * ppb;
        ctx.strokeRect(x + 2, y + 3, w - 4, ROW_H - 6);
      });
      ctx.restore();
    }

    // User blocks
    const drawBlock = (x, y, w, label, colorIdx) => {
      let color = '#1A3A5C';
      if (matchResult && colorIdx < matchResult.length) {
        color = matchResult[colorIdx] ? '#27AE60' : '#E8473F';
      }
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y + 3, w - 4, ROW_H - 6);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${w < 36 ? 8 : 11}px Courier New`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + ROW_H / 2);
      if (matchResult && colorIdx < matchResult.length) {
        ctx.font = 'bold 11px Courier New';
        ctx.fillText(matchResult[colorIdx] ? '✓' : '✗', x + w - 9, y + 10);
      }
    };

    if (currentTab === 'pitch') {
      userPitches.forEach((noteIdx, i) => {
        if (i >= GOAL.length) return;
        drawBlock(GOAL_BEAT_STARTS[i] * ppb, noteIdx * ROW_H, GOAL[i].beats * ppb, NOTES[noteIdx].name, i);
      });
    } else {
      userBeats.forEach((beatStart, i) => {
        if (i >= GOAL.length) return;
        const dur = getRhythmDuration(i, userBeats);
        drawBlock(beatStart * ppb, GOAL[i].noteIdx * ROW_H, dur * ppb, NOTES[GOAL[i].noteIdx].name, i);
      });
    }

    // Empty state
    const isEmpty = currentTab === 'pitch' ? userPitches.length === 0 : userBeats.length === 0;
    if (isEmpty) {
      ctx.fillStyle = '#B8B4A4';
      const fontSize = Math.max(20, Math.min(30, GRAPH_H / 5));
      ctx.font = `italic ${fontSize}px Georgia, serif`;
      ctx.textBaseline = 'middle';
      if (currentTab === 'pitch') {
        ctx.textAlign = 'left';
        ctx.fillText('← tap a note', 14, GRAPH_H / 2 - fontSize * 0.65);
        ctx.fillText('name to begin', 14, GRAPH_H / 2 + fontSize * 0.65);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText('tap a beat number', W / 2, GRAPH_H / 2 - fontSize * 0.65);
        ctx.fillText('below to begin ↓', W / 2, GRAPH_H / 2 + fontSize * 0.65);
      }
    }

    // Playhead
    if (playheadX >= 0) {
      ctx.strokeStyle = '#E8473F'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(playheadX, 0); ctx.lineTo(playheadX, GRAPH_H); ctx.stroke();
      ctx.fillStyle = '#E8473F';
      ctx.beginPath();
      ctx.moveTo(playheadX - 5, 0); ctx.lineTo(playheadX + 5, 0); ctx.lineTo(playheadX, 8);
      ctx.fill();
    }
  }, [currentTab, hintsOn, userPitches, userBeats, matchResult, playheadX, melodyIdx]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);
  useEffect(() => {
    const handler = () => drawCanvas();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [drawCanvas]);

  // ── GAME ACTIONS ────────────────────────────────────────────
  function addPitch(noteIdx) {
    if (userPitches.length >= GOAL.length) { setStatus('Melody complete — press Check or Clear'); return; }
    setMatchResult(null);
    const next = [...userPitches, noteIdx];
    setUserPitches(next);
    playNotePreview(NOTES[noteIdx].freq);
    setStatus(`${next.length} of ${GOAL.length} placed`);
  }

  function addBeat(beat) {
    const idx = userBeats.length;
    if (idx >= GOAL.length) { setStatus('All notes placed — press Check or Clear'); return; }
    if (idx > 0 && beat <= userBeats[idx - 1]) {
      setStatus('Beat must come after the previous note');
      return;
    }
    setMatchResult(null);
    const next = [...userBeats, beat];
    setUserBeats(next);
    playNotePreview(NOTES[GOAL[idx].noteIdx].freq);
    setStatus(`${next.length} of ${GOAL.length} placed`);
  }

  function undoLast() {
    setMatchResult(null);
    if (currentTab === 'pitch') {
      setUserPitches(prev => {
        const next = prev.slice(0, -1);
        setStatus(next.length === 0 ? 'Tap note names on the left to begin' : `${next.length} of ${GOAL.length} placed`);
        return next;
      });
    } else {
      setUserBeats(prev => {
        const next = prev.slice(0, -1);
        setStatus(next.length === 0 ? 'Tap beat numbers at the bottom to begin' : `${next.length} of ${GOAL.length} placed`);
        return next;
      });
    }
    stopNodes(mineNodesRef.current);
    stopPlayhead();
    setMinePlaying(false);
  }

  function checkMatch() {
    if (currentTab === 'pitch') {
      if (userPitches.length === 0) { setStatus('Add some notes first!'); return; }
      const result = GOAL.map((g, i) => userPitches[i] === g.noteIdx);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length ? '🎉 Perfect! Well done.' : `${correct} of ${result.length} correct — try again!`);
    } else {
      if (userBeats.length === 0) { setStatus('Tap some beats first!'); return; }
      const result = GOAL.map((g, i) => userBeats[i] === GOAL_BEAT_STARTS[i]);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length ? '🎉 Perfect! Well done.' : `${correct} of ${result.length} correct — try again!`);
    }
  }

  function clearUser() {
    setUserPitches([]); setUserBeats([]); setMatchResult(null);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    setStatus(currentTab === 'pitch' ? 'Tap note names on the left to begin' : 'Tap beat numbers at the bottom to begin');
  }

  function switchTab(tab) {
    setCurrentTab(tab); setMatchResult(null);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    setStatus(tab === 'pitch' ? 'Tap note names on the left to begin' : 'Tap beat numbers at the bottom to begin');
  }

  const hasInput = currentTab === 'pitch' ? userPitches.length > 0 : userBeats.length > 0;

  // ── STYLES ──────────────────────────────────────────────────
  const S = {
    section: { border: '2.5px solid #111', borderTop: 'none', marginBottom: 0, borderBottom: '2.5px solid #111' },
    banner: { background: '#F5C842', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    bannerText: { fontSize: 13, fontWeight: 700, color: '#111' },
    bannerSub: { fontSize: 10, color: '#555', marginTop: 2 },
    inner: { padding: '20px 20px 24px' },
    gameTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#E8473F', marginBottom: 4 },
    gameDesc: { fontSize: 12, color: '#777', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: 16 },
    tabsRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
    tabs: { display: 'flex', border: '2.5px solid #111', width: 'fit-content' },
    tab: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#111' : '#EDEAE0', color: active ? '#F5C842' : '#888', border: 'none', borderRight: '2.5px solid #111' }),
    tabLast: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#111' : '#EDEAE0', color: active ? '#F5C842' : '#888', border: 'none' }),
    hintsToggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' },
    hintsLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#888' },
    toggleTrack: (on) => ({ width: 36, height: 20, background: on ? '#111' : '#CCC8BC', border: '2px solid #111', position: 'relative', transition: 'background 0.15s', flexShrink: 0 }),
    toggleThumb: (on) => ({ position: 'absolute', top: 1, left: on ? 17 : 1, width: 14, height: 14, background: on ? '#F5C842' : '#F5F2EB', border: '1.5px solid #111', transition: 'left 0.15s' }),
    instructions: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 12 },
    graphOuter: { border: '2.5px solid #111', background: '#fff', marginBottom: 8 },
    graphInner: { display: 'flex' },
    yAxis: { width: 40, flexShrink: 0, borderRight: '2px solid #111', display: 'flex', flexDirection: 'column', background: '#EDEAE0' },
    yCell: (active) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#666', borderBottom: '1px solid #E0DDD4', cursor: active ? 'pointer' : 'default', height: ROW_H, flexShrink: 0, userSelect: 'none', opacity: active ? 1 : 0.4 }),
    yCellSa: (active) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#E8473F', borderBottom: '1px solid #E0DDD4', cursor: active ? 'pointer' : 'default', height: ROW_H, flexShrink: 0, userSelect: 'none', opacity: active ? 1 : 0.4 }),
    canvasWrap: { flex: 1, overflow: 'hidden', position: 'relative' },
    canvas: { display: 'block', width: '100%' },
    xAxis: { display: 'flex', marginLeft: 40, borderTop: '2px solid #111' },
    xCell: (active) => ({ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#888', cursor: active ? 'pointer' : 'default', borderRight: '1px solid #E0DDD4', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, minWidth: 0, userSelect: 'none', opacity: active ? 1 : 0.4 }),
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
    undoBtn: (enabled) => ({ width: 36, height: 36, borderRadius: '50%', border: '2px solid #111', background: '#F5F2EB', fontSize: 16, cursor: enabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#111', userSelect: 'none', opacity: enabled ? 1 : 0.3 }),
    goalBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: playing ? '2px solid #E8473F' : '2px solid #1A3A5C', cursor: 'pointer', background: playing ? '#E8473F' : '#1A3A5C', color: '#fff', whiteSpace: 'nowrap' }),
    mineBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: playing ? '2px solid #E8473F' : '2px solid #111', cursor: 'pointer', background: playing ? '#E8473F' : '#111', color: playing ? '#fff' : '#F5C842', whiteSpace: 'nowrap' }),
    gbtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: '2px solid #111', cursor: 'pointer', background: 'transparent', color: '#111', whiteSpace: 'nowrap' },
    nextBtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: '2px solid #888', cursor: 'pointer', background: '#EDEAE0', color: '#555', whiteSpace: 'nowrap' },
    gameStatus: { fontSize: 10, color: '#888', letterSpacing: 1, width: '100%', marginTop: 4 },
  };

  return (
    <section style={S.section}>
      {/* Banner */}
      <div style={S.banner}>
        <div>
          <div style={S.bannerText}>Melody Match</div>
          <div style={S.bannerSub}>Listen to the goal melody, then match it — by pitch, or by rhythm.</div>
        </div>
      </div>

      <div style={S.inner}>
        {/* Tabs + Hints */}
        <div style={S.tabsRow}>
          <div style={S.tabs}>
            <button style={S.tab(currentTab === 'pitch')} onClick={() => switchTab('pitch')}>Pitch</button>
            <button style={S.tabLast(currentTab === 'rhythm')} onClick={() => switchTab('rhythm')}>Rhythm</button>
          </div>
          <div style={S.hintsToggle} onClick={() => setHintsOn(h => !h)}>
            <div style={S.hintsLabel}>Hints</div>
            <div style={S.toggleTrack(hintsOn)}>
              <div style={S.toggleThumb(hintsOn)} />
            </div>
          </div>
        </div>

        <div style={S.instructions}>
          {currentTab === 'pitch'
            ? 'Tap note names on the left to place pitches in order.'
            : 'Tap beat numbers at the bottom to place each note in time.'}
        </div>

        {/* Graph */}
        <div style={S.graphOuter}>
          <div style={S.graphInner}>
            {/* Y Axis */}
            <div style={{ ...S.yAxis, height: GRAPH_H }}>
              {NOTES.map((n, i) => {
                const isSa = n.name.includes('Sa');
                const active = currentTab === 'pitch';
                return (
                  <div
                    key={n.name}
                    style={isSa ? S.yCellSa(active) : S.yCell(active)}
                    onClick={() => active && addPitch(i)}
                  >
                    {n.name}
                  </div>
                );
              })}
            </div>
            {/* Canvas */}
            <div style={S.canvasWrap} ref={wrapRef}>
              <canvas ref={canvasRef} style={S.canvas} />
            </div>
          </div>
          {/* X Axis */}
          <div style={S.xAxis}>
            {Array.from({ length: TOTAL_BEATS }, (_, b) => {
              const active = currentTab === 'rhythm';
              return (
                <div
                  key={b}
                  style={S.xCell(active)}
                  onClick={() => active && addBeat(b)}
                >
                  {b + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <button style={S.undoBtn(hasInput)} onClick={undoLast} disabled={!hasInput} title="Undo last note">↩</button>
          <button style={S.goalBtn(goalPlaying)} onClick={toggleGoal}>
            {goalPlaying ? '■ Goal' : '▶ Goal'}
          </button>
          <button style={S.mineBtn(minePlaying)} onClick={() => toggleMine(currentTab, userPitches, userBeats)}>
            {minePlaying ? '■ Mine' : '▶ Mine'}
          </button>
          <button style={S.gbtn} onClick={checkMatch}>✓ Check</button>
          <button style={S.gbtn} onClick={clearUser}>✕ Clear</button>
          <button style={S.nextBtn} onClick={nextMelody}>→ Next</button>
          <div style={S.gameStatus}>{status}</div>
        </div>
      </div>
    </section>
  );
}