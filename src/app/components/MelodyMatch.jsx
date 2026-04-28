'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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
 * Rhythm tab state: rhythmBlocks[i] = duration block assigned to slot i.
 * Slot i always shows pitch GOAL[i].noteIdx — pitches never move.
 * Initial state: durations sorted ascending (shortest first), ties in melody order.
 */
function initRhythmBlocks(goal) {
  return goal
    .map((g, i) => ({ id: `${i}-${g.beats}`, beats: g.beats }))
    .sort((a, b) => a.beats - b.beats);
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
 * Reorder blocks in `currentBlocks` as if `draggedId` were dragged to
 * beat position `dragBeatPos`. Swaps only with adjacent blocks, using the
 * dragged block's leading edge so the switch matches what the eye is tracking.
 */
function getDraggedBlocks(currentBlocks, draggedId, dragBeatPos, direction) {
  const blocks = [...currentBlocks];
  let dragSlot = blocks.findIndex(block => block.id === draggedId);
  if (dragSlot === -1 || !direction) return { blocks: currentBlocks, newDragSlot: dragSlot };

  const dragged = blocks[dragSlot];
  const exchangeThreshold = 0.35;

  if (direction === 'right') {
    while (dragSlot < blocks.length - 1) {
      const starts = computeSlotBeatStarts(blocks.map(block => block.beats));
      const slotRightEdge = starts[dragSlot] + dragged.beats;
      const dragRightEdge = dragBeatPos + dragged.beats;
      if (dragRightEdge <= slotRightEdge + exchangeThreshold) break;
      [blocks[dragSlot], blocks[dragSlot + 1]] = [blocks[dragSlot + 1], blocks[dragSlot]];
      dragSlot += 1;
    }
  } else {
    while (dragSlot > 0) {
      const starts = computeSlotBeatStarts(blocks.map(block => block.beats));
      const slotLeftEdge = starts[dragSlot];
      if (dragBeatPos >= slotLeftEdge - exchangeThreshold) break;
      [blocks[dragSlot], blocks[dragSlot - 1]] = [blocks[dragSlot - 1], blocks[dragSlot]];
      dragSlot -= 1;
    }
  }

  return { blocks, newDragSlot: dragSlot };
}

function sameBlockOrder(a, b) {
  return a.length === b.length && a.every((block, i) => block.id === b[i].id);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MelodyMatch() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const audioCtxRef = useRef(null);
  const goalNodesRef = useRef([]);
  const mineNodesRef = useRef([]);
  const rhythmPreviewNodesRef = useRef([]);
  const playheadRafRef = useRef(null);
  const goalStopRef = useRef(null);
  const mineStopRef = useRef(null);
  const rhythmAnimRafRef = useRef(null);
  const rhythmTransitionRef = useRef(null);
  const rhythmDragPreviewRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggingIdxRef = useRef(-1); // which block is currently being dragged

  const [melodyIdx, setMelodyIdx] = useState(0);
  const [currentTab, setCurrentTab] = useState('pitch');
  const [hintsOn, setHintsOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState('pitch');

  // Per-tab arrangement state
  const [pitchPositions, setPitchPositions] = useState(() => initPitchPositions(MELODIES[0]));
  // rhythmBlocks[i] = duration block assigned to slot i (slot i always has pitch GOAL[i].noteIdx)
  const [rhythmBlocks, setRhythmBlocks] = useState(() => initRhythmBlocks(MELODIES[0]));

  // Per-tab undo history (stack of snapshots)
  const [pitchHistory, setPitchHistory] = useState([]);
  const [rhythmHistory, setRhythmHistory] = useState([]);

  const [matchResult, setMatchResult] = useState(null);
  const [status, setStatus] = useState('Press ▶ Goal to hear the melody');
  const [goalPlaying, setGoalPlaying] = useState(false);
  const [minePlaying, setMinePlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState(-1);
  const [rhythmAnimTick, setRhythmAnimTick] = useState(0);
  const [activeRhythmIdx, setActiveRhythmIdx] = useState(-1);

  const GOAL = useMemo(() => MELODIES[melodyIdx], [melodyIdx]);
  const GOAL_BEAT_STARTS = useMemo(() => computeBeatStarts(GOAL), [GOAL]);
  const rhythmSlots = useMemo(() => rhythmBlocks.map(block => block.beats), [rhythmBlocks]);

  // ── Audio ──────────────────────────────────────────────────────────────────

  const getAudio = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const ctx = getAudio();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }, [getAudio]);

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

  function stopRhythmTransition() {
    cancelAnimationFrame(rhythmAnimRafRef.current);
    rhythmTransitionRef.current = null;
    rhythmDragPreviewRef.current = null;
  }

  function stopAll() {
    stopNodes(goalNodesRef.current);
    stopNodes(mineNodesRef.current);
    stopNodes(rhythmPreviewNodesRef.current);
    stopPlayhead();
    stopRhythmTransition();
  }

  function startRhythmTransition(fromBlocks, toBlocks) {
    cancelAnimationFrame(rhythmAnimRafRef.current);
    rhythmTransitionRef.current = {
      fromBlocks,
      toBlocks,
      start: performance.now(),
      duration: 160,
    };

    function step() {
      setRhythmAnimTick(t => t + 1);
      if (!rhythmTransitionRef.current) return;
      if (performance.now() - rhythmTransitionRef.current.start < rhythmTransitionRef.current.duration) {
        rhythmAnimRafRef.current = requestAnimationFrame(step);
      } else {
        rhythmTransitionRef.current = null;
        setRhythmAnimTick(t => t + 1);
      }
    }

    rhythmAnimRafRef.current = requestAnimationFrame(step);
  }

  function playNotePreview(freq) {
    const ctx = unlockAudio();
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

  function playRhythmSwapPreview(slotIdx, beats) {
    if (slotIdx < 0 || slotIdx >= GOAL.length) return;
    stopNodes(rhythmPreviewNodesRef.current);

    const ctx = unlockAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dur = beats * (BEAT_MS / 1000);
    const t = ctx.currentTime;

    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = NOTES[GOAL[slotIdx].noteIdx].freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
    gain.gain.setValueAtTime(0.35, Math.max(t + 0.02, t + dur - 0.05));
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.start(t);
    osc.stop(t + dur);
    rhythmPreviewNodesRef.current.push(osc);
  }

  function scheduleItems(items, nodeStore) {
    const ctx = unlockAudio();
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
      stopNodes(rhythmPreviewNodesRef.current);
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
    stopNodes(rhythmPreviewNodesRef.current);
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
    setActiveRhythmIdx(-1);
    const nextIdx = (melodyIdx + 1) % MELODIES.length;
    const nextGoal = MELODIES[nextIdx];
    setPitchPositions(initPitchPositions(nextGoal));
    setRhythmBlocks(initRhythmBlocks(nextGoal));
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
      const ctx = unlockAudio();
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
  }, [melodyIdx, unlockAudio]);

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

      if (
        colorIdx !== undefined
        && (colorIdx === draggingIdxRef.current || (currentTab === 'rhythm' && colorIdx === activeRhythmIdx))
      ) {
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
      const makeRects = (blocks) => {
        const starts = computeSlotBeatStarts(blocks.map(block => block.beats));
        return new Map(blocks.map((block, i) => [
          block.id,
          {
            x: starts[i] * ppb,
            y: GOAL[i].noteIdx * ROW_H,
            w: block.beats * ppb,
            label: String(starts[i] + 1),
            slotIdx: i,
          },
        ]));
      };

      const rhythmTransition = rhythmTransitionRef.current;
      const rhythmPreview = rhythmDragPreviewRef.current;
      if (rhythmPreview) {
        const targetRects = makeRects(rhythmPreview.targetBlocks);
        const transitionFromRects = rhythmTransition ? makeRects(rhythmTransition.fromBlocks) : null;
        const transitionToRects = rhythmTransition ? makeRects(rhythmTransition.toBlocks) : null;
        const rawT = rhythmTransition
          ? Math.min(1, (performance.now() - rhythmTransition.start) / rhythmTransition.duration)
          : 1;
        const t = 1 - Math.pow(1 - rawT, 3);

        rhythmPreview.targetBlocks.forEach((block) => {
          const target = targetRects.get(block.id);
          if (block.id === rhythmPreview.draggedId) {
            drawBlock(
              rhythmPreview.dragBeatPos * ppb,
              target.y,
              target.w,
              target.label,
              target.slotIdx,
            );
            return;
          }

          const from = transitionFromRects?.get(block.id) || target;
          const to = transitionToRects?.get(block.id) || target;
          drawBlock(
            from.x + (to.x - from.x) * t,
            from.y + (to.y - from.y) * t,
            from.w + (to.w - from.w) * t,
            to.label,
            to.slotIdx,
          );
        });
      } else if (rhythmTransition) {
        const rawT = Math.min(1, (performance.now() - rhythmTransition.start) / rhythmTransition.duration);
        const t = 1 - Math.pow(1 - rawT, 3);
        const fromRects = makeRects(rhythmTransition.fromBlocks);
        const toRects = makeRects(rhythmTransition.toBlocks);

        rhythmTransition.toBlocks.forEach((block) => {
          const from = fromRects.get(block.id) || toRects.get(block.id);
          const to = toRects.get(block.id);
          drawBlock(
            from.x + (to.x - from.x) * t,
            from.y + (to.y - from.y) * t,
            from.w + (to.w - from.w) * t,
            to.label,
            to.slotIdx,
          );
        });
      } else {
        const slotStarts = computeSlotBeatStarts(rhythmSlots);
        rhythmBlocks.forEach((block, i) => {
          drawBlock(
            slotStarts[i] * ppb,
            GOAL[i].noteIdx * ROW_H,
            block.beats * ppb,
            String(slotStarts[i] + 1), // beat number (1-indexed)
            i,
          );
        });
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
  }, [currentTab, hintsOn, pitchPositions, rhythmBlocks, rhythmSlots, matchResult, playheadX, activeRhythmIdx, GOAL, GOAL_BEAT_STARTS]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);
  useEffect(() => { drawCanvas(); }, [drawCanvas, rhythmAnimTick]);
  useEffect(() => {
    const handler = () => drawCanvas();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [drawCanvas]);
  useEffect(() => () => cancelAnimationFrame(rhythmAnimRafRef.current), []);

  // ── Game actions ───────────────────────────────────────────────────────────

  function checkMatch() {
    setActiveRhythmIdx(-1);
    if (currentTab === 'pitch') {
      const result = GOAL.map((g, i) => pitchPositions[i] === g.noteIdx);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length
        ? '🎉 Perfect! Well done.'
        : `${correct} of ${result.length} correct — keep trying!`);
    } else {
      // Each slot's duration should match the goal note's duration
      const result = rhythmBlocks.map((block, i) => block.beats === GOAL[i].beats);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length
        ? '🎉 Perfect! Well done.'
        : `${correct} of ${result.length} correct — keep trying!`);
    }
  }

  function clearUser() {
    setMatchResult(null);
    setActiveRhythmIdx(-1);
    stopNodes(rhythmPreviewNodesRef.current);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    if (currentTab === 'pitch') {
      setPitchPositions(initPitchPositions(GOAL));
      setPitchHistory([]);
    } else {
      stopRhythmTransition();
      setRhythmBlocks(initRhythmBlocks(GOAL));
      setRhythmHistory([]);
    }
    setStatus('Blocks reset — rearrange to match the goal');
  }

  function switchTab(tab) {
    if (tab === currentTab) return;
    setCurrentTab(tab);
    setMatchResult(null);
    setActiveRhythmIdx(-1);
    stopRhythmTransition();
    stopNodes(rhythmPreviewNodesRef.current);
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
    // State of each tab is preserved — no reset on switch
    setStatus(tab === 'pitch'
      ? 'Drag blocks up/down to match the goal melody'
      : 'Drag blocks left/right to match the goal rhythm');
  }

  function undoLast() {
    setMatchResult(null);
    setActiveRhythmIdx(-1);
    if (currentTab === 'pitch' && pitchHistory.length > 0) {
      const prev = pitchHistory[pitchHistory.length - 1];
      setPitchPositions(prev);
      setPitchHistory(h => h.slice(0, -1));
    } else if (currentTab === 'rhythm' && rhythmHistory.length > 0) {
      const prev = rhythmHistory[rhythmHistory.length - 1];
      startRhythmTransition(rhythmBlocks, prev);
      setRhythmBlocks(prev);
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
    if (helpOpen) return;
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
    if (helpOpen) return;
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
      setActiveRhythmIdx(-1);
      if (canvasRef.current) canvasRef.current.style.cursor = 'ew-resize';

      const origBlocks = [...rhythmBlocks];
      const origSlots = origBlocks.map(block => block.beats);
      const slotStarts = computeSlotBeatStarts(origSlots);
      const offsetX = x - slotStarts[idx] * ppb; // click offset within block
      const draggedId = origBlocks[idx].id;
      let targetBlocks = origBlocks;
      let lastDragBeatPos = slotStarts[idx];
      playRhythmSwapPreview(idx, origBlocks[idx].beats);
      rhythmDragPreviewRef.current = {
        draggedId,
        dragBeatPos: slotStarts[idx],
        targetBlocks,
      };

      function onMove(ev) {
        if (ev.cancelable) ev.preventDefault();
        const { x: cx } = getCanvasCoords(ev);
        const ppb2 = getPxPerBeat();
        const dragBeatPos = (cx - offsetX) / ppb2;
        const direction = dragBeatPos > lastDragBeatPos
          ? 'right'
          : dragBeatPos < lastDragBeatPos
            ? 'left'
            : null;
        lastDragBeatPos = dragBeatPos;
        const { blocks: nextTargetBlocks, newDragSlot } = getDraggedBlocks(
          targetBlocks,
          draggedId,
          dragBeatPos,
          direction,
        );

        if (!sameBlockOrder(nextTargetBlocks, targetBlocks)) {
          if (newDragSlot !== draggingIdxRef.current && nextTargetBlocks[newDragSlot]) {
            const movedBlock = nextTargetBlocks[newDragSlot];
            playRhythmSwapPreview(newDragSlot, movedBlock.beats);
          }
          startRhythmTransition(targetBlocks, nextTargetBlocks);
          targetBlocks = nextTargetBlocks;
        }

        rhythmDragPreviewRef.current = {
          draggedId,
          dragBeatPos,
          targetBlocks,
        };
        draggingIdxRef.current = newDragSlot;
        setMatchResult(null);
        setRhythmAnimTick(t => t + 1);
      }

      function onUp() {
        isDraggingRef.current = false;
        draggingIdxRef.current = -1;
        rhythmDragPreviewRef.current = null;
        setActiveRhythmIdx(targetBlocks.findIndex(block => block.id === draggedId));
        if (canvasRef.current) canvasRef.current.style.cursor = 'default';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        const changed = !sameBlockOrder(targetBlocks, origBlocks);
        if (changed) {
          cancelAnimationFrame(rhythmAnimRafRef.current);
          rhythmTransitionRef.current = null;
          setRhythmBlocks(targetBlocks);
          setRhythmHistory(prev => [...prev, origBlocks]);
        } else {
          stopRhythmTransition();
          drawCanvas();
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
    bannerSub: { fontSize: 14, color: '#333', lineHeight: 1.45, marginTop: 4, fontFamily: 'var(--font-space-mono), monospace' },
    inner: { padding: '20px 20px 24px', background: '#F5C842' },
    gameTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#E8473F', marginBottom: 4 },
    tabsRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
    tabs: { display: 'flex', border: '2.5px solid #111', width: 'fit-content' },
    tab: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#E8473F' : '#fff', color: active ? '#EEE8D0' : '#111', border: 'none', borderRight: '2.5px solid #111' }),
    tabLast: (active) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 20px', cursor: 'pointer', background: active ? '#E8473F' : '#fff', color: active ? '#EEE8D0' : '#111', border: 'none' }),
    hintsToggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' },
    hintsLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#111' },
    helpButton: { width: 28, height: 28, borderRadius: '50%', border: '2px solid #111', background: helpOpen ? '#E8473F' : '#fff', color: helpOpen ? '#EEE8D0' : '#111', fontFamily: 'var(--font-space-mono), monospace', fontSize: 15, fontWeight: 900, cursor: 'pointer', lineHeight: 1 },
    toggleTrack: (on) => ({ width: 36, height: 20, background: on ? '#E8473F' : '#fff', border: '2px solid #111', position: 'relative', transition: 'background 0.15s', flexShrink: 0 }),
    toggleThumb: (on) => ({ position: 'absolute', top: 1, left: on ? 17 : 1, width: 14, height: 14, background: on ? '#EEE8D0' : '#F5C842', border: '1.5px solid #111', transition: 'left 0.15s' }),
    instructions: { fontSize: 14, color: '#222', fontFamily: 'var(--font-space-mono), monospace', lineHeight: 1.45, marginBottom: 14 },
    directionWord: { fontWeight: 900, textTransform: 'uppercase' },
    graphOuter: { border: '2.5px solid #111', background: '#F5F2EB', marginBottom: 8, position: 'relative' },
    graphInner: { display: 'flex' },
    yAxis: { width: 40, flexShrink: 0, borderRight: '2px solid #111', display: 'flex', flexDirection: 'column', background: '#EDEAE0' },
    yCell: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#444', fontFamily: 'var(--font-space-mono), monospace', borderBottom: '1px solid #D5D1C5', height: ROW_H, flexShrink: 0, userSelect: 'none' },
    yCellSa: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#E8473F', fontFamily: 'var(--font-space-mono), monospace', borderBottom: '1px solid #D5D1C5', height: ROW_H, flexShrink: 0, userSelect: 'none' },
    canvasWrap: { flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none' },
    canvas: { display: 'block', width: '100%' },
    xAxis: { display: 'flex', marginLeft: 40, borderTop: '2px solid #111', background: '#EDEAE0' },
    xCell: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#444', fontFamily: 'var(--font-space-mono), monospace', borderRight: '1px solid #D5D1C5', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, minWidth: 0, userSelect: 'none' },
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
    goalBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 15px', border: playing ? '2px solid #E8473F' : '2px solid #111', cursor: 'pointer', background: playing ? '#E8473F' : '#111', color: '#fff', whiteSpace: 'nowrap' }),
    mineBtn: (playing) => ({ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 15px', border: playing ? '2px solid #E8473F' : '2px solid #111', cursor: 'pointer', background: playing ? '#E8473F' : '#fff', color: playing ? '#fff' : '#111', whiteSpace: 'nowrap' }),
    gbtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 15px', border: '2px solid #111', cursor: 'pointer', background: '#fff', color: '#111', whiteSpace: 'nowrap' },
    nextBtn: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '10px 15px', border: '2px solid #111', cursor: 'pointer', background: '#111', color: '#fff', whiteSpace: 'nowrap' },
    gameStatus: { fontSize: 13, color: '#222', fontFamily: 'var(--font-space-mono), monospace', fontWeight: 700, lineHeight: 1.45, letterSpacing: 0.5, width: '100%', marginTop: 6 },
    helpOverlay: { position: 'absolute', zIndex: 5, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, background: 'rgba(245, 242, 235, 0.88)' },
    helpPanel: { width: 'min(640px, 100%)', border: '2.5px solid #111', background: '#F5C842', boxShadow: '5px 5px 0 #111', padding: 10 },
    helpHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
    helpTitle: { fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 22, letterSpacing: 1.5, color: '#111' },
    helpClose: { width: 26, height: 26, border: '2px solid #111', background: '#fff', color: '#111', fontFamily: 'var(--font-space-mono), monospace', fontWeight: 900, cursor: 'pointer' },
    helpTabs: { display: 'flex', border: '2.5px solid #111', width: 'fit-content', marginBottom: 8 },
    helpBody: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
    helpCard: { border: '2px solid #111', background: '#F5F2EB', padding: 8, minHeight: 148 },
    helpCardTitle: { fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 900, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 6, color: '#111' },
    helpGrid: { position: 'relative', height: 112, border: '2px solid #111', background: '#fff', overflow: 'hidden' },
    helpBlock: (beat, row, beats, extra = {}) => ({
      position: 'absolute',
      left: `${beat * 25}%`,
      top: row,
      width: `${beats * 25}%`,
      height: 26,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #111',
      background: '#F5C842',
      color: '#111',
      fontFamily: 'var(--font-space-mono), monospace',
      fontSize: 10,
      fontWeight: 900,
      boxSizing: 'border-box',
      ...extra,
    }),
    helpTick: { position: 'absolute', right: 7, bottom: 7, width: 26, height: 26, borderRadius: '50%', border: '2px solid #111', background: '#E8473F', color: '#EEE8D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, opacity: 0 },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section style={S.section}>
      {/* Banner */}
      <div style={S.banner}>
        <div>
          <div style={S.bannerText}>Melody Match</div>
          <div style={S.bannerSub}>Listen to the goal melody, then match it — by dragging the blocks to the right places.</div>
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
          <button
            type="button"
            style={S.helpButton}
            aria-label="Open Melody Match help"
            onClick={() => {
              setHelpTab(currentTab);
              setHelpOpen(open => !open);
            }}
          >
            ?
          </button>
        </div>

        <div style={S.instructions}>
          {currentTab === 'pitch' ? (
            <>
              Drag the blocks <strong style={S.directionWord}>up/down</strong> to match the goal pitch.
            </>
          ) : (
            <>
              Drag the blocks <strong style={S.directionWord}>left/right</strong> to match the goal rhythm.
            </>
          )}
        </div>

        {/* Graph */}
        <div style={S.graphOuter}>
          {helpOpen && (
            <div style={S.helpOverlay} onClick={() => setHelpOpen(false)}>
              <div style={S.helpPanel} role="dialog" aria-label="Melody Match help" onClick={e => e.stopPropagation()}>
                <div style={S.helpHead}>
                  <div style={S.helpTitle}>How To Play</div>
                  <button type="button" style={S.helpClose} onClick={() => setHelpOpen(false)}>X</button>
                </div>
                <div style={S.helpTabs}>
                  <button type="button" style={S.tab(helpTab === 'pitch')} onClick={() => setHelpTab('pitch')}>Pitch</button>
                  <button type="button" style={S.tabLast(helpTab === 'rhythm')} onClick={() => setHelpTab('rhythm')}>Rhythm</button>
                </div>

                {helpTab === 'pitch' ? (
                  <div key="pitch-help" className="mm-help-body" style={S.helpBody}>
                    <div style={S.helpCard}>
                      <div style={S.helpCardTitle}>Goal</div>
                      <div className="mm-help-grid" style={S.helpGrid}>
                        <div style={S.helpBlock(0, 78, 1)}>Sa</div>
                        <div style={S.helpBlock(1, 12, 2)}>Ga</div>
                        <div style={S.helpBlock(3, 45, 1)}>Re</div>
                      </div>
                    </div>
                    <div style={S.helpCard}>
                      <div style={S.helpCardTitle}>Drag UP/DOWN</div>
                      <div className="mm-help-grid" style={S.helpGrid}>
                        <div style={S.helpBlock(0, 78, 1)}>Sa</div>
                        <div className="mm-pitch-wide" style={S.helpBlock(1, 78, 2)}>
                          Ga <span className="mm-block-arrow">↑</span>
                        </div>
                        <div className="mm-pitch-short" style={S.helpBlock(3, 78, 1)}>
                          Re <span className="mm-block-arrow">↑</span>
                        </div>
                        <div className="mm-help-tick" style={S.helpTick}>✓</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key="rhythm-help" className="mm-help-body" style={S.helpBody}>
                    <div style={S.helpCard}>
                      <div style={S.helpCardTitle}>Goal</div>
                      <div className="mm-help-grid" style={S.helpGrid}>
                        <div style={S.helpBlock(0, 78, 1)}>1</div>
                        <div style={S.helpBlock(1, 12, 2)}>2</div>
                        <div style={S.helpBlock(3, 45, 1)}>4</div>
                      </div>
                    </div>
                    <div style={S.helpCard}>
                      <div style={S.helpCardTitle}>Drag LEFT/RIGHT</div>
                      <div className="mm-help-grid" style={S.helpGrid}>
                        <div style={S.helpBlock(0, 78, 1)}>1</div>
                        <div className="mm-rhythm-short" style={S.helpBlock(1, 12, 1)}>
                          <span className="mm-label-start">2 <span className="mm-block-arrow">→</span></span>
                          <span className="mm-label-target">4</span>
                        </div>
                        <div className="mm-rhythm-long" style={S.helpBlock(2, 45, 2)}>
                          <span className="mm-label-start">3</span>
                          <span className="mm-label-target">2</span>
                        </div>
                        <div className="mm-help-tick" style={S.helpTick}>✓</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
      <style>{`
        .mm-help-grid::before {
          content: none;
        }

        .mm-block-arrow {
          margin-left: 4px;
          color: #E8473F;
          font-size: 14px;
          line-height: 1;
          animation: mmHelpArrow 4s linear infinite;
        }

        .mm-label-start,
        .mm-label-target {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mm-label-start {
          animation: mmStartLabel 4s linear infinite;
        }

        .mm-label-target {
          animation: mmTargetLabel 4s linear infinite;
        }

        .mm-pitch-wide {
          animation: mmPitchWide 4s ease-in-out infinite;
        }

        .mm-pitch-short {
          animation: mmPitchShort 4s ease-in-out infinite;
        }

        .mm-rhythm-short {
          animation: mmRhythmShort 4s ease-in-out infinite;
        }

        .mm-rhythm-long {
          animation: mmRhythmLong 4s ease-in-out infinite;
        }

        .mm-help-tick {
          animation: mmHelpTick 4s ease-in-out infinite;
        }

        @keyframes mmPitchWide {
          0%, 12.5% { top: 78px; }
          32%, 82% { top: 12px; }
          88%, 100% { top: 78px; }
        }

        @keyframes mmPitchShort {
          0%, 12.5% { top: 78px; }
          32%, 82% { top: 45px; }
          88%, 100% { top: 78px; }
        }

        @keyframes mmRhythmShort {
          0%, 12.5% { left: 25%; top: 12px; width: 25%; }
          32%, 82% { left: 75%; top: 45px; width: 25%; }
          88%, 100% { left: 25%; top: 12px; width: 25%; }
        }

        @keyframes mmRhythmLong {
          0%, 12.5% { left: 50%; top: 45px; width: 50%; }
          32%, 82% { left: 25%; top: 12px; width: 50%; }
          88%, 100% { left: 50%; top: 45px; width: 50%; }
        }

        @keyframes mmHelpTick {
          0%, 31%, 83%, 100% { opacity: 0; transform: scale(0.8); }
          32%, 82% { opacity: 1; transform: scale(1); }
        }

        @keyframes mmHelpArrow {
          0%, 12.5% { opacity: 1; }
          13%, 100% { opacity: 0; }
        }

        @keyframes mmStartLabel {
          0%, 31% { opacity: 1; }
          32%, 82% { opacity: 0; }
          88%, 100% { opacity: 1; }
        }

        @keyframes mmTargetLabel {
          0%, 31% { opacity: 0; }
          32%, 82% { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
