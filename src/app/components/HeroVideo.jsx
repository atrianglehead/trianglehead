'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * HeroVideo — Trianglehead hero section with stem control
 *
 * HOW TO INTEGRATE:
 * 1. Copy this file to src/app/components/HeroVideo.jsx
 * 2. In page.js, replace the hero section with: <HeroVideo />
 * 3. When real video is ready:
 *    - Replace the placeholder div with a <video> or Cloudflare Stream embed
 *    - Wire INSTRUMENTS[i].audioNode to Web Audio API gain nodes
 *    - Call syncAudio() on video timeupdate for drift correction
 *
 * PHASE 2 (audio wiring) hooks are marked with TODO comments.
 */

const INSTRUMENTS = [
  { id: 0, name: 'Voice' },
  { id: 1, name: 'Nylon Guitar' },
  { id: 2, name: 'Flute' },
  { id: 3, name: 'Cello' },
];

export default function HeroVideo() {
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [playBtnVisible, setPlayBtnVisible] = useState(true);
  const [mixMode, setMixMode] = useState(false);
  const [muteState, setMuteState] = useState([false, false, false, false]);
  // savedMuteState persists when switching out of mix mode
  const savedMuteRef = useRef([false, false, false, false]);

  const hideTimerRef = useRef(null);
  const videoTimerRef = useRef(null); // TODO: remove when real video used

  // ── PLAY BUTTON VISIBILITY ──────────────────────────────────
  const showPlayBtn = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    setPlayBtnVisible(true);
  }, []);

  const hidePlayBtnAfterDelay = useCallback((ms = 1500) => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setPlayBtnVisible(false), ms);
  }, []);

  const handleVideoHoverEnter = () => showPlayBtn();
  const handleVideoHoverLeave = () => {
    if (playing && !ended) hidePlayBtnAfterDelay(300);
  };
  const handleVideoTouch = () => {
    showPlayBtn();
    if (playing && !ended) hidePlayBtnAfterDelay(2000);
  };

  // ── PLAY / PAUSE ────────────────────────────────────────────
  const handlePlayClick = (e) => {
    e.stopPropagation();

    if (ended) {
      // Restart
      setEnded(false);
      setPlaying(true);
      showPlayBtn();
      hidePlayBtnAfterDelay(1500);
      // TODO: videoRef.current.currentTime = 0; videoRef.current.play();
      videoTimerRef.current = setTimeout(handleVideoEnded, 5000);
      return;
    }

    const nowPlaying = !playing;
    setPlaying(nowPlaying);

    if (nowPlaying) {
      hidePlayBtnAfterDelay(1500);
      // TODO: videoRef.current.play();
      videoTimerRef.current = setTimeout(handleVideoEnded, 5000);
    } else {
      showPlayBtn();
      clearTimeout(videoTimerRef.current);
      // TODO: videoRef.current.pause();
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    setEnded(true);
    showPlayBtn();
    // TODO: remove this function when using real video — use onEnded prop instead
  };

  // ── MIX MODE ────────────────────────────────────────────────
  const handleSetMode = (mode) => {
    const entering = mode === 'your';
    setMixMode(entering);

    if (!entering) {
      // Save current mute state, reset visuals
      savedMuteRef.current = [...muteState];
      setMuteState([false, false, false, false]);
      // TODO: unmute all audio stems
    } else {
      // Restore saved mute state
      const restored = [...savedMuteRef.current];
      setMuteState(restored);
      // TODO: restored.forEach((muted, i) => setAudioMute(i, muted));
    }
  };

  // ── MUTE TOGGLE ─────────────────────────────────────────────
  const handleQuadClick = (e, i) => {
    e.stopPropagation();
    if (!mixMode) return;

    // If click came from the mute button itself — always works
    // If click came from anywhere else on quad — only when play controls visible
    const fromBtn = e.target.classList.contains('mute-btn');
    if (!fromBtn && !playBtnVisible) return;

    const next = [...muteState];
    next[i] = !next[i];
    setMuteState(next);
    savedMuteRef.current[i] = next[i];

    // TODO: setAudioMute(i, next[i]);
  };

  const handleBtnTouch = (e) => {
    // Prevent mute button touch from bubbling to video outer (showing play controls)
    e.stopPropagation();
  };

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div style={{ background: '#E8473F' }}>

      {/* Top text */}
      <div style={{ padding: 'clamp(10px,2vw,18px) clamp(12px,3vw,24px)', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-bebas-neue), sans-serif',
          fontSize: 'clamp(14px,3.5vw,32px)',
          letterSpacing: 3,
          color: '#EEE8D0',
          lineHeight: 1.1,
        }}>
          Hi! I&apos;m Anirudh, aka Trianglehead
        </span>
      </div>

      {/* Video outer */}
      <div
        style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111', cursor: 'pointer' }}
        onMouseEnter={handleVideoHoverEnter}
        onMouseLeave={handleVideoHoverLeave}
        onTouchStart={handleVideoTouch}
      >

        {/* ── VIDEO SOURCE ──
            TODO: Replace this placeholder with real video when ready.
            For Cloudflare Stream:
              <Stream src="YOUR_VIDEO_ID" muted style={{width:'100%',height:'100%'}} ref={videoRef} />
            For HTML5 video:
              <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover'}} playsInline />
        */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: 'clamp(10px,2vw,16px)',
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.1)',
          }}>
            Video placeholder
          </span>
        </div>

        {/* Quad grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
        }}>
          {INSTRUMENTS.map((inst, i) => (
            <div
              key={inst.id}
              onClick={(e) => handleQuadClick(e, i)}
              style={{ position: 'relative', cursor: mixMode ? 'pointer' : 'default' }}
            >
              {/* Dark overlay when muted */}
              {muteState[i] && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.52)',
                  zIndex: 1,
                  pointerEvents: 'none',
                  transition: 'background 0.3s',
                }} />
              )}

              {/* Mute button — always visible in mix mode */}
              {mixMode && (
                <button
                  className="mute-btn"
                  onTouchStart={handleBtnTouch}
                  style={{
                    position: 'absolute',
                    bottom: 'clamp(6px,1.5vw,14px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 22,
                    background: muteState[i] ? '#F5C842' : '#E8473F',
                    border: muteState[i] ? '1.5px solid #111' : '1.5px solid rgba(255,255,255,0.4)',
                    color: muteState[i] ? '#111' : '#fff',
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: 'clamp(7px,1.3vw,11px)',
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    padding: 'clamp(3px,0.5vw,6px) clamp(6px,1vw,14px)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    pointerEvents: 'all',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {muteState[i] ? 'Tap to unmute' : 'Tap to mute'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Grid lines — only in mix mode */}
        {mixMode && (
          <>
            <div style={{
              position: 'absolute', left: 0, right: 0, top: '50%',
              height: 2, background: 'rgba(255,255,255,0.25)',
              pointerEvents: 'none', zIndex: 5,
            }} />
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: '50%',
              width: 2, background: 'rgba(255,255,255,0.25)',
              pointerEvents: 'none', zIndex: 5,
            }} />
          </>
        )}

        {/* Play / pause / replay button */}
        <button
          onClick={handlePlayClick}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 'clamp(40px,8vw,72px)',
            height: 'clamp(40px,8vw,72px)',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,255,255,0.8)',
            color: '#fff',
            fontSize: 'clamp(14px,3vw,26px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 20,
            cursor: 'pointer',
            opacity: playBtnVisible ? 1 : 0,
            pointerEvents: playBtnVisible ? 'all' : 'none',
            transition: 'opacity 0.4s, background 0.2s',
          }}
        >
          {ended ? '↺' : playing ? '❚❚' : '▶'}
        </button>

      </div>

      {/* Bottom text + pills */}
      <div style={{
        padding: 'clamp(10px,2vw,18px) clamp(12px,3vw,24px)',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <span style={{
          fontFamily: 'var(--font-bebas-neue), sans-serif',
          fontSize: 'clamp(14px,3.5vw,32px)',
          letterSpacing: 3,
          color: '#EEE8D0',
          lineHeight: 1.1,
        }}>
          And I&apos;m obsessed with
        </span>

        <div style={{ display: 'flex', gap: 'clamp(6px,1.5vw,12px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { mode: 'my',   label: 'musical fluency' },
            { mode: 'your', label: 'your musical fluency' },
          ].map(({ mode, label }) => {
            const active = mode === 'my' ? !mixMode : mixMode;
            return (
              <button
                key={mode}
                onClick={() => handleSetMode(mode)}
                style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: 'clamp(9px,1.8vw,16px)',
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  padding: 'clamp(5px,0.8vw,10px) clamp(10px,1.8vw,20px)',
                  border: active ? '2.5px solid #111' : '2.5px solid rgba(238,232,208,0.35)',
                  background: active ? '#F5C842' : 'transparent',
                  color: active ? '#111' : 'rgba(238,232,208,0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
