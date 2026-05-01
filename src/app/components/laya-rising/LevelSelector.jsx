import { useEffect, useRef } from 'react';

import { GAME_MODES } from './gameModes';
import { LEVELS } from './levels';
import { LEVELS_PER_STAGE, STAGE_COUNT } from './constants';

const LEVEL_GRID_COLUMNS = 5;

function moveSelectorFocus(panel, direction) {
  const items = Array.from(panel.querySelectorAll('[data-selector-item]:not(:disabled)'));

  // If focus has left the panel, restore it to the first level tile
  if (!panel.contains(document.activeElement) || !document.activeElement.matches('[data-selector-item]')) {
    const firstLevel = items.find((item) => item.dataset.selectorKind === 'level');
    (firstLevel || items[0])?.focus();
    return;
  }

  const active = document.activeElement;
  const row = Number(active.dataset.selectorRow);
  const col = Number(active.dataset.selectorCol);
  const kind = active.dataset.selectorKind;
  let target = null;

  const byRowCol = {};
  items.forEach((item) => {
    const r = Number(item.dataset.selectorRow);
    const c = Number(item.dataset.selectorCol);
    if (!byRowCol[r]) byRowCol[r] = {};
    byRowCol[r][c] = item;
  });

  if (direction === 'left' || direction === 'right') {
    const colStep = direction === 'left' ? -1 : 1;

    // At the grid edge for level tiles, cross over to the stage arrow
    if (kind === 'level' && direction === 'left' && col === 0) {
      panel.querySelector('[data-selector-kind="stage-prev"]:not(:disabled)')?.focus();
      return;
    }
    if (kind === 'level' && direction === 'right' && col === LEVEL_GRID_COLUMNS - 1) {
      panel.querySelector('[data-selector-kind="stage-next"]:not(:disabled)')?.focus();
      return;
    }

    // Scan in the chosen direction, skipping absent/disabled positions
    let c = col + colStep;
    while (c >= 0 && c < LEVEL_GRID_COLUMNS) {
      if (byRowCol[row]?.[c]) { target = byRowCol[row][c]; break; }
      c += colStep;
    }

    // If nothing found within the grid, fall through to the stage arrow
    if (!target && kind === 'level') {
      const arrowKind = direction === 'left' ? 'stage-prev' : 'stage-next';
      target = panel.querySelector(`[data-selector-kind="${arrowKind}"]:not(:disabled)`);
    }
  } else {
    // Up/down: walk rows in the chosen direction, pick closest col in each.
    // Stage arrows are excluded — they're only reachable via left/right.
    const navItems = items.filter(
      (item) => item.dataset.selectorKind !== 'stage-prev' && item.dataset.selectorKind !== 'stage-next',
    );
    const navByRowCol = {};
    navItems.forEach((item) => {
      const r = Number(item.dataset.selectorRow);
      const c = Number(item.dataset.selectorCol);
      if (!navByRowCol[r]) navByRowCol[r] = {};
      navByRowCol[r][c] = item;
    });

    const rowStep = direction === 'up' ? -1 : 1;
    const allRows = [...new Set(navItems.map((item) => Number(item.dataset.selectorRow)))].sort((a, b) => a - b);
    const candidateRows = rowStep > 0
      ? allRows.filter((r) => r > row)
      : allRows.filter((r) => r < row).reverse();

    for (const targetRow of candidateRows) {
      const rowItems = Object.values(navByRowCol[targetRow] || {});
      if (!rowItems.length) continue;
      rowItems.sort((a, b) =>
        Math.abs(Number(a.dataset.selectorCol) - col) - Math.abs(Number(b.dataset.selectorCol) - col),
      );
      target = rowItems[0];
      break;
    }
  }

  target?.focus();
}

export default function LevelSelector({
  S,
  showLevelSelector,
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
  const panelRef = useRef(null);

  useEffect(() => {
    if (!showLevelSelector) return undefined;

    const panel = panelRef.current;
    if (!panel) return undefined;

    const selectedTile = panel.querySelector(`[data-level-id="${selectedLevel?.id}"]:not(:disabled)`);
    const firstTile = panel.querySelector('[data-selector-kind="level"]:not(:disabled)');
    requestAnimationFrame(() => {
      (selectedTile || firstTile)?.focus();
    });

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLevelSelector();
        return;
      }

      const directions = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      const direction = directions[event.key];
      if (!direction) return;

      event.preventDefault();
      moveSelectorFocus(panel, direction);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeLevelSelector, selectedLevel?.id, selectedStage, showLevelSelector]);

  return (
    <div style={S.levelOverlay} onPointerDown={closeLevelSelector}>
      <div ref={panelRef} style={S.levelPager} onPointerDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          data-selector-item
          data-selector-kind="stage-prev"
          data-selector-row={2}
          data-selector-col={-1}
          style={S.stageArrow(selectedStage === 0)}
          disabled={selectedStage === 0}
          aria-label="Previous stage"
          onClick={() => setSelectedStage((current) => Math.max(0, current - 1))}
        >
          {'<'}
        </button>
        <div style={S.levelPanel}>
          <div style={S.levelPickerTitle}>Pick a locality</div>
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
                  data-selector-item
                  data-selector-kind="level"
                  data-selector-row={Math.floor(index / LEVEL_GRID_COLUMNS)}
                  data-selector-col={index % LEVEL_GRID_COLUMNS}
                  data-level-id={levelNumber}
                  className="sr-level-tile"
                  style={S.levelTile(available, active, completed)}
                  disabled={!available}
                  aria-label={available ? `Choose locality ${levelNumber}` : `Locality ${levelNumber} unavailable`}
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
            {GAME_MODES.map((mode, index) => (
              <button
                key={mode.id}
                type="button"
                data-selector-item
                data-selector-kind="mode"
                data-selector-row={LEVELS_PER_STAGE / LEVEL_GRID_COLUMNS}
                data-selector-col={index}
                className="sr-mode-btn"
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
          data-selector-item
          data-selector-kind="stage-next"
          data-selector-row={2}
          data-selector-col={LEVEL_GRID_COLUMNS}
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
