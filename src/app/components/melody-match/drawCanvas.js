import { NOTE_COUNT, TOTAL_BEATS, ROW_H, GRAPH_H } from './constants';
import { computeSlotBeatStarts } from './utils';

function cubicEaseOut(rawT) {
  return 1 - Math.pow(1 - rawT, 3);
}

function drawBackground(ctx, W) {
  ctx.fillStyle = '#F5F2EB';
  ctx.fillRect(0, 0, W, GRAPH_H);
  ctx.strokeStyle = '#DDD9CE'; ctx.lineWidth = 1;
  for (let i = 0; i <= NOTE_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * ROW_H); ctx.lineTo(W, i * ROW_H); ctx.stroke();
  }
  for (let b = 0; b <= TOTAL_BEATS; b++) {
    ctx.beginPath(); ctx.moveTo(b * (W / TOTAL_BEATS), 0); ctx.lineTo(b * (W / TOTAL_BEATS), GRAPH_H); ctx.stroke();
  }
}

function drawHints(ctx, GOAL, GOAL_BEAT_STARTS, ppb, hintsOn) {
  if (!hintsOn) return;
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

function drawBlock(ctx, x, y, w, label, colorIdx, { draggingIdx, activeRhythmIdx, matchResult, currentTab }) {
  let blockColor = '#F5C842';
  let textColor = '#111';

  if (
    colorIdx !== undefined
    && (colorIdx === draggingIdx || (currentTab === 'rhythm' && colorIdx === activeRhythmIdx))
  ) {
    blockColor = '#E8473F';
    textColor = '#EEE8D0';
  }
  if (matchResult && colorIdx !== undefined && colorIdx < matchResult.length) {
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
}

function drawPitchBlocks(ctx, { ppb, GOAL, GOAL_BEAT_STARTS, pitchPositions, NOTES, draggingIdx, matchResult }) {
  pitchPositions.forEach((noteIdx, i) => {
    drawBlock(
      ctx,
      GOAL_BEAT_STARTS[i] * ppb,
      noteIdx * ROW_H,
      GOAL[i].beats * ppb,
      NOTES[noteIdx].name,
      i,
      { draggingIdx, activeRhythmIdx: -1, matchResult, currentTab: 'pitch' },
    );
  });
}

function makeRhythmRects(blocks, GOAL, ppb) {
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
}

function drawRhythmBlocks(ctx, { ppb, GOAL, rhythmBlocks, rhythmSlots, draggingIdx, activeRhythmIdx, matchResult, rhythmTransition, rhythmDragPreview, now }) {
  const blockStyle = { draggingIdx, activeRhythmIdx, matchResult, currentTab: 'rhythm' };

  if (rhythmDragPreview) {
    const targetRects = makeRhythmRects(rhythmDragPreview.targetBlocks, GOAL, ppb);
    const transitionFromRects = rhythmTransition ? makeRhythmRects(rhythmTransition.fromBlocks, GOAL, ppb) : null;
    const transitionToRects = rhythmTransition ? makeRhythmRects(rhythmTransition.toBlocks, GOAL, ppb) : null;
    const rawT = rhythmTransition
      ? Math.min(1, (now - rhythmTransition.start) / rhythmTransition.duration)
      : 1;
    const t = cubicEaseOut(rawT);

    rhythmDragPreview.targetBlocks.forEach((block) => {
      const target = targetRects.get(block.id);
      if (block.id === rhythmDragPreview.draggedId) {
        drawBlock(ctx, rhythmDragPreview.dragBeatPos * ppb, target.y, target.w, target.label, target.slotIdx, blockStyle);
        return;
      }
      const from = transitionFromRects?.get(block.id) || target;
      const to = transitionToRects?.get(block.id) || target;
      drawBlock(
        ctx,
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        from.w + (to.w - from.w) * t,
        to.label,
        to.slotIdx,
        blockStyle,
      );
    });
  } else if (rhythmTransition) {
    const rawT = Math.min(1, (now - rhythmTransition.start) / rhythmTransition.duration);
    const t = cubicEaseOut(rawT);
    const fromRects = makeRhythmRects(rhythmTransition.fromBlocks, GOAL, ppb);
    const toRects = makeRhythmRects(rhythmTransition.toBlocks, GOAL, ppb);

    rhythmTransition.toBlocks.forEach((block) => {
      const from = fromRects.get(block.id) || toRects.get(block.id);
      const to = toRects.get(block.id);
      drawBlock(
        ctx,
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        from.w + (to.w - from.w) * t,
        to.label,
        to.slotIdx,
        blockStyle,
      );
    });
  } else {
    const slotStarts = computeSlotBeatStarts(rhythmSlots);
    rhythmBlocks.forEach((block, i) => {
      drawBlock(
        ctx,
        slotStarts[i] * ppb,
        GOAL[i].noteIdx * ROW_H,
        block.beats * ppb,
        String(slotStarts[i] + 1),
        i,
        blockStyle,
      );
    });
  }
}

function drawPlayhead(ctx, playheadX) {
  if (playheadX < 0) return;
  ctx.strokeStyle = '#E8473F'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(playheadX, 0); ctx.lineTo(playheadX, GRAPH_H); ctx.stroke();
  ctx.fillStyle = '#E8473F';
  ctx.beginPath();
  ctx.moveTo(playheadX - 5, 0); ctx.lineTo(playheadX + 5, 0); ctx.lineTo(playheadX, 8);
  ctx.fill();
}

export function drawCanvas(ctx, W, params) {
  const {
    ppb, currentTab, hintsOn, GOAL, GOAL_BEAT_STARTS,
    pitchPositions, rhythmBlocks, rhythmSlots,
    matchResult, playheadX, activeRhythmIdx,
    draggingIdx, rhythmTransition, rhythmDragPreview, now,
    NOTES,
  } = params;

  ctx.clearRect(0, 0, W, GRAPH_H);
  drawBackground(ctx, W);
  drawHints(ctx, GOAL, GOAL_BEAT_STARTS, ppb, hintsOn);

  if (currentTab === 'pitch') {
    drawPitchBlocks(ctx, { ppb, GOAL, GOAL_BEAT_STARTS, pitchPositions, NOTES, draggingIdx, matchResult });
  } else {
    drawRhythmBlocks(ctx, { ppb, GOAL, rhythmBlocks, rhythmSlots, draggingIdx, activeRhythmIdx, matchResult, rhythmTransition, rhythmDragPreview, now });
  }

  drawPlayhead(ctx, playheadX);
}
