import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { TOTAL_BEATS, BEAT_MS, GRAPH_H } from './constants';
import { NOTES, MELODIES } from './melodyData';
import {
  getPxPerBeat, computeBeatStarts, initPitchPositions, initRhythmBlocks,
  computeSlotBeatStarts,
} from './utils';
import {
  getOrCreateAudio, stopNodes, scheduleSynthNote,
  scheduleItems as audioScheduleItems,
  playNotePreview as audioPlayNotePreview,
  playRhythmSwapPreview as audioPlayRhythmSwapPreview,
} from './audio';
import { drawCanvas as drawCanvasFn } from './drawCanvas';
import useMelodyMatchDrag from './useMelodyMatchDrag';

export default function useMelodyMatchGame() {
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
  const draggingIdxRef = useRef(-1);

  const [melodyIdx, setMelodyIdx] = useState(0);
  const [currentTab, setCurrentTab] = useState('pitch');
  const [hintsOn, setHintsOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState('pitch');
  const [showSoundUnlock, setShowSoundUnlock] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [pitchPositions, setPitchPositions] = useState(() => initPitchPositions(MELODIES[0]));
  const [rhythmBlocks, setRhythmBlocks] = useState(() => initRhythmBlocks(MELODIES[0]));
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

  // ── Audio lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const update = () => setShowSoundUnlock(pointerQuery.matches);
    update();
    pointerQuery.addEventListener('change', update);
    return () => pointerQuery.removeEventListener('change', update);
  }, []);

  function getAudio() {
    return getOrCreateAudio(audioCtxRef);
  }

  const unlockAudio = useCallback(() => {
    const ctx = getAudio();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => setSoundUnlocked(true)).catch(() => {});
    } else {
      setSoundUnlocked(true);
    }
    return ctx;
  }, []);

  function stopRhythmPreview() {
    stopNodes(rhythmPreviewNodesRef.current);
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
    stopRhythmPreview();
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
    audioPlayNotePreview(ctx, freq);
  }

  function playRhythmSwapPreview(slotIdx, beats) {
    if (slotIdx < 0 || slotIdx >= GOAL.length) return;
    stopRhythmPreview();
    const ctx = unlockAudio();
    audioPlayRhythmSwapPreview(ctx, NOTES[GOAL[slotIdx].noteIdx].freq, beats, BEAT_MS, rhythmPreviewNodesRef.current);
  }

  function enableSound() {
    const ctx = unlockAudio();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, t);
    osc.start(t);
    osc.stop(t + 0.02);
    setSoundUnlocked(true);
  }

  function scheduleItems(items, nodeStore) {
    const ctx = unlockAudio();
    return audioScheduleItems(ctx, items, nodeStore, BEAT_MS);
  }

  function startPlayheadAnim(startAudioTime, timeline, endAudioTime) {
    cancelAnimationFrame(playheadRafRef.current);
    const totalW = getPxPerBeat(wrapRef) * TOTAL_BEATS;
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

  // ── Playback controls ──────────────────────────────────────────────────────

  function toggleGoal() {
    if (goalPlaying) {
      stopNodes(goalNodesRef.current);
      clearTimeout(goalStopRef.current);
      setGoalPlaying(false);
    } else {
      stopNodes(goalNodesRef.current);
      stopNodes(mineNodesRef.current);
      stopRhythmPreview();
      stopPlayhead();
      clearTimeout(mineStopRef.current);
      setMinePlaying(false);
      const ppb = getPxPerBeat(wrapRef);
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
    stopRhythmPreview();
    stopPlayhead();
    clearTimeout(goalStopRef.current);
    setGoalPlaying(false);

    const ppb = getPxPerBeat(wrapRef);
    let items = [];

    if (currentTab === 'pitch') {
      items = pitchPositions.map((noteIdx, i) => ({
        freq: NOTES[noteIdx].freq,
        beats: GOAL[i].beats,
        xPx: GOAL_BEAT_STARTS[i] * ppb,
      }));
    } else {
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

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const t = setTimeout(() => {
      const goal = MELODIES[melodyIdx];
      const ctx = unlockAudio();
      const startTime = ctx.currentTime + 0.05;
      let t2 = startTime;
      goal.forEach((g) => {
        const dur = g.beats * (BEAT_MS / 1000);
        scheduleSynthNote(ctx, NOTES[g.noteIdx].freq, t2, dur, goalNodesRef.current);
        t2 += dur;
      });
      setGoalPlaying(true);
      const totalMs = goal.reduce((s, g) => s + g.beats * BEAT_MS, 0);
      goalStopRef.current = setTimeout(() => setGoalPlaying(false), totalMs + 150);
    }, 100);
    return () => clearTimeout(t);
  }, [melodyIdx, unlockAudio]);

  // ── Canvas drawing ─────────────────────────────────────────────────────────

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ppb = getPxPerBeat(wrapRef);
    const W = ppb * TOTAL_BEATS;
    canvas.width = W;
    canvas.height = GRAPH_H;
    const ctx = canvas.getContext('2d');
    drawCanvasFn(ctx, W, {
      ppb, currentTab, hintsOn, GOAL, GOAL_BEAT_STARTS,
      pitchPositions, rhythmBlocks, rhythmSlots,
      matchResult, playheadX, activeRhythmIdx,
      draggingIdx: draggingIdxRef.current,
      rhythmTransition: rhythmTransitionRef.current,
      rhythmDragPreview: rhythmDragPreviewRef.current,
      now: performance.now(),
      NOTES,
    });
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
    if (matchResult) {
      setMatchResult(null);
      setStatus(currentTab === 'pitch'
        ? 'Drag blocks up/down to match the goal melody'
        : 'Drag blocks left/right to match the goal rhythm');
      return;
    }

    if (currentTab === 'pitch') {
      const result = GOAL.map((g, i) => pitchPositions[i] === g.noteIdx);
      setMatchResult(result);
      const correct = result.filter(Boolean).length;
      setStatus(correct === result.length
        ? '🎉 Perfect! Well done.'
        : `${correct} of ${result.length} correct — keep trying!`);
    } else {
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
    stopRhythmPreview();
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
    stopRhythmPreview();
    stopNodes(mineNodesRef.current); stopPlayhead(); setMinePlaying(false);
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

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const { handleCanvasPointerDown, handleCanvasCursorHover } = useMelodyMatchDrag({
    canvasRef, wrapRef,
    currentTab, GOAL, GOAL_BEAT_STARTS,
    pitchPositions, setPitchPositions, setPitchHistory,
    rhythmBlocks, setRhythmBlocks, setRhythmHistory,
    rhythmSlots,
    isDraggingRef, draggingIdxRef,
    rhythmTransitionRef, rhythmDragPreviewRef, rhythmAnimRafRef,
    goalPlaying, minePlaying,
    showSoundUnlock, soundUnlocked, helpOpen,
    setMatchResult, setActiveRhythmIdx, setRhythmAnimTick,
    startRhythmTransition,
    playNotePreview, playRhythmSwapPreview, stopRhythmTransition,
    drawCanvas,
  });

  const hasUndo = currentTab === 'pitch' ? pitchHistory.length > 0 : rhythmHistory.length > 0;

  return {
    canvasRef,
    wrapRef,
    currentTab,
    hintsOn, setHintsOn,
    helpOpen, setHelpOpen,
    helpTab, setHelpTab,
    showSoundUnlock,
    soundUnlocked,
    goalPlaying,
    minePlaying,
    matchResult,
    status,
    hasUndo,
    toggleGoal,
    toggleMine,
    checkMatch,
    clearUser,
    switchTab,
    undoLast,
    nextMelody,
    enableSound,
    handleCanvasPointerDown,
    handleCanvasCursorHover,
  };
}
