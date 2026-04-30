import { GAME_MODES } from './gameModes';
import { LEVELS } from './levels';
import { LEVELS_PER_STAGE, STAGE_COUNT } from './constants';

export default function LevelSelector({
  S,
  selectedStage,
  setSelectedStage,
  selectedLevel,
  selectedModeId,
  setSelectedModeId,
  livesRef,
  setLives,
  chooseLevel,
  closeLevelSelector,
  completedLevels,
}) {
  const stageStartLevel = selectedStage * LEVELS_PER_STAGE + 1;

  return (
    <div style={S.levelOverlay} onPointerDown={closeLevelSelector}>
      <div style={S.levelPager} onPointerDown={(event) => event.stopPropagation()}>
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
          <div style={S.levelPickerTitle}>Pick a level</div>
          <div style={S.levelPanelTitle}>Stage {selectedStage + 1}</div>
          <div style={S.levelGrid}>
            {Array.from({ length: LEVELS_PER_STAGE }, (_, index) => {
              const levelNumber = stageStartLevel + index;
              const level = LEVELS.find((item) => item.id === levelNumber);
              const available = Boolean(level);
              const active = selectedLevel?.id === levelNumber;
              const completed = Boolean(completedLevels[levelNumber]);

              return (
                <button
                  key={levelNumber}
                  type="button"
                  className="sr-level-tile"
                  style={S.levelTile(available, active, completed)}
                  disabled={!available}
                  aria-label={available ? `Choose level ${levelNumber}` : `Level ${levelNumber} unavailable`}
                  onClick={() => {
                    if (!level) return;
                    chooseLevel(level);
                  }}
                >
                  <span style={S.levelNumber}>{levelNumber}</span>
                </button>
              );
            })}
          </div>
          <div style={S.levelDifficultyLabel}>Difficulty</div>
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
