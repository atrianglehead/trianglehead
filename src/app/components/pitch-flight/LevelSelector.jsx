import { GAME_MODES } from './gameModes';
import { LEVELS } from './levels';
import { LEVELS_PER_STAGE, STAGE_COUNT } from './constants';

export default function LevelSelector({
  S,
  selectedStage,
  setSelectedStage,
  selectedLevel,
  setSelectedLevel,
  selectedModeId,
  setSelectedModeId,
  setShowLevelSelector,
  setCrashed,
  setScore,
  scoreRef,
  laneRef,
  setLane,
  livesRef,
  setLives,
  resetObstacles,
}) {
  const stageStartLevel = selectedStage * LEVELS_PER_STAGE + 1;

  return (
    <div style={S.levelOverlay}>
      <div style={S.levelPager}>
        <button
          type="button"
          style={S.stageArrow(selectedStage === 0)}
          disabled={selectedStage === 0}
          aria-label="Previous stage"
          onClick={() => setSelectedStage((current) => Math.max(0, current - 1))}
        >
          {'<'}
        </button>
        <div style={S.levelPanel}>
          <div style={S.levelPanelTitle}>Stage {selectedStage + 1}</div>
          <div style={S.levelModeRow}>
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                style={S.modeButton(mode, selectedModeId === mode.id, false)}
                onClick={() => {
                  setSelectedModeId(mode.id);
                  setLives(mode.lives);
                  livesRef.current = mode.lives;
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div style={S.levelGrid}>
            {Array.from({ length: LEVELS_PER_STAGE }, (_, index) => {
              const levelNumber = stageStartLevel + index;
              const level = LEVELS.find((item) => item.id === levelNumber);
              const available = Boolean(level);
              const active = selectedLevel?.id === levelNumber;

              return (
                <button
                  key={levelNumber}
                  type="button"
                  className="pf-level-tile"
                  style={S.levelTile(available, active)}
                  disabled={!available}
                  aria-label={available ? `Choose level ${levelNumber}` : `Level ${levelNumber} unavailable`}
                  onClick={() => {
                    if (!level) return;
                    setSelectedLevel(level);
                    setShowLevelSelector(false);
                    setCrashed(false);
                    setScore(0);
                    scoreRef.current = 0;
                    laneRef.current = Math.min(1, (level.zoneCount || 2) - 1);
                    setLane(laneRef.current);
                    resetObstacles(level);
                  }}
                >
                  <span style={S.levelNumber}>{levelNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          style={S.stageArrow(selectedStage === STAGE_COUNT - 1)}
          disabled={selectedStage === STAGE_COUNT - 1}
          aria-label="Next stage"
          onClick={() => setSelectedStage((current) => Math.min(STAGE_COUNT - 1, current + 1))}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
}
