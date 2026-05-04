'use client';

import { useRef, useEffect } from 'react';

const COLS = 10;
const ROWS = 4;
const CELL = 100;
const W = COLS * CELL;
const H = ROWS * CELL;
const NO_PLAY_COLS = 3;
const NO_PLAY_W = NO_PLAY_COLS * CELL;
const LOOP_MS = 2000;
const DAMPING = 0.87;
const MAX_VEL = 20;
const BOUNCE = 0.65;

// Header label widths as CSS percentages
const STAGE_PCT = `${(NO_PLAY_COLS / COLS) * 100}%`;
const PLAY_PCT   = `${((COLS - NO_PLAY_COLS) / COLS) * 100}%`;

function synthPitch(actx, frequency) {
  const now = actx.currentTime;
  const osc = actx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = frequency;
  const osc2 = actx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = frequency * 2;
  const osc2g = actx.createGain();
  osc2g.gain.value = 0.12;
  const env = actx.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.55, now + 0.01);
  env.gain.exponentialRampToValueAtTime(0.18, now + 0.5);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  osc2.connect(osc2g);
  osc.connect(env);
  osc2g.connect(env);
  env.connect(actx.destination);
  osc.start(now); osc2.start(now);
  osc.stop(now + 2); osc2.stop(now + 2);
}

