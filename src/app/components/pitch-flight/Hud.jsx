export default function Hud({
  S,
  activeLevel,
  activeMode,
  score,
  lives,
  best,
  openLevelSelector,
  startRun,
  running,
  crashed,
}) {
  return (
    <div style={S.hud}>
      <div style={S.statRow}>
        <div style={S.stat}>{activeLevel.title}</div>
        <div style={S.modeStat}>{activeMode.label}</div>
        <div style={S.stat}>Score {score}</div>
        <div style={S.lifeStat}>Lives {lives}</div>
        <div style={S.stat}>Best {best}</div>
      </div>
      <div style={S.statRow}>
        <button type="button" style={S.button(false)} onClick={openLevelSelector}>
          Levels
        </button>
        <button type="button" style={S.button(true)} onClick={() => startRun()}>
          {running ? 'Restart' : crashed ? 'Try Again' : 'Start'}
        </button>
      </div>
    </div>
  );
}
