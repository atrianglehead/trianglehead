'use client';

import { useEffect, useState } from 'react';
import { colors, fonts, styles } from '../styles';
import LevelSelector from './laya-rising/LevelSelector';
import Hud from './laya-rising/Hud';
import PlayField from './laya-rising/PlayField';
import useLayaRisingGame from './laya-rising/useLayaRisingGame';
import {
  SVARA_X,
  SVARA_SIZE,
  WALL_W,
  FINISH_LINE_W,
} from './laya-rising/constants';

export default function LayaRising() {
  const game = useLayaRisingGame();
  const {
    activeMode,
    crashPending,
    crashed,
    lane,
    lifeFlash,
    running,
    showLevelSelector,
    showObstacles,
    zoneCount,
  } = game;
  const { toggleShowObstacles } = game.hudProps;
  const modeSwitchDisabled = running || crashPending;

  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!showControls) return undefined;
    function onKeyDown(event) {
      event.preventDefault();
      if (event.key === 'Escape') setShowControls(false);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [showControls]);

  const S = {
    section: { border: `2px dashed ${colors.black}`, marginBottom: 0 },
    banner: {
      background: colors.bg,
      padding: '14px 20px',
      borderBottom: `2px solid ${colors.black}`,
    },
    bannerText: {
      ...styles.pageTitle,
    },
    bannerSub: {
      fontSize: 14,
      color: '#333',
      lineHeight: 1.45,
      marginTop: 6,
      fontFamily: fonts.mono,
    },
    inner: { padding: '20px 20px 24px', background: colors.yellow },
    gameShell: {
      position: 'relative',
    },
    levelGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 48px)',
      justifyContent: 'space-between',
      gap: 7,
    },
    levelOverlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 6,
      display: showLevelSelector ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      background: 'rgba(245, 242, 235, 0.86)',
    },
    levelPager: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      maxWidth: 510,
    },
    levelPanel: {
      flex: '1 1 410px',
      maxWidth: 410,
      minHeight: 410,
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `4px 4px 0 ${colors.black}`,
      padding: 14,
      boxSizing: 'border-box',
    },
    levelPickerTitle: {
      border: `2px solid ${colors.black}`,
      background: colors.white,
      padding: '9px 12px',
      fontFamily: fonts.mono,
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.black,
      textAlign: 'center',
      marginBottom: 10,
    },
    levelPanelTitle: {
      fontFamily: fonts.display,
      fontSize: 24,
      letterSpacing: 2,
      color: colors.black,
      lineHeight: 1,
      marginBottom: 8,
      textAlign: 'center',
    },
    levelDifficultyLabel: {
      fontFamily: fonts.mono,
      fontSize: 13,
      fontWeight: 900,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
      color: colors.black,
      textAlign: 'center',
      marginTop: 14,
      marginBottom: 7,
    },
    levelModeRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 7,
    },
    stageArrow: (disabled) => ({
      width: 34,
      height: 52,
      border: `2.5px solid ${colors.black}`,
      background: disabled ? colors.panel : colors.white,
      color: disabled ? colors.dimText : colors.black,
      boxShadow: disabled ? 'none' : `3px 3px 0 ${colors.black}`,
      fontFamily: fonts.display,
      fontSize: 28,
      lineHeight: 1,
      cursor: disabled ? 'default' : 'pointer',
      padding: 0,
      flexShrink: 0,
    }),
    levelTile: (available, active, completed) => ({
      border: `2px solid ${colors.black}`,
      background: active ? colors.red : completed ? colors.yellow : available ? colors.white : colors.panel,
      color: active ? colors.cream : available ? colors.black : colors.dimText,
      width: 48,
      height: 48,
      padding: 0,
      cursor: available ? 'pointer' : 'default',
      textAlign: 'center',
      boxShadow: completed ? `inset 0 0 0 4px #fff, 2px 2px 0 ${colors.black}` : available ? `2px 2px 0 ${colors.black}` : 'none',
      boxShadow: active
        ? `4px 4px 0 ${colors.black}` // Apply hover shadow when active
        : completed ? `inset 0 0 0 4px #fff, 2px 2px 0 ${colors.black}` : available ? `2px 2px 0 ${colors.black}` : 'none',
      transform: active ? 'translate(-2px, -2px)' : 'none', // Apply hover transform when active
      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: available ? 1 : 0.52,
      outline: 'none', // Remove default browser focus ring
    }),
    levelNumber: {
      fontFamily: fonts.display,
      fontSize: 21,
      letterSpacing: 1,
      lineHeight: 1,
    },
    hud: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    statRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    hudGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    statBox: {
      border: `2px solid ${colors.black}`,
      display: 'flex',
      alignItems: 'stretch',
    },
    stat: {
      borderRight: `2px solid ${colors.black}`,
      background: colors.white,
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.black,
      minWidth: 88,
      textAlign: 'center',
    },
    modeButton: (mode, active, disabled) => {
      const darkMode = mode.id === 'gobble' || mode.id === 'devour';
      const shadowColor = darkMode ? colors.cream : colors.black;
      const textColor = darkMode ? colors.cream : colors.black;
      return {
        ...styles.btn,
        background: mode.color,
        color: textColor,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled && !active ? 0.6 : 1,
        borderRadius: 0,
        border: `2px solid ${shadowColor}`,
        outline: active ? `2px solid ${darkMode ? colors.black : colors.cream}` : 'none',
        outlineOffset: 0,
        boxShadow: 'none',
        transform: 'none',
        justifyContent: 'center',
        padding: '10px 9px',
        fontSize: 11,
        textDecorationLine: active ? 'underline' : 'none',
        textUnderlineOffset: 3,
        textDecorationThickness: 2,
        '--sr-mode-bg': mode.color,
        '--sr-mode-text': textColor,
      };
    },
    modeStat: {
      borderRight: `2px solid ${colors.black}`,
      background: activeMode.color,
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: activeMode.id === 'gobble' || activeMode.id === 'devour' ? colors.cream : colors.black,
      minWidth: 88,
      textAlign: 'center',
    },
    lifeStat: {
      borderRight: `2px solid ${colors.black}`,
      background: lifeFlash ? colors.red : colors.white,
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: lifeFlash ? colors.cream : colors.black,
      minWidth: 88,
      textAlign: 'center',
      animation: lifeFlash ? 'pfLifeBlink 0.42s ease' : 'none',
    },
    toggleButton: (active, disabled = false) => ({
      border: `2px solid ${colors.black}`,
      background: active ? colors.white : colors.cream,
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.black,
      minWidth: 120,
      textAlign: 'center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.62 : 1,
      boxShadow: `3px 3px 0 ${colors.black}`,
    }),
    bottomBar: {
      display: 'flex',
      gap: 8,
      marginTop: 8,
      alignItems: 'center',
    },
    controlsOverlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      background: 'rgba(245, 242, 235, 0.88)',
    },
    controlsPanel: {
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `4px 4px 0 ${colors.black}`,
      padding: 16,
      maxHeight: '92%',
      overflowY: 'auto',
      minWidth: 260,
      maxWidth: 360,
    },
    controlsTitle: {
      fontFamily: fonts.display,
      fontSize: 24,
      letterSpacing: 2,
      color: colors.black,
      lineHeight: 1,
      marginBottom: 14,
      textAlign: 'center',
    },
    controlsSection: {
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.black,
      marginBottom: 8,
      borderBottom: `2px solid ${colors.black}`,
      paddingBottom: 4,
    },
    controlsEntry: {
      display: 'flex',
      gap: 10,
      marginBottom: 6,
      alignItems: 'baseline',
    },
    controlsKey: {
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      background: colors.white,
      border: `1.5px solid ${colors.black}`,
      padding: '2px 6px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      minWidth: 110,
      textAlign: 'center',
    },
    controlsLabel: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: colors.black,
      letterSpacing: 0.3,
    },
    playArea: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 12,
      position: 'relative',
    },
    field: {
      height: 340,
      flex: 1,
      minWidth: 0,
      border: `2.5px solid ${colors.black}`,
      background: colors.bg,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `4px 4px 0 ${colors.black}`,
      touchAction: 'none',
    },
    lane: (laneIdx) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${(laneIdx * 100) / zoneCount}%`,
      height: `${100 / zoneCount}%`,
      borderBottom: laneIdx < zoneCount - 1 ? `2px dashed ${colors.divider}` : 'none',
      background: laneIdx === lane ? 'rgba(245, 200, 66, 0.2)' : 'transparent',
    }),
    laneLabel: (laneIdx) => ({
      position: 'absolute',
      left: 8,
      top: `${((laneIdx + 0.5) * 100) / zoneCount}%`,
      transform: 'translateY(-50%)',
      zIndex: 3,
      display: 'none',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.black,
      background: 'rgba(255, 255, 255, 0.78)',
      border: `1.5px solid ${colors.black}`,
      padding: '4px 6px',
      pointerEvents: 'none',
    }),
    svara: {
      position: 'absolute',
      left: SVARA_X - SVARA_SIZE / 2,
      top: `${((lane + 0.5) * 100) / zoneCount}%`,
      width: SVARA_SIZE,
      height: SVARA_SIZE,
      transform: 'translateY(-50%)',
      transition: 'top 0.12s ease-out',
      border: `2.5px solid ${colors.black}`,
      background: colors.red,
      borderRadius: '50% 50% 46% 46%',
      zIndex: 3,
      boxShadow: `3px 3px 0 ${colors.black}`,
    },
    wing: {
      position: 'absolute',
      left: 7,
      top: 14,
      width: 17,
      height: 8,
      border: `2px solid ${colors.black}`,
      borderTop: 'none',
      background: colors.cream,
      transform: running ? 'rotate(-14deg)' : 'rotate(8deg)',
      transition: 'transform 0.15s',
    },
    beak: {
      position: 'absolute',
      right: -9,
      top: 11,
      width: 0,
      height: 0,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: `10px solid ${colors.black}`,
    },
    eye: {
      position: 'absolute',
      right: 8,
      top: 8,
      width: 5,
      height: 5,
      background: colors.black,
      borderRadius: '50%',
    },
    cloud: (obstacle) => ({
      position: 'absolute',
      left: obstacle.x,
      top: 0,
      width: WALL_W,
      height: '100%',
      opacity: obstacle.revealed ? (obstacle.vanish ? 0 : 0.18) : 1,
      transform: obstacle.vanish ? 'scale(1.16)' : 'scale(1)',
      transition: 'opacity 0.22s ease-out, transform 0.22s ease-out',
      zIndex: 2,
    }),
    cloudPuff: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: 18,
      bottom: 18,
      border: `2px solid ${colors.black}`,
      background: colors.white,
      boxShadow: `10px 16px 0 #EDEAE0, -7px 54px 0 #fff, 8px 110px 0 #EDEAE0, -5px 178px 0 #fff, 7px 246px 0 #EDEAE0`,
    },
    revealedWall: (obstacle, laneIdx) => ({
      position: 'absolute',
      left: obstacle.x,
      top: `${(laneIdx * 100) / zoneCount}%`,
      width: WALL_W,
      height: `${100 / zoneCount}%`,
      background: colors.black,
      border: `2px solid ${colors.black}`,
      boxSizing: 'border-box',
      zIndex: 1,
    }),
    finishLine: (finishLine) => ({
      position: 'absolute',
      left: finishLine.x,
      top: 0,
      width: FINISH_LINE_W,
      height: '100%',
      zIndex: 2,
      pointerEvents: 'none',
    }),
    finishHoop: (laneIdx) => ({
      position: 'absolute',
      left: 5,
      top: `${((laneIdx + 0.5) * 100) / zoneCount}%`,
      width: FINISH_LINE_W - 10,
      height: Math.max(28, Math.min(54, 220 / zoneCount)),
      transform: 'translateY(-50%)',
      border: `4px solid ${colors.red}`,
      borderRadius: '50%',
      background: 'rgba(245, 200, 66, 0.2)',
      boxShadow: `inset 0 0 0 3px ${colors.cream}`,
      boxSizing: 'border-box',
    }),
    wallStripe: {
      position: 'absolute',
      inset: 8,
      border: `2px solid ${colors.red}`,
      background: 'repeating-linear-gradient(135deg, #111 0 10px, #222 10px 20px)',
    },
    message: {
      position: 'absolute',
      inset: 0,
      display: running || crashPending ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      background: crashed ? 'rgba(232, 71, 63, 0.78)' : 'rgba(245, 242, 235, 0.82)',
      zIndex: 4,
    },
    messagePanel: {
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `5px 5px 0 ${colors.black}`,
      padding: 16,
      maxWidth: 360,
      textAlign: 'center',
    },
    messageTitle: {
      fontFamily: fonts.display,
      fontSize: 28,
      letterSpacing: 2,
      color: colors.black,
      lineHeight: 1,
      marginBottom: 8,
    },
    messageText: {
      ...styles.bodyText,
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 700,
      margin: '0 0 12px',
      lineHeight: 1.45,
      color: colors.black,
    },
    controls: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      width: 92,
      height: 340,
      flexShrink: 0,
    },
    button: (primary = false, raised = false) => ({
      ...styles.btn,
      background: primary ? colors.red : colors.white,
      color: primary ? colors.cream : colors.black,
      cursor: 'pointer',
      boxShadow: primary || raised ? `3px 3px 0 ${colors.black}` : 'none',
      borderRadius: 0,
    }),
    laneButton: (active) => ({
      ...styles.btn,
      background: active ? colors.red : colors.white,
      color: active ? colors.cream : colors.black,
      cursor: 'pointer',
      width: '100%',
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 0,
      padding: '8px 6px',
      whiteSpace: 'normal',
      transform: active ? 'translate(2px, 2px)' : 'none',
      boxShadow: active ? `1px 1px 0 ${colors.black}` : `3px 3px 0 ${colors.black}`,
    }),
  };

  return (
    <>
      <section style={S.section}>
        <div style={S.banner}>
          <div style={S.bannerText}>Laya Rising</div>
          <div style={S.bannerSub}>
            By recognising the tempo you hear, guide Laya through open windows as she tries to navigate the city skyline.
          </div>
        </div>

        <div style={S.inner}>
          <div style={S.gameShell}>
            <LevelSelector
              S={S}
              {...game.levelSelectorProps}
            />
            {showControls && (
              <div style={S.controlsOverlay} onPointerDown={() => setShowControls(false)}>
                <div style={S.controlsPanel} onPointerDown={(e) => e.stopPropagation()}>
                  <div style={S.controlsTitle}>Controls</div>
                  <div style={S.controlsSection}>Keyboard</div>
                  {[
                    ['Arrow Up / W', 'Move up a lane'],
                    ['Arrow Down / S', 'Move down a lane'],
                    ['1 – 8', 'Jump to lane by number'],
                    ['Space / Enter', 'Start run'],
                    ['Shift + Space', 'Restart'],
                    ['L', 'Open locality picker'],
                    ['Escape', 'Close locality picker'],
                  ].map(([key, label]) => (
                    <div key={key} style={S.controlsEntry}>
                      <span style={S.controlsKey}>{key}</span>
                      <span style={S.controlsLabel}>{label}</span>
                    </div>
                  ))}
                  <div style={{ ...S.controlsSection, marginTop: 14 }}>Tap / Click</div>
                  {[
                    ['Playing field', 'Move to tapped lane'],
                    ['Lane buttons (left)', 'Select lane directly'],
                  ].map(([key, label]) => (
                    <div key={key} style={S.controlsEntry}>
                      <span style={S.controlsKey}>{key}</span>
                      <span style={S.controlsLabel}>{label}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    style={{ ...S.button(false, true), marginTop: 16, width: '100%', justifyContent: 'center' }}
                    onClick={() => setShowControls(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <Hud
              S={S}
              {...game.hudProps}
            />
            <PlayField
              S={S}
              {...game.playFieldProps}
            />
            <div style={S.bottomBar}>
              <button
                type="button"
                style={S.button(false, true)}
                onClick={() => setShowControls(true)}
              >
                Controls
              </button>
              <button
                type="button"
                style={S.toggleButton(showObstacles, modeSwitchDisabled)}
                onClick={toggleShowObstacles}
                disabled={modeSwitchDisabled}
              >
                {showObstacles ? 'Practice Mode' : 'Play Mode'}
              </button>
            </div>
          </div>

        </div>
      </section>
      <style>{`
        .sr-level-tile { outline: none; }

        .sr-level-tile:not(:disabled):hover,
        .sr-level-tile:not(:disabled):focus-visible {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 ${colors.black} !important;
        }

        .sr-level-tile:not(:disabled):active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 ${colors.black} !important;
        }

        .sr-mode-btn:not(:disabled):hover,
        .sr-mode-btn:not(:disabled):focus-visible {
          background: var(--sr-mode-text) !important;
          color: var(--sr-mode-bg) !important;
        }

        @keyframes pfLifeBlink {
          0%, 100% {
            background: #fff;
            color: ${colors.black};
          }
          35%, 70% {
            background: ${colors.red};
            color: ${colors.cream};
          }
        }

        @media (max-width: 620px) {
          .sr-play-area {
            display: block !important;
          }

          .sr-field {
            width: 100% !important;
            height: min(64vh, 520px) !important;
            min-height: 390px !important;
          }

          .sr-controls {
            display: none !important;
          }

          .sr-lane-label {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
