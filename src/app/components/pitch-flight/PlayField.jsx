import { renderPitchLabel } from './notes';

export default function PlayField({
  S,
  fieldRef,
  moveToTappedLane,
  laneNames,
  laneLabels,
  obstacles,
  lane,
  laneLabel,
  activeLevel,
  running,
  crashPending,
  crashed,
  score,
  startRun,
  moveToLane,
}) {
  return (
    <div className="pf-play-area" style={S.playArea}>
      <div ref={fieldRef} className="pf-field" style={S.field} onPointerDown={moveToTappedLane}>
        {laneNames.map((name, laneIdx) => (
          <div key={name} style={S.lane(laneIdx)} />
        ))}
        {laneNames.map((name, laneIdx) => (
          <div key={`${name}-label`} className="pf-lane-label" style={S.laneLabel(laneIdx)}>
            {renderPitchLabel(laneLabels[laneIdx])}
          </div>
        ))}

        {obstacles.map((obstacle) => (
          <div key={obstacle.id}>
            {obstacle.revealed && laneNames.map((name, laneIdx) => (
              laneIdx === obstacle.safeLane ? null : (
                <div key={name} style={S.revealedWall(obstacle, laneIdx)}>
                  <div style={S.wallStripe} />
                </div>
              )
            ))}
            {obstacle.hidden && (
              <div style={S.cloud(obstacle)}>
                <div style={S.cloudPuff} />
              </div>
            )}
          </div>
        ))}

        <div style={S.bird} aria-label={`Bird in ${laneLabel} lane`}>
          <div style={S.wing} />
          <div style={S.beak} />
          <div style={S.eye} />
        </div>

        <div style={S.message}>
          <div style={S.messagePanel}>
            <div style={S.messageTitle}>{crashed ? 'Crashed' : activeLevel.title}</div>
            <p style={S.messageText}>
              {crashed
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
            <button type="button" style={S.button(true)} onClick={() => startRun()}>
              {crashed ? 'Try Again' : 'Start Run'}
            </button>
          </div>
        </div>
      </div>

      <div className="pf-controls" style={S.controls}>
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
    </div>
  );
}
