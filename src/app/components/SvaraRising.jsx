'use client';

import { colors, fonts, styles } from '../styles';
import LevelSelector from './svara-rising/LevelSelector';
import Hud from './svara-rising/Hud';
import PlayField from './svara-rising/PlayField';
import useSvaraRisingGame from './svara-rising/useSvaraRisingGame';
import {
  SVARA_X,
  SVARA_SIZE,
  WALL_W,
} from './svara-rising/constants';

export default function SvaraRising() {
  const game = useSvaraRisingGame();
  const {
    activeMode,
    crashPending,
    crashed,
    lane,
    lifeFlash,
    running,
    showLevelSelector,
    zoneCount,
  } = game;

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
      justifyContent: 'center',
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
    },
    levelPanel: {
      width: 'min(400px, 100%)',
      minHeight: 366,
      border: `2.5px solid ${colors.black}`,
      background: colors.yellow,
      boxShadow: `4px 4px 0 ${colors.black}`,
      padding: 14,
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
    levelModeRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 7,
      marginBottom: 10,
    },
    stageArrow: (disabled) => ({
      width: 34,
      height: 52,
      border: `2.5px solid ${colors.black}`,
      background: disabled ? '#EDEAE0' : '#fff',
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
      background: active ? colors.red : completed ? colors.yellow : available ? '#fff' : '#EDEAE0',
      color: active ? colors.cream : available ? colors.black : colors.dimText,
      width: 48,
      height: 48,
      padding: 0,
      cursor: available ? 'pointer' : 'default',
      textAlign: 'center',
      boxShadow: completed ? `inset 0 0 0 4px #fff, 2px 2px 0 ${colors.black}` : available ? `2px 2px 0 ${colors.black}` : 'none',
      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: available ? 1 : 0.52,
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
    stat: {
      border: `2px solid ${colors.black}`,
      background: '#fff',
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
    modeButton: (mode, active, disabled) => ({
      ...styles.btn,
      background: mode.color,
      color: mode.id === 'gobble' || mode.id === 'devour' ? colors.cream : colors.black,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled && !active ? 0.6 : 1,
      borderRadius: 0,
      border: active ? `3px solid ${colors.black}` : `2px solid ${colors.black}`,
      outline: active ? `2px solid ${colors.cream}` : 'none',
      outlineOffset: -5,
      boxShadow: 'none',
      justifyContent: 'center',
      padding: active ? '7px 6px' : '8px 7px',
      fontSize: 9,
    }),
    modeStat: {
      border: `2px solid ${colors.black}`,
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
      border: `2px solid ${colors.black}`,
      background: lifeFlash ? colors.red : '#fff',
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
    hudSeparator: {
      width: 2,
      alignSelf: 'stretch',
      minHeight: 28,
      background: colors.black,
      opacity: 0.6,
      margin: '0 3px',
    },
    toggleButton: (active, disabled = false) => ({
      border: `2px solid ${colors.black}`,
      background: active ? '#fff' : colors.cream,
      padding: '8px 11px',
      fontFamily: fonts.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.black,
      minWidth: 142,
      textAlign: 'center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.62 : 1,
      boxShadow: `3px 3px 0 ${colors.black}`,
    }),
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
      background: '#fff',
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
      background: primary ? colors.red : '#fff',
      color: primary ? colors.cream : colors.black,
      cursor: 'pointer',
      boxShadow: primary || raised ? `3px 3px 0 ${colors.black}` : 'none',
      borderRadius: 0,
    }),
    laneButton: (active) => ({
      ...styles.btn,
      background: active ? colors.red : '#fff',
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
    }),
  };

  return (
    <>
      <section style={S.section}>
        <div style={S.banner}>
          <div style={S.bannerText}>Svara Rising</div>
          <div style={S.bannerSub}>
            By recognising the pitches you hear, guide Svara through open windows as she tries to navigate the city skyline.
          </div>
        </div>

        <div style={S.inner}>
          <div style={S.gameShell}>
            <LevelSelector
              S={S}
              {...game.levelSelectorProps}
            />
            <Hud
              S={S}
              {...game.hudProps}
            />
            <PlayField
              S={S}
              {...game.playFieldProps}
            />
        </div>

        </div>
      </section>
      <style>{`
        .sr-level-tile:not(:disabled):hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 ${colors.black} !important;
        }

        .sr-level-tile:not(:disabled):active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 ${colors.black} !important;
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
