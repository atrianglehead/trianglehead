import { TOTAL_BEATS } from './constants';

export function getPxPerBeat(wrapRef) {
  if (!wrapRef.current) return 40;
  return Math.floor(wrapRef.current.clientWidth / TOTAL_BEATS);
}

export function computeBeatStarts(melody) {
  return melody.reduce((acc, g, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + melody[i - 1].beats);
    return acc;
  }, []);
}

export function initPitchPositions(goal) {
  return goal.map(() => 7);
}

export function initRhythmBlocks(goal) {
  return goal
    .map((g, i) => ({ id: `${i}-${g.beats}`, beats: g.beats }))
    .sort((a, b) => a.beats - b.beats);
}

export function computeSlotBeatStarts(slots) {
  const starts = [];
  let cursor = 0;
  for (const dur of slots) {
    starts.push(cursor);
    cursor += dur;
  }
  return starts;
}

export function getDraggedBlocks(currentBlocks, draggedId, dragBeatPos, direction) {
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

export function sameBlockOrder(a, b) {
  return a.length === b.length && a.every((block, i) => block.id === b[i].id);
}
