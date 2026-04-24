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

// ── Helpers ─────────────────────────────────────────────────────────────────

function computeBeatStarts(melody) {
  return melody.reduce((acc, g, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + melody[i - 1].beats);
    return acc;
  }, []);
}

/** Pitch tab initial state: all blocks at Sa (index 7) */
function initPitchPositions(goal) {
  return goal.map(() => 7);
}

/**
 * Rhythm tab state: rhythmSlots[i] = duration assigned to slot i.
 * Slot i always shows pitch GOAL[i].noteIdx — pitches never move.
 * Initial state: durations sorted ascending (shortest first), ties in melody order.
 */
function initRhythmSlots(goal) {
  return [...goal.map(g => g.beats)].sort((a, b) => a - b);
}

/** Compute beat-start for each slot from the duration array. */
function computeSlotBeatStarts(slots) {
  const starts = [];
  let cursor = 0;
  for (const dur of slots) {
    starts.push(cursor);
    cursor += dur;
  }
  return starts;
}

/**
 * Reorder durations in `origSlots` as if slot `dragSlotIdx` were dragged to
 * beat position `dragBeatPos`. Uses centre-of-block insertion logic so other
 * slots slide smoothly out of the way.
 */
function getDraggedSlots(origSlots, dragSlotIdx, dragBeatPos) {
  const others = origSlots.map((_, i) => i).filter(i => i !== dragSlotIdx);
  const dragCenter = dragBeatPos + origSlots[dragSlotIdx] / 2;

  let cursor = 0;
  let insertPos = others.length;
  for (let p = 0; p < others.length; p++) {
    const center = cursor + origSlots[others[p]] / 2;
    if (dragCenter < center) { insertPos = p; break; }
    cursor += origSlots[others[p]];
  }

  const newOrder = [...others];
  newOrder.splice(insertPos, 0, dragSlotIdx);
  // insertPos is the new slot index of the dragged block
  return { slots: newOrder.map(i => origSlots[i]), newDragSlot: insertPos };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MelodyMatch() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const audioCtxRef = useRef(null);
  const goalNodesRef = useRef([]);
  const mineNodesRef = useRef([]);
  const playheadRafRef = useRef(null);
  const goalStopRef = useRef(null);
  const mineStopRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggingIdxRef = useRef(-1); // which block is currently being dragged

  const [melodyIdx, setMelodyIdx] = useState(0);
  const [currentTab, setCurrentTab] = useState('pitch');
  const [hintsOn, setHintsOn] = useState(false);

  // Per-tab arrangement state
  const [pitchPositions, setPitchPositions] = useState(() => initPitchPositions(MELODIES[0]));
  // rhythmSlots[i] = duration assigned to slot i (slot i always has pitch GOAL[i].noteIdx)
  const [rhythmSlots, setRhythmSlots] = useState(() => initRhythmSlots(MELODIES[0]));

  // Per-tab undo history (stack of snapshots)
  const [pitchHistory, setPitchHistory] = useState([]);
  const [rhythmHistory, setRhythmHistory] = useState([]);

  const [matchResult, setMatchResult] = useState(null);
  const [status, setStatus] = useState('Press ▶ Goal to hear the melody');
  const [goalPlaying, setGoalPlaying] = useState(false);
  const [minePlaying, setMinePlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState(-1);

  const GOAL = MELODIES[melodyIdx];
  const GOAL_BEAT_STARTS = computeBeatStarts(GOAL);

  // ── Audio ──────────────────────────────────────────────────────────────────

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

  // ── Goal play/stop ─────────────────────────────────────────────────────────

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

  // ── Mine play/stop ─────────────────────────────────────────────────────────

  function toggleMine() {
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

    if (currentTab === 'pitch') {
      items = pitchPositions.map((noteIdx, i) => ({
        freq: NOTES[noteIdx].freq,
        beats: GOAL[i].beats,
        xPx: GOAL_BEAT_STARTS[i] * ppb,
      }));
    } else {
      // Slots play left-to-right in slot order
      const slotStarts = computeSlotBeatStarts(rhythmSlots);
      items = rhythmSlots.map((dur, i) => ({
        freq: NOTES[GOAL[i].noteIdx].freq,
        beats: dur,
        xPx: slotStarts[i] * ppb,
      }));
    }

    const { startTime, timeline, endTime } = scheduleItems(items, mineNodesRef.current);
    startPlayheadAnim(startTime, timeline, endTime);
    setMinePlaying(true);
    const totalMs = items.reduce((s, it) => s + it.beats * BEAT_MS, 0);
    mineStopRef.current = setTimeout(() => {
      setMinePlaying(false);
      setPlayheadX(-1);
    }, totalMs + 150);
  }

  // ── Next melody ────────────────────────────────────────────────────────────

  function nextMelody() {
    stopAll();
    clearTimeout(goalStopRef.current);
    clearTimeout(mineStopRef.current);
    setGoalPlaying(false);
    setMinePlaying(false);
    setMatchResult(null);
    const nextIdx = (melodyIdx + 1) % MELODIES.length;
    const nextGoal = MELODIES[nextIdx];
    setPitchPositions(initPitchPositions(nextGoal));
    setRhythmSlots(initRhythmSlots(nextGoal));
    setPitchHistory([]);
    setRhythmHistory([]);
    setStatus('New melody — press ▶ Goal to hear it');
    setMelodyIdx(nextIdx);
  }

  // Auto-play goal when melody changes (not on first load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const t = setTimeout(() => {
      const goal = MELODIES[melodyIdx];
      const starts = computeBeatStarts(goal);
      const ppb = getPxPerBeat();
      const ctx = getAudio();
      const startTime = ctx.currentTime + 0.05;
      let t2 = startTime;
      goal.forEach((g, i) => {
        const dur = g.beats * (BEAT_MS / 1000);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = NOTES[g.noteIdx].freq;
        gain.gain.setValueAtTime(0, t2);
        gain.gain.linearRampToValueAtTime(0.35, t2 + 0.02);
        gain.gain.setValueAtTime(0.35, t2 + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, t2 + dur);
        osc.start(t2); osc.stop(t2 + dur);
        goalNodesRef.current.push(osc);
        t2 += dur;
      });
      setGoalPlaying(true);
      const totalMs = goal.reduce((s, g) => s + g.beats * BEAT_MS, 0);
      goalStopRef.current = setTimeout(() => setGoalPlaying(false), totalMs + 150);
    }, 100);
    return () => clearTimeout(t);
  }, [melodyIdx]);

  // ── Draw canvas ────────────────────────────────────────────────────────────

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ppb = getPxPerBeat();
    const W = ppb * TOTAL_BEATS;
    canvas.width = W;
    canvas.height = GRAPH_H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, GRAPH_H);

    // Background
    ctx.fillStyle = '#F5F2EB';
    ctx.fillRect(0, 0, W, GRAPH_H);

    // Subtle Sa-row tint
    ctx.fillStyle = 'rgba(232,71,63,0.05)';
    ctx.fillRect(0, 7 * ROW_H, W, ROW_H);

    // Grid
    ctx.strokeStyle = '#DDD9CE'; ctx.lineWidth = 1;
    for (let i = 0; i <= NOTE_COUNT; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * ROW_H); ctx.lineTo(W, i * ROW_H); ctx.stroke();
    }
    for (let b = 0; b <= TOTAL_BEATS; b++) {
      ctx.beginPath(); ctx.moveTo(b * ppb, 0); ctx.lineTo(b * ppb, GRAPH_H); ctx.stroke();
    }

    // Hints: show goal outline
    if (hintsOn) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
      GOAL.forEach((g, i) => {
        const x = GOAL_BEAT_STARTS[i] * ppb;
        const y = g.noteIdx * ROW_H;
        const w = g.beats * ppb;
        ctx.strokeRect(x + 2, y + 3, w - 4, ROW_H - 6);
      });
      ctx.restore();
    }

    // Draw a block
    // Priority: check result > dragging > resting
    const drawBlock = (x, y, w, label, colorIdx) => {
      let blockColor = '#F5C842'; // resting: yellow
      let textColor = '#111';

      if (colorIdx !== undefined && colorIdx === draggingIdxRef.current) {
        // Being dragged: red
        blockColor = '#E8473F';
        textColor = '#EEE8D0';
      }
      if (matchResult && colorIdx !== undefined && colorIdx < matchResult.length) {
        // Check result overrides everything
        blockColor = matchResult[colorIdx] ? '#4CAF76' : '#E8473F';
        textColor = '#fff';
      }

      ctx.fillStyle = blockColor;
      ctx.fillRect(x + 2, y + 3, w - 4, ROW_H - 6);
      ctx.fillStyle = textColor;
      ctx.font = `bold ${w < 36 ? 8 : 11}px 'Space Mono', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + ROW_H / 2);
      if (matchResult && colorIdx !== undefined && colorIdx < matchResult.length) {
        ctx.font = 'bold 11px \'Space Mono\', monospace';
        ctx.fillText(matchResult[colorIdx] ? '✓' : '✗', x + w - 9, y + 10);
      }
    };

    if (currentTab === 'pitch') {
      pitchPositions.forEach((noteIdx, i) => {
        drawBlock(
          GOAL_BEAT_STARTS[i] * ppb,
          noteIdx * ROW_H,
          GOAL[i].beats * ppb,
          NOTES[noteIdx].name,
          i,
        );
      });
    } else {
      const slotStarts = computeSlotBeatStarts(rhythmSlots);
      rhythmSlots.forEach((dur, i) => {
        drawBlock(
          slotStarts[i] * ppb,
          GOAL[i].noteIdx * ROW_H,
          dur * ppb,
          NOTES[GOAL[i].noteIdx].name,
          i,
        );
      });
    }

    // Canvas help text (only before check)
    if (!matchResult) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.font = 'bold 9px \'Space Mono\', monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const helpText = currentTab === 'pitch'
        ? 'drag blocks up/down to recreate the goal melody'
        : 'drag blocks left/right to recreate the goal melody';
      ctx.fillText(helpText, W / 2, GRAPH_H - 4);
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
  }, [currentTab, hintsOn, pitchPositions, rhythmSlots, matchResult, playheadX, melodyIdx]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);
  useEffect(() => {
    const handler = () => drawCanvas();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [drawCanvas]);

  // ── Game actions ───────────────────────────────────────────────────────────

  function checkMatch() {
    if (currentTab === 'pitch') {
      const result = GOAL.map((g, i) => pitchPositions[i] === g.noteIdx);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length
        ? '🎉 Perfect! Well done.'
        : `${correct} of ${result.length} correct — keep trying!`);
    } else {
      // Each slot's duration should match the goal note's duration
      const result = rhythmSlots.map((dur, i) => dur === GOAL[i].beats);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length
        ? '🎉 Perfect! Well done.'
        : `${correct} of ${result.length} correct — keep trying!`);
    }
  }

  function clearUser() {
    setMatchResult(null);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    if (currentTab === 'pitch') {
      setPitchPositions(initPitchPositions(GOAL));
      setPitchHistory([]);
    } else {
      setRhythmSlots(initRhythmSlots(GOAL));
      setRhythmHistory([]);
    }
    setStatus('Blocks reset — rearrange to match the goal');
  }

  function switchTab(tab) {
    if (tab === currentTab) return;
    setCurrentTab(tab);
    setMatchResult(null);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    // State of each tab is preserved — no reset on switch
    setStatus(tab === 'pitch'
      ? 'Drag blocks up/down to match the goal melody'
      : 'Drag blocks left/right to match the goal rhythm');
  }

  function undoLast() {
    setMatchResult(null);
    if (currentTab === 'pitch' && pitchHistory.length > 0) {
      const prev = pitchHistory[pitchHistory.length - 1];
      setPitchPositions(prev);
      setPitchHistory(h => h.slice(0, -1));
    } else if (currentTab === 'rhythm' && rhythmHistory.length > 0) {
      const prev = rhythmHistory[rhythmHistory.length - 1];
      setRhythmSlots(prev);
      setRhythmHistory(h => h.slice(0, -1));
    }
  }

  // ── Drag ──────────────────────────────────────────────────────────────────

  function getCanvasCoords(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  /** Pitch tab: find block by x column (column = beat range of that note) */
  function hitTestPitchColumn(x) {
    const ppb = getPxPerBeat();
    for (let i = 0; i < GOAL.length; i++) {
      const bx = GOAL_BEAT_STARTS[i] * ppb;
      const bw = GOAL[i].beats * ppb;
      if (x >= bx && x < bx + bw) return i;
    }
    return -1;
  }

  /** Rhythm tab: find which slot was hit at canvas (x, y) */
  function hitTestRhythmSlot(x, y) {
    const ppb = getPxPerBeat();
    const slotStarts = computeSlotBeatStarts(rhythmSlots);
    for (let i = 0; i < GOAL.length; i++) {
      const bx = slotStarts[i] * ppb;
      const by = GOAL[i].noteIdx * ROW_H;
      const bw = rhythmSlots[i] * ppb;
      if (x >= bx && x < bx + bw && y >= by && y < by + ROW_H) return i;
    }
    return -1;
  }

  function handleCanvasCursorHover(e) {
    if (isDraggingRef.current) return;
    const { x, y } = getCanvasCoords(e);
    let cursor = 'default';
    if (currentTab === 'pitch') {
      if (hitTestPitchColumn(x) !== -1) cursor = 'ns-resize';
    } else {
      if (hitTestRhythmSlot(x, y) !== -1) cursor = 'ew-resize';
    }
    if (canvasRef.current) canvasRef.current.style.cursor = cursor;
  }

  function handleCanvasPointerDown(e) {
    if (goalPlaying || minePlaying) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const ppb = getPxPerBeat();

    if (currentTab === 'pitch') {
      const idx = hitTestPitchColumn(x);
      if (idx === -1) return;

      isDraggingRef.current = true;
      draggingIdxRef.current = idx;
      if (canvasRef.current) canvasRef.current.style.cursor = 'ns-resize';

      const origPitches = [...pitchPositions];

      // Immediately snap to the clicked row
      const clickedRow = Math.max(0, Math.min(NOTE_COUNT - 1, Math.floor(y / ROW_H)));
      const snapped = [...origPitches];
      snapped[idx] = clickedRow;
      setPitchPositions(snapped);
      setMatchResult(null);
      playNotePreview(NOTES[clickedRow].freq);

      let lastRow = clickedRow;
      let finalPitches = snapped;

      function onMove(ev) {
        if (ev.cancelable) ev.preventDefault();
        const { y: cy } = getCanvasCoords(ev);
        const newRow = Math.max(0, Math.min(NOTE_COUNT - 1, Math.floor(cy / ROW_H)));
        if (newRow === lastRow) return;
        lastRow = newRow;
        const next = [...origPitches];
        next[idx] = newRow;
        finalPitches = next;
        setMatchResult(null);
        setPitchPositions(next);
        playNotePreview(NOTES[newRow].freq);
      }

      function onUp() {
        isDraggingRef.current = false;
        draggingIdxRef.current = -1;
        if (canvasRef.current) canvasRef.current.style.cursor = 'default';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        // Push to undo history only if block actually moved
        if (finalPitches[idx] !== origPitches[idx]) {
          setPitchHistory(prev => [...prev, origPitches]);
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);

    } else {
      // Rhythm tab — drag moves a duration to a different slot
      const idx = hitTestRhythmSlot(x, y);
      if (idx === -1) return;

      isDraggingRef.current = true;
      draggingIdxRef.current = idx;
      if (canvasRef.current) canvasRef.current.style.cursor = 'ew-resize';

      const origSlots = [...rhythmSlots];
      const slotStarts = computeSlotBeatStarts(origSlots);
      const offsetX = x - slotStarts[idx] * ppb; // click offset within block
      let finalSlots = origSlots;

      function onMove(ev) {
        if (ev.cancelable) ev.preventDefault();
        const { x: cx } = getCanvasCoords(ev);
        const ppb2 = getPxPerBeat();
        const dragBeatPos = (cx - offsetX) / ppb2;
        const { slots: newSlots, newDragSlot } = getDraggedSlots(origSlots, idx, dragBeatPos);
        finalSlots = newSlots;
        draggingIdxRef.current = newDragSlot; // follow the block to its current slot
        setMatchResult(null);
        setRhythmSlots(newSlots);
      }

      function onUp() {
        isDraggingRef.current = false;
        draggingIdxRef.current = -1;
        if (canvasRef.current) canvasRef.current.style.cursor = 'default';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        const changed = finalSlots.some((d, i) => d !== origSlots[i]);
        if (changed) {
          setRhythmHistory(prev => [...prev, origSlots]);
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }
  }

  const hasUndo = currentTab === 'pitch' ? pitchHistory.length > 0 : rhythmHistory.length > 0;

  // ── Styles ─────────────────────────────────────────────────────────────────

  const S = {
    section: { border: '2px dashed #111', marginBottom: 0 },
    banner: { background: '#F5F2EB', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    bannerText: { fontSize: 20, fontWeight: 700, color: '#111', fontFamily: 'var(--font-bebas-neue), sans-serif', letterSpacing: 2 },
    bannerSub: { fontSize: 12, color: '#555', marginTop: 4, fontFamily: 'var(--font-space-mono), monospace' },
    inner: { padding: '20px 20px 24px' },
    gameTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#E8473F', marginBottom: 4 },
    tabsRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
    tabs: { display: 'flex', border: '2.5px solid #111', width: 'fit-content' },
    tab: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#E8473F' : '#fff', color: active ? '#EEE8D0' : '#111', border: 'none', borderRight: '2.5px solid #111' }),
    tabLast: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#E8473F' : '#fff', color: active ? '#EEE8D0' : '#111', border: 'none' }),
    hintsToggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' },
    hintsLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#111' },
    toggleTrack: (on) => ({ width: 36, height: 20, background: on ? '#E8473F' : '#EDEAE0', border: '2px solid #111', position: 'relative', transition: 'background 0.15s', flexShrink: 0 }),
    toggleThumb: (on) => ({ position: 'absolute', top: 1, left: on ? 17 : 1, width: 14, height: 14, background: on ? '#EEE8D0' : '#111', border: '1.5px solid #111', transition: 'left 0.15s' }),
    instructions: { fontSize: 11, color: '#555', fontFamily: 'var(--font-space-mono), monospace', marginBottom: 12 },
    graphOuter: { border: '2.5px solid #111', background: '#F5F2EB', marginBottom: 8 },
    graphInner: { display: 'flex' },
    yAxis: { width: 40, flexShrink: 0, borderRight: '2px solid #111', display: 'flex', flexDirection: 'column', background: '#EDEAE0' },
    yCell: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#444', fontFamily: 'var(--font-space-mono), monospace', borderBottom: '1px solid #D5D1C5', height: ROW_H, flexShrink: 0, userSelect: 'none' },
    yCellSa: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#E8473F', fontFamily: 'var(--font-space-mono), monospace', borderBottom: '1px solid #D5D1C5', height: ROW_H, flexShrink: 0, userSelect: 'none' },
    canvasWrap: { flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none' },
    canvas: { display: 'block', width: '100%' },
    xAxis: { display: 'flex', marginLeft: 40, borderTop: '2px solid #111' },
    xCell: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#888', fontFamily: 'var(--font-space-mono), monospace', borderRight: '1px solid #E0DDD4', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, minWidth: 0, userSelect: 'none' },
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
    goalBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: playing ? '2px solid #E8473F' : '2px solid #111', cursor: 'pointer', background: playing ? '#E8473F' : '#111', color: '#fff', whiteSpace: 'nowrap' }),
    mineBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: playing ? '2px solid #E8473F' : '2px solid #111', cursor: 'pointer', background: playing ? '#E8473F' : '#fff', color: playing ? '#fff' : '#111', whiteSpace: 'nowrap' }),
    gbtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: '2px solid #111', cursor: 'pointer', background: '#fff', color: '#111', whiteSpace: 'nowrap' },
    nextBtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '9px 14px', border: '2px solid #111', cursor: 'pointer', background: '#111', color: '#fff', whiteSpace: 'nowrap' },
    gameStatus: { fontSize: 10, color: '#333', fontFamily: 'var(--font-space-mono), monospace', letterSpacing: 1, width: '100%', marginTop: 4 },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {/* Tabs + Hints toggle */}
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
            ? 'Drag the blocks up/down to match the goal pitch.'
            : 'Drag the blocks left/right to match the goal rhythm.'}
        </div>

        {/* Graph */}
        <div style={S.graphOuter}>
          <div style={S.graphInner}>
            {/* Y Axis — labels only, not clickable */}
            <div style={{ ...S.yAxis, height: GRAPH_H }}>
              {NOTES.map((n) => {
                const isSa = n.name.includes('Sa');
                return (
                  <div key={n.name} style={isSa ? S.yCellSa : S.yCell}>
                    {n.name}
                  </div>
                );
              })}
            </div>
            {/* Canvas */}
            <div style={S.canvasWrap} ref={wrapRef}>
              <canvas
                ref={canvasRef}
                style={S.canvas}
                onMouseDown={handleCanvasPointerDown}
                onMouseMove={handleCanvasCursorHover}
                onTouchStart={handleCanvasPointerDown}
              />
            </div>
          </div>
          {/* X Axis — labels only */}
          <div style={S.xAxis}>
            {Array.from({ length: TOTAL_BEATS }, (_, b) => (
              <div key={b} style={S.xCell}>{b + 1}</div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <button style={S.goalBtn(goalPlaying)} onClick={toggleGoal}>
            {goalPlaying ? '■ Goal' : '▶ Goal'}
          </button>
          <button style={S.mineBtn(minePlaying)} onClick={toggleMine}>
            {minePlaying ? '■ Mine' : '▶ Mine'}
          </button>
          <button style={S.gbtn} onClick={checkMatch}>✓ Check</button>
          <button
            style={{ ...S.gbtn, opacity: hasUndo ? 1 : 0.35, cursor: hasUndo ? 'pointer' : 'default' }}
            onClick={undoLast}
            disabled={!hasUndo}
          >
            ↩ Undo
          </button>
          <button style={S.gbtn} onClick={clearUser}>✕ Clear</button>
          <button style={S.nextBtn} onClick={nextMelody}>→ Next</button>
          <div style={S.gameStatus}>{status}</div>
        </div>
      </div>
    </section>
  );
}
