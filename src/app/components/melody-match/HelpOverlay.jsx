import { S } from './styles';

export default function HelpOverlay({ helpTab, setHelpTab, onClose }) {
  return (
    <div style={S.helpOverlay} onClick={onClose}>
      <div style={S.helpPanel} role="dialog" aria-label="Melody Match help" onClick={e => e.stopPropagation()}>
        <div style={S.helpHead}>
          <div />
          <div style={S.helpTitle}>How To Play</div>
          <button type="button" style={S.helpClose} onClick={onClose}>X</button>
        </div>
        <div style={S.helpTabs}>
          <button type="button" style={S.helpTab(helpTab === 'pitch')} onClick={() => setHelpTab('pitch')}>Pitch</button>
          <button type="button" style={S.helpTabLast(helpTab === 'rhythm')} onClick={() => setHelpTab('rhythm')}>Rhythm</button>
        </div>

        {helpTab === 'pitch' ? (
          <div key="pitch-help" className="mm-help-body" style={S.helpBody}>
            <div style={S.helpCard}>
              <div style={S.helpCardTitle}>Goal</div>
              <div className="mm-help-grid" style={S.helpGrid}>
                <div style={S.helpBlock(0, 78, 1)}>Sa</div>
                <div style={S.helpBlock(1, 12, 2)}>Ga</div>
                <div style={S.helpBlock(3, 45, 1)}>Re</div>
              </div>
            </div>
            <div style={S.helpCard}>
              <div style={S.helpCardTitle}>Drag UP/DOWN</div>
              <div className="mm-help-grid" style={S.helpGrid}>
                <div style={S.helpBlock(0, 78, 1)}>Sa</div>
                <div className="mm-pitch-wide" style={S.helpBlock(1, 78, 2)}>
                  Ga <span className="mm-block-arrow">↑</span>
                </div>
                <div className="mm-pitch-short" style={S.helpBlock(3, 78, 1)}>
                  Re <span className="mm-block-arrow">↑</span>
                </div>
                <div className="mm-help-tick" style={S.helpTick}>✓</div>
              </div>
            </div>
          </div>
        ) : (
          <div key="rhythm-help" className="mm-help-body" style={S.helpBody}>
            <div style={S.helpCard}>
              <div style={S.helpCardTitle}>Goal</div>
              <div className="mm-help-grid" style={S.helpGrid}>
                <div style={S.helpBlock(0, 78, 1)}>1</div>
                <div style={S.helpBlock(1, 12, 2)}>2</div>
                <div style={S.helpBlock(3, 45, 1)}>4</div>
              </div>
            </div>
            <div style={S.helpCard}>
              <div style={S.helpCardTitle}>Drag LEFT/RIGHT</div>
              <div className="mm-help-grid" style={S.helpGrid}>
                <div style={S.helpBlock(0, 78, 1)}>1</div>
                <div className="mm-rhythm-short" style={S.helpBlock(1, 12, 1)}>
                  <span className="mm-label-start">2 <span className="mm-block-arrow">→</span></span>
                  <span className="mm-label-target">4</span>
                </div>
                <div className="mm-rhythm-long" style={S.helpBlock(2, 45, 2)}>
                  <span className="mm-label-start">3</span>
                  <span className="mm-label-target">2</span>
                </div>
                <div className="mm-help-tick" style={S.helpTick}>✓</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .mm-help-grid::before {
          content: none;
        }

        .mm-block-arrow {
          margin-left: 4px;
          color: #E8473F;
          font-size: 14px;
          line-height: 1;
          animation: mmHelpArrow 4s linear infinite;
        }

        .mm-label-start,
        .mm-label-target {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mm-label-start {
          animation: mmStartLabel 4s linear infinite;
        }

        .mm-label-target {
          animation: mmTargetLabel 4s linear infinite;
        }

        .mm-pitch-wide {
          animation: mmPitchWide 4s ease-in-out infinite;
        }

        .mm-pitch-short {
          animation: mmPitchShort 4s ease-in-out infinite;
        }

        .mm-rhythm-short {
          animation: mmRhythmShort 4s ease-in-out infinite;
        }

        .mm-rhythm-long {
          animation: mmRhythmLong 4s ease-in-out infinite;
        }

        .mm-help-tick {
          animation: mmHelpTick 4s ease-in-out infinite;
        }

        @keyframes mmPitchWide {
          0%, 12.5% { top: 78px; }
          32%, 82% { top: 12px; }
          88%, 100% { top: 78px; }
        }

        @keyframes mmPitchShort {
          0%, 12.5% { top: 78px; }
          32%, 82% { top: 45px; }
          88%, 100% { top: 78px; }
        }

        @keyframes mmRhythmShort {
          0%, 12.5% { left: 25%; top: 12px; width: 25%; }
          32%, 82% { left: 75%; top: 45px; width: 25%; }
          88%, 100% { left: 25%; top: 12px; width: 25%; }
        }

        @keyframes mmRhythmLong {
          0%, 12.5% { left: 50%; top: 45px; width: 50%; }
          32%, 82% { left: 25%; top: 12px; width: 50%; }
          88%, 100% { left: 50%; top: 45px; width: 50%; }
        }

        @keyframes mmHelpTick {
          0%, 31%, 83%, 100% { opacity: 0; transform: scale(0.8); }
          32%, 82% { opacity: 1; transform: scale(1); }
        }

        @keyframes mmHelpArrow {
          0%, 12.5% { opacity: 1; }
          13%, 100% { opacity: 0; }
        }

        @keyframes mmStartLabel {
          0%, 31% { opacity: 1; }
          32%, 82% { opacity: 0; }
          88%, 100% { opacity: 1; }
        }

        @keyframes mmTargetLabel {
          0%, 31% { opacity: 0; }
          32%, 82% { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
