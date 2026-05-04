export default function Hud({
  S,
  activeLevel,
  activeMode,
  score,
  lives,
  targetScore,
  openLevelSelector,
  startRun,
  running,
  crashed,
  levelComplete,
}) {
  return (
    <div style={S.hud}>
      <div style={S.statRow}>
        <div style={S.statBox}>
          <div className="sr-stat-item" style={S.lifeStat}>Lives {lives}</div>
          <div className="sr-stat-item" style={S.stat}>Progress {score}/{targetScore}</div>
          <div className="sr-stat-item" style={S.modeStat}>{activeMode.label}</div>
          <div className="sr-stat-item" style={{ ...S.stat, borderRight: 'none' }}>{activeLevel.title}</div>
        </div>
        <div style={S.hudGroup}>
          <button type="button" style={S.button(true)} onClick={() => startRun()}>
            {running ? 'Restart' : crashed || levelComplete ? 'Try Again' : 'Start'}
          </button>
          <button type="button" style={S.button(false, true)} onClick={openLevelSelector}>
            Localities &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
