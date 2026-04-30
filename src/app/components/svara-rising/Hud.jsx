export default function Hud({
  S,
  activeLevel,
  activeMode,
  score,
  lives,
  targetScore,
  showObstacles,
  toggleShowObstacles,
  modeSwitchDisabled,
  openLevelSelector,
  startRun,
  running,
  crashed,
  levelComplete,
}) {
  return (
    <div style={S.hud}>
      <div style={S.statRow}>
        <div style={S.lifeStat}>Lives {lives}</div>
        <div style={S.stat}>Score {score}/{targetScore}</div>
        <div style={S.hudSeparator} />
        <div style={S.modeStat}>{activeMode.label}</div>
        <div style={S.stat}>{activeLevel.title}</div>
        <button type="button" style={S.button(true)} onClick={() => startRun()}>
          {running ? 'Restart' : crashed || levelComplete ? 'Try Again' : 'Start'}
        </button>
        <button
          type="button"
          style={S.toggleButton(showObstacles, modeSwitchDisabled)}
          onClick={toggleShowObstacles}
          disabled={modeSwitchDisabled}
        >
          {showObstacles ? 'Practice Mode' : 'Play Mode'}
        </button>
        <button type="button" style={S.button(false, true)} onClick={openLevelSelector}>
          Levels &gt;
        </button>
      </div>
    </div>
  );
}
