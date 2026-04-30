import { renderPitchLabel } from './notes';

export default function PlayField({
  S,
  fieldRef,
  moveToTappedLane,
  laneNames,
  laneLabels,
  obstacles,
  finishLine,
  lane,
  laneLabel,
  activeLevel,
  running,
  crashPending,
  crashed,
  levelComplete,
  showObstacles,
  showObstaclesUsed,
  score,
  targetScore,
  startRun,
  goToNextLevel,
  nextLevel,
  moveToLane,
}) {
  const completionTitle = showObstaclesUsed ? 'Good job!' : 'Fantastic job!';
  const completionText = showObstaclesUsed
    ? 'To mark the locality as completed, try again in Play Mode.'
    : 'You helped Svara reach the next locality.';

  return (
    <div className="sr-play-area" style={S.playArea}>
      <div className="sr-controls" style={S.controls}>
        {laneNames.map((name, laneIdx) => (
          <button
            key={name}
            type="button"
            style={S.laneButton(lane === laneIdx)}
            onClick={() => moveToLane(laneIdx)}
          >
            {renderPitchLabel(laneLabels[laneIdx])}
          </button>
        ))}
      </div>

      <div ref={fieldRef} className="sr-field" style={S.field} onPointerDown={moveToTappedLane}>
        {laneNames.map((name, laneIdx) => (
          <div key={name} style={S.lane(laneIdx)} />
        ))}
        {laneNames.map((name, laneIdx) => (
          <div key={`${name}-label`} className="sr-lane-label" style={S.laneLabel(laneIdx)}>
            {renderPitchLabel(laneLabels[laneIdx])}
          </div>
        ))}

        {obstacles.map((obstacle) => (
          <div key={obstacle.id}>
            {(obstacle.revealed || showObstacles) && laneNames.map((name, laneIdx) => (
              laneIdx === obstacle.safeLane ? null : (
                <div key={name} style={S.revealedWall(obstacle, laneIdx)}>
                  <div style={S.wallStripe} />
                </div>
              )
            ))}
            {obstacle.hidden && !showObstacles && (
              <div style={S.cloud(obstacle)}>
                <div style={S.cloudPuff} />
              </div>
            )}
          </div>
        ))}

        {finishLine && (
          <div style={S.finishLine(finishLine)}>
            {laneNames.map((name, laneIdx) => (
              <div key={name} style={S.finishHoop(laneIdx)} />
            ))}
          </div>
        )}

        <div style={S.svara} aria-label={`Svara in ${laneLabel} lane`}>
          <div style={S.wing} />
          <div style={S.beak} />
          <div style={S.eye} />
        </div>

        <div style={S.message}>
          <div style={S.messagePanel}>
            <div style={S.messageTitle}>
              {levelComplete ? completionTitle : crashed ? 'Crashed' : activeLevel.title}
            </div>
            <p style={S.messageText}>
              {levelComplete
                ? completionText
                : crashed
                ? `Run ended at ${score}.`
                : activeLevel.helpText
                  ? activeLevel.helpText
                : activeLevel.cueType === 'single-note'
                  ? 'The drone holds Sa. Hear the cue note and choose its lane.'
                : activeLevel.cueType === 'sequence'
                  ? 'Sa-Pa means top. Sa-Sa means middle. Sa-low Pa means bottom.'
                : activeLevel.cueType === 'two-note'
                  ? 'High Sa then Sa means bottom. Sa then high Sa means top.'
                  : activeLevel.cueType === 'anchored-two-note'
                    ? 'Sa then low Sa means bottom. Sa then high Sa means top.'
                  : `The ${activeLevel.interval.toLowerCase()} slide is your decision window: rising means top, falling means bottom.`}
            </p>
            {levelComplete && !showObstaclesUsed && nextLevel ? (
              <button type="button" style={S.button(true)} onClick={goToNextLevel}>
                Go to locality {nextLevel.id}
              </button>
            ) : (
              <button type="button" style={S.button(true)} onClick={() => startRun()}>
                {crashed || levelComplete ? 'Try Again' : 'Start Run'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
