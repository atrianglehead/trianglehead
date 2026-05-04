'use client';

import { useState, useRef } from 'react';

function fmt(s) {
  if (!s || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PostAudio({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    setCurrentTime(audio.currentTime);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
  }

  function onEnded() {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#F5C842',
      border: '2px solid #111',
      boxShadow: '3px 3px 0 #111',
      padding: '10px 14px',
      margin: '1.8em 0',
    }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={onEnded}
      />

      {/* Play / pause */}
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{
          width: 34, height: 34,
          background: '#111',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {playing ? (
          <span style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 3, height: 12, background: '#F5C842', display: 'block' }} />
            <span style={{ width: 3, height: 12, background: '#F5C842', display: 'block' }} />
          </span>
        ) : (
          <span style={{
            width: 0, height: 0,
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderLeft: '12px solid #F5C842',
            marginLeft: 3,
            display: 'block',
          }} />
        )}
      </button>

      {/* Progress bar */}
      <div
        onClick={seek}
        style={{
          flex: 1,
          height: 4,
          background: 'rgba(0,0,0,0.2)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#111',
        }} />
      </div>

      {/* Time */}
      <span style={{
        fontFamily: 'var(--font-space-mono), monospace',
        fontSize: 9,
        fontWeight: 700,
        color: '#111',
        letterSpacing: 1,
        flexShrink: 0,
      }}>
        {fmt(currentTime)} / {fmt(duration)}
      </span>
    </div>
  );
}
