'use client';

import { NOTES } from './melody-match/melodyData';
import { TOTAL_BEATS } from './melody-match/constants';
import { S } from './melody-match/styles';
import HelpOverlay from './melody-match/HelpOverlay';
import useMelodyMatchGame from './melody-match/useMelodyMatchGame';

export default function MelodyMatch() {
  const game = useMelodyMatchGame();
  const {
    canvasRef, wrapRef,
    currentTab, hintsOn, setHintsOn,
    helpOpen, setHelpOpen, helpTab, setHelpTab,
    showSoundUnlock, soundUnlocked,
    goalPlaying, minePlaying,
    matchResult, status, hasUndo,
    toggleGoal, toggleMine, checkMatch, clearUser,
    switchTab, undoLast, nextMelody, enableSound,
    handleCanvasPointerDown, handleCanvasCursorHover,
  } = game;

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
          <div style={S.hintsToggle} onClick={() => setHintsOn(h => !h)}>
            <div style={S.hintsLabel}>Hints</div>
            <div style={S.toggleTrack(hintsOn)}>
              <div style={S.toggleThumb(hintsOn)} />
            </div>
          </div>
          <div style={S.tabs}>
            <button style={S.tab(currentTab === 'pitch')} onClick={() => switchTab('pitch')}>Pitch</button>
            <button style={S.tabLast(currentTab === 'rhythm')} onClick={() => switchTab('rhythm')}>Rhythm</button>
          </div>
          <button
            type="button"
            style={S.helpButton(helpOpen)}
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
            <>Drag the blocks <strong style={S.directionWord}>up/down</strong> to match the goal pitch.</>
          ) : (
            <>Drag the blocks <strong style={S.directionWord}>left/right</strong> to match the goal rhythm.</>
          )}
        </div>

        {/* Graph */}
        <div style={S.graphOuter}>
          {showSoundUnlock && !soundUnlocked && (
            <div style={S.soundUnlockOverlay}>
              <button type="button" style={S.soundUnlockBtn} onClick={enableSound}>
                Begin Exploration
              </button>
            </div>
          )}
          {helpOpen && (
            <HelpOverlay
              helpTab={helpTab}
              setHelpTab={setHelpTab}
              onClose={() => setHelpOpen(false)}
            />
          )}
          <div style={S.graphInner}>
            {/* Y Axis */}
            <div style={S.yAxis}>
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
          {/* X Axis */}
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
          <button style={S.checkBtn(Boolean(matchResult))} onClick={checkMatch}>
            {matchResult ? 'Uncheck' : '✓ Check'}
          </button>
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
    </section>
  );
}