export default function PitchGrid({ tFrequency = 220, uFrequency = 275 }) {
  const canvasRef = useRef(null);

  const s = useRef({
    playing: false,
    blocks: [
      { id: 'T0', label: 'T', freq: tFrequency, x: 0,         y: 0,        vx: 0, vy: 0 },
      { id: 'T1', label: 'T', freq: tFrequency, x: 2 * CELL,  y: CELL,     vx: 0, vy: 0 },
      { id: 'T2', label: 'T', freq: tFrequency, x: CELL,      y: 3 * CELL, vx: 0, vy: 0 },
      { id: 'U0', label: 'U', freq: uFrequency, x: CELL,      y: 0,        vx: 0, vy: 0 },
      { id: 'U1', label: 'U', freq: uFrequency, x: 0,         y: 2 * CELL, vx: 0, vy: 0 },
      { id: 'U2', label: 'U', freq: uFrequency, x: 2 * CELL,  y: 2 * CELL, vx: 0, vy: 0 },
    ],
    drag: null,
    playheadX: -1,
    loopStart: null,
    triggered: new Set(), // cleared on each loop; un-triggered only when block is at rest and ahead of playhead
    actx: null,
    raf: null,
  });

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { blocks, playheadX, playing } = s.current;

    // Backgrounds
    ctx.fillStyle = '#E8E3D8';
    ctx.fillRect(0, 0, NO_PLAY_W, H);
    ctx.fillStyle = '#F5F2EB';
    ctx.fillRect(NO_PLAY_W, 0, W - NO_PLAY_W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      if (c === NO_PLAY_COLS) continue;
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
    }

    // Zone divider
    ctx.save();
    ctx.strokeStyle = '#A8A399';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(NO_PLAY_W, 0); ctx.lineTo(NO_PLAY_W, H); ctx.stroke();
    ctx.restore();

    // Playhead column glow
    if (playheadX >= 0) {
      ctx.fillStyle = 'rgba(232,71,63,0.12)';
      ctx.fillRect(Math.floor(playheadX), 0, CELL, H);
    }

    // Block shadows
    blocks.forEach(block => {
      ctx.fillStyle = '#111';
      ctx.fillRect(block.x + 5, block.y + 5, CELL, CELL);
    });

    // Block faces
    blocks.forEach(block => {
      const active = block.x >= NO_PLAY_W;
      const lit = active && playheadX >= block.x && playheadX < block.x + CELL;
      ctx.fillStyle = lit ? '#E8473F' : (active ? '#F5C842' : '#C8C39A');
      ctx.fillRect(block.x, block.y, CELL, CELL);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(block.x + 1.25, block.y + 1.25, CELL - 2.5, CELL - 2.5);
      ctx.fillStyle = lit ? '#F5F2EB' : '#111';
      ctx.font = 'bold 52px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.label, block.x + CELL / 2, block.y + CELL / 2);
    });

    // Playhead line
    if (playheadX >= 0) {
      ctx.fillStyle = '#E8473F';
      ctx.fillRect(Math.round(playheadX), 0, 2, H);
    }

    // Hint text when no blocks are in the play area
    if (!blocks.some(b => b.x >= NO_PLAY_W)) {
      ctx.fillStyle = '#C0BBB0';
      ctx.font = '48px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const hx = (NO_PLAY_W + W) / 2;
      ctx.fillText('Drag a block here', hx, H / 2 - 30);
      ctx.fillText('to make a sound.', hx, H / 2 + 30);
    }
  }

  function resolveCollisions(blocks, dragIdx) {
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i];
        const b = blocks[j];
        const aDrag = dragIdx === i;
        const bDrag = dragIdx === j;
        const ox = CELL - Math.abs(b.x - a.x);
        const oy = CELL - Math.abs(b.y - a.y);
        if (ox <= 0 || oy <= 0) continue;
        const sx = b.x >= a.x ? 1 : -1;
        const sy = b.y >= a.y ? 1 : -1;
        if (ox <= oy) {
          if (!aDrag && !bDrag) {
            a.x -= sx * ox / 2; b.x += sx * ox / 2;
            const t = a.vx; a.vx = b.vx * BOUNCE; b.vx = t * BOUNCE;
          } else if (aDrag) {
            b.x += sx * ox; b.vx = sx * 5;
          } else {
            a.x -= sx * ox; a.vx = -sx * 5;
          }
        } else {
          if (!aDrag && !bDrag) {
            a.y -= sy * oy / 2; b.y += sy * oy / 2;
            const t = a.vy; a.vy = b.vy * BOUNCE; b.vy = t * BOUNCE;
          } else if (aDrag) {
            b.y += sy * oy; b.vy = sy * 5;
          } else {
            a.y -= sy * oy; a.vy = -sy * 5;
          }
        }
        if (!aDrag) { a.x = Math.max(0, Math.min(W - CELL, a.x)); a.y = Math.max(0, Math.min(H - CELL, a.y)); }
        if (!bDrag) { b.x = Math.max(0, Math.min(W - CELL, b.x)); b.y = Math.max(0, Math.min(H - CELL, b.y)); }
      }
    }
  }

  function tick(ts) {
    const state = s.current;
    state.raf = null;
    const dragIdx = state.drag?.blockIdx ?? -1;

    // Physics
    state.blocks.forEach((block, idx) => {
      if (idx === dragIdx) return;
      if (Math.abs(block.vx) < 0.05 && Math.abs(block.vy) < 0.05) { block.vx = block.vy = 0; return; }
      block.x += block.vx;
      block.y += block.vy;
      if (block.x < 0)             { block.x = 0;        block.vx =  Math.abs(block.vx) * BOUNCE; }
      else if (block.x > W - CELL) { block.x = W - CELL; block.vx = -Math.abs(block.vx) * BOUNCE; }
      if (block.y < 0)             { block.y = 0;        block.vy =  Math.abs(block.vy) * BOUNCE; }
      else if (block.y > H - CELL) { block.y = H - CELL; block.vy = -Math.abs(block.vy) * BOUNCE; }
      block.vx *= DAMPING;
      block.vy *= DAMPING;
    });

    resolveCollisions(state.blocks, dragIdx);

    // Auto-play: driven by block positions
    const anyActive = state.blocks.some(b => b.x >= NO_PLAY_W);
    if (anyActive && !state.playing) {
      if (!state.actx) state.actx = new AudioContext();
      state.playing = true;
      state.loopStart = null;
      state.triggered.clear();
    } else if (!anyActive && state.playing) {
      state.playing = false;
      state.playheadX = -1;
      state.loopStart = null;
      state.triggered.clear();
    }

    if (state.playing) {
      if (state.loopStart === null) state.loopStart = ts;
      const elapsed = ts - state.loopStart;
      const prevX = state.playheadX;
      const newX = NO_PLAY_W + (elapsed % LOOP_MS) / LOOP_MS * (W - NO_PLAY_W);

      if (newX < prevX - 10) state.triggered.clear();
      state.playheadX = newX;

      // Un-trigger: only when block is at rest AND has moved ahead of the playhead
      state.blocks.forEach((block, idx) => {
        if (!state.triggered.has(block.id)) return;
        const inMotion = idx === dragIdx || Math.abs(block.vx) > 0.1 || Math.abs(block.vy) > 0.1;
        if (!inMotion && block.x > newX) {
          state.triggered.delete(block.id);
        }
      });

      // Trigger
      state.blocks.forEach(block => {
        if (
          !state.triggered.has(block.id) &&
          block.x >= NO_PLAY_W &&
          newX >= block.x && newX < block.x + CELL
        ) {
          state.triggered.add(block.id);
          if (state.actx) synthPitch(state.actx, block.freq);
        }
      });
    }

    draw();

    const hasPhysics = state.blocks.some(b => Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05);
    if (state.playing || state.drag || hasPhysics) {
      state.raf = requestAnimationFrame(tick);
    }
  }

  function ensureLoop() {
    const state = s.current;
    if (!state.raf) state.raf = requestAnimationFrame(tick);
  }

  function canvasXY(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top)  * (H / rect.height),
    };
  }

  function hitBlock(x, y) {
    const blocks = s.current.blocks;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      if (x >= b.x && x < b.x + CELL && y >= b.y && y < b.y + CELL) return i;
    }
    return -1;
  }

  function onPointerDown(e) {
    const { x, y } = canvasXY(e);
    const idx = hitBlock(x, y);
    if (idx < 0) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    const state = s.current;
    const block = state.blocks[idx];
    block.vx = 0; block.vy = 0;
    state.drag = { blockIdx: idx, ox: x - block.x, oy: y - block.y, hist: [{ x, y, t: performance.now() }] };
    canvasRef.current.style.cursor = 'grabbing';
    ensureLoop();
  }

  function onPointerMove(e) {
    const state = s.current;
    const { x, y } = canvasXY(e);
    if (!state.drag) {
      canvasRef.current.style.cursor = hitBlock(x, y) >= 0 ? 'grab' : 'default';
      return;
    }
    e.preventDefault();
    const block = state.blocks[state.drag.blockIdx];
    block.x = Math.max(0, Math.min(W - CELL, x - state.drag.ox));
    block.y = Math.max(0, Math.min(H - CELL, y - state.drag.oy));
    const now = performance.now();
    state.drag.hist.push({ x, y, t: now });
    while (state.drag.hist.length > 1 && now - state.drag.hist[0].t > 100) state.drag.hist.shift();
  }

  function onPointerUp(e) {
    const state = s.current;
    if (!state.drag) return;
    const { hist, blockIdx } = state.drag;
    const block = state.blocks[blockIdx];
    if (hist.length >= 2) {
      const first = hist[0];
      const last = hist[hist.length - 1];
      const dt = last.t - first.t;
      if (dt > 5) {
        block.vx = ((last.x - first.x) / dt) * 16.67;
        block.vy = ((last.y - first.y) / dt) * 16.67;
        const spd = Math.hypot(block.vx, block.vy);
        if (spd > MAX_VEL) { block.vx = block.vx / spd * MAX_VEL; block.vy = block.vy / spd * MAX_VEL; }
      }
    }
    state.drag = null;
    canvasRef.current.style.cursor = 'default';
    ensureLoop();
  }

  useEffect(() => {
    draw();
    return () => {
      const state = s.current;
      cancelAnimationFrame(state.raf);
      state.actx?.close();
    };
  }, []);

  const labelStyle = {
    fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
    fontSize: 22,
    letterSpacing: 2,
    lineHeight: 1,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={{ margin: '2em 0', border: '2.5px solid #111', boxShadow: '4px 4px 0 #111' }}>
      {/* Zone label header */}
      <div style={{ display: 'flex', borderBottom: '2px solid #111' }}>
        <div style={{ ...labelStyle, width: STAGE_PCT, background: '#E8E3D8', color: '#A8A399', borderRight: '2px dashed #A8A399', boxSizing: 'border-box' }}>
          Silent Area
        </div>
        <div style={{ ...labelStyle, width: PLAY_PCT, background: '#F5F2EB', color: '#111', boxSizing: 'border-box' }}>
          Play Area
        </div>
      </div>

      {/* Grid */}
      <div style={{ lineHeight: 0, touchAction: 'none', userSelect: 'none' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', width: '100%' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
    </div>
  );
}
