import { NOTE_COUNT, ROW_H } from './constants';
import { getPxPerBeat, computeSlotBeatStarts, getDraggedBlocks, sameBlockOrder } from './utils';
import { NOTES } from './melodyData';

export default function useMelodyMatchDrag({
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
}) {
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

  function isTouchEvent(e) {
    return Boolean(e.touches || e.changedTouches);
  }

  function hitTestPitchColumn(x) {
    const ppb = getPxPerBeat(wrapRef);
    for (let i = 0; i < GOAL.length; i++) {
      const bx = GOAL_BEAT_STARTS[i] * ppb;
      const bw = GOAL[i].beats * ppb;
      if (x >= bx && x < bx + bw) return i;
    }
    return -1;
  }

  function hitTestRhythmSlot(x, y) {
    const ppb = getPxPerBeat(wrapRef);
    const slotStarts = computeSlotBeatStarts(rhythmSlots);
    for (let i = 0; i < GOAL.length; i++) {
      const bx = slotStarts[i] * ppb;
      const by = GOAL[i].noteIdx * ROW_H;
      const bw = rhythmSlots[i] * ppb;
      if (x >= bx && x < bx + bw && y >= by && y < by + ROW_H) return i;
    }
    return -1;
  }

  function startPitchDrag(e, idx, x, y) {
    isDraggingRef.current = true;
    draggingIdxRef.current = idx;
    if (canvasRef.current) canvasRef.current.style.cursor = 'ns-resize';

    const origPitches = [...pitchPositions];
    const grabTop = origPitches[idx] * ROW_H;
    const grabbedCurrentBlock = y >= grabTop && y < grabTop + ROW_H;
    const offsetY = isTouchEvent(e)
      ? ROW_H / 2
      : grabbedCurrentBlock ? y - grabTop : ROW_H / 2;

    const clickedRow = grabbedCurrentBlock
      ? origPitches[idx]
      : Math.max(0, Math.min(NOTE_COUNT - 1, Math.floor(y / ROW_H)));
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
      const newRow = Math.max(0, Math.min(NOTE_COUNT - 1, Math.floor((cy - offsetY + ROW_H / 2) / ROW_H)));
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
      if (finalPitches[idx] !== origPitches[idx]) {
        setPitchHistory(prev => [...prev, origPitches]);
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }

  function startRhythmDrag(e, idx, x) {
    const ppb = getPxPerBeat(wrapRef);
    isDraggingRef.current = true;
    draggingIdxRef.current = idx;
    setActiveRhythmIdx(-1);
    if (canvasRef.current) canvasRef.current.style.cursor = 'ew-resize';

    const origBlocks = [...rhythmBlocks];
    const origSlots = origBlocks.map(block => block.beats);
    const slotStarts = computeSlotBeatStarts(origSlots);
    const blockWidth = origBlocks[idx].beats * ppb;
    const offsetX = isTouchEvent(e)
      ? blockWidth / 2
      : x - slotStarts[idx] * ppb;
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
      const ppb2 = getPxPerBeat(wrapRef);
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

  function handleCanvasPointerDown(e) {
    if (showSoundUnlock && !soundUnlocked) return;
    if (helpOpen) return;
    if (goalPlaying || minePlaying) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);

    if (currentTab === 'pitch') {
      const idx = hitTestPitchColumn(x);
      if (idx !== -1) startPitchDrag(e, idx, x, y);
    } else {
      const idx = hitTestRhythmSlot(x, y);
      if (idx !== -1) startRhythmDrag(e, idx, x);
    }
  }

  function handleCanvasCursorHover(e) {
    if (showSoundUnlock && !soundUnlocked) return;
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

  return { handleCanvasPointerDown, handleCanvasCursorHover };
}
