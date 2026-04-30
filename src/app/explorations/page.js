import Link from "next/link";

import { colors, fonts, styles } from "../styles";

export const metadata = {
  title: "Explorations · Trianglehead",
  description: "Interactive music explorations for developing musical fluency.",
};

const explorations = [
  {
    title: "Melody Match",
    href: "/explorations/melody-match",
    description: "Listen, compare, and sharpen the inner ear through short melodic patterns.",
    tags: ["Melody", "Pitch", "Rhythm"],
    accent: colors.red,
    preview: "melody",
  },
  {
    title: "Svarā Rising",
    href: "/explorations/svara-rising",
    description: "Guide Svarā through lanes by recognising pitches.",
    tags: ["Pitch", "Memory", "Game"],
    accent: colors.yellow,
    preview: "svara",
  },
];

function Preview({ type, accent }) {
  if (type === "svara") {
    return (
      <div className="exploration-preview svara-preview" aria-hidden="true">
        <div className="preview-lane" />
        <div className="preview-lane" />
        <div className="preview-lane" />
        <div className="preview-svara" />
        <div className="preview-wall one" />
        <div className="preview-wall two" />
        <div className="preview-note top" style={{ background: accent }}>Pa</div>
        <div className="preview-note middle" style={{ background: accent }}>Ga</div>
        <div className="preview-note bottom" style={{ background: accent }}>Sa</div>
      </div>
    );
  }

  return (
    <div className="exploration-preview melody-preview" aria-hidden="true">
      <div className="melody-workspace">
        <div className="melody-split">
          <div className="melody-graph pitch-graph">
            <div className="melody-y-axis">
              <span>Ma</span>
              <span>Ga</span>
              <span>Re</span>
              <span>Sa</span>
            </div>
            <div className="melody-canvas">
              <div className="melody-beat-line a" />
              <div className="melody-beat-line b" />
              <div className="melody-beat-line c" />
              <div className="melody-block pitch-one">Sa</div>
              <div className="melody-block pitch-two">Ga</div>
              <div className="melody-block pitch-three">Re</div>
            </div>
            <div className="melody-x-axis">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>

          <div className="melody-graph rhythm-graph">
            <div className="melody-y-axis">
              <span>Ma</span>
              <span>Ga</span>
              <span>Re</span>
              <span>Sa</span>
            </div>
            <div className="melody-canvas rhythm-canvas">
              <div className="melody-beat-line a" />
              <div className="melody-beat-line b" />
              <div className="melody-beat-line c" />
              <div className="melody-block pitch-one">1</div>
              <div className="melody-block pitch-two">2</div>
              <div className="melody-block pitch-three">4</div>
            </div>
            <div className="melody-x-axis rhythm-axis">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Explorations() {
  return (
    <>
      <section className="explorations-hero">
        <div>
          <h1 style={{ ...styles.pageTitle, margin: 0 }}>Explorations</h1>
        </div>
        <p className="explorations-intro" style={styles.bodyText}>
          Develop musical fluency by directly engaging with musical concepts like pitch, time and volume. More coming soon.
        </p>
      </section>

      <section className="explorations-grid-wrap">
        <div className="explorations-grid">
          {explorations.map((item) => (
            <Link key={item.href} href={item.href} className="exploration-card">
              <Preview type={item.preview} accent={item.accent} />
              <div className="card-copy">
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span className="open-link">
                  Open &gt;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .explorations-hero {
          padding: 30px 28px 24px;
          border-bottom: 3px solid ${colors.black};
          display: grid;
          grid-template-columns: minmax(180px, 0.85fr) minmax(240px, 1.15fr);
          gap: 24px;
          align-items: end;
          background: ${colors.bg};
        }

        .explorations-intro {
          margin: 0;
          max-width: 720px;
        }

        .explorations-grid-wrap {
          padding: 28px;
          background: ${colors.yellow};
          border-bottom: 3px solid ${colors.black};
        }

        .explorations-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          max-width: 1120px;
          margin: 0 auto;
        }

        .exploration-card {
          background: #fff;
          border: 2.5px solid ${colors.black};
          box-shadow: 5px 5px 0 ${colors.black};
          display: grid;
          grid-template-rows: 220px auto;
          min-width: 0;
          color: inherit;
          text-decoration: none;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .exploration-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 7px 7px 0 ${colors.black};
        }

        .exploration-card:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 ${colors.black};
        }

        .exploration-preview {
          position: relative;
          overflow: hidden;
          border-bottom: 2.5px solid ${colors.black};
          background: ${colors.cream};
          min-height: 220px;
        }

        .svara-preview {
          background: linear-gradient(180deg, ${colors.bg} 0 100%);
        }

        .preview-lane {
          height: 33.333%;
          border-bottom: 2px dashed ${colors.divider};
        }

        .preview-lane:last-of-type {
          border-bottom: 0;
        }

        .preview-svara {
          position: absolute;
          left: 92px;
          top: 50%;
          width: 34px;
          height: 34px;
          transform: translateY(-50%);
          border: 2.5px solid ${colors.black};
          background: ${colors.red};
          border-radius: 50% 50% 46% 46%;
          box-shadow: 3px 3px 0 ${colors.black};
        }

        .preview-svara::before {
          content: "";
          position: absolute;
          left: 7px;
          top: 14px;
          width: 17px;
          height: 8px;
          border: 2px solid ${colors.black};
          border-top: 0;
          background: ${colors.cream};
          transform: rotate(-14deg);
        }

        .preview-svara::after {
          content: "";
          position: absolute;
          right: -9px;
          top: 11px;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 10px solid ${colors.black};
        }

        .preview-wall {
          position: absolute;
          width: 52px;
          height: 74px;
          right: 70px;
          background: ${colors.black};
          border: 2px solid ${colors.black};
        }

        .preview-wall.one {
          top: 0;
        }

        .preview-wall.two {
          bottom: 0;
          right: 150px;
        }

        .preview-note {
          position: absolute;
          left: 18px;
          border: 2px solid ${colors.black};
          min-width: 34px;
          padding: 8px 9px;
          font-family: ${fonts.mono};
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .preview-note.top {
          top: calc(16.666% - 17px);
        }

        .preview-note.middle {
          top: calc(50% - 17px);
        }

        .preview-note.bottom {
          top: calc(83.333% - 17px);
        }

        .melody-preview {
          background: ${colors.yellow};
        }

        .melody-workspace {
          height: 100%;
          padding: 0;
        }

        .melody-split {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          height: 100%;
          gap: 0;
        }

        .melody-graph {
          display: grid;
          grid-template-columns: 38px 1fr;
          grid-template-rows: 1fr 24px;
          height: 100%;
          background: ${colors.bg};
        }

        .rhythm-graph {
          border-left: 4px solid ${colors.black};
        }

        .melody-y-axis {
          grid-row: 1;
          border-right: 2px solid ${colors.black};
          background: #edeae0;
          display: grid;
          grid-template-rows: repeat(4, 1fr);
        }

        .melody-y-axis span {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #d5d1c5;
          font-family: ${fonts.mono};
          font-size: 8px;
          font-weight: 900;
          color: ${colors.black};
        }

        .melody-y-axis span:last-child {
          border-bottom: 0;
          color: ${colors.red};
        }

        .melody-canvas {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(180deg, transparent calc(25% - 0.5px), #d5d1c5 calc(25% - 0.5px), #d5d1c5 calc(25% + 0.5px), transparent calc(25% + 0.5px)),
            linear-gradient(180deg, transparent calc(50% - 0.5px), #d5d1c5 calc(50% - 0.5px), #d5d1c5 calc(50% + 0.5px), transparent calc(50% + 0.5px)),
            linear-gradient(180deg, transparent calc(75% - 0.5px), #d5d1c5 calc(75% - 0.5px), #d5d1c5 calc(75% + 0.5px), transparent calc(75% + 0.5px)),
            #F5F2EB;
        }

        .melody-beat-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #e0dcd0;
        }

        .melody-beat-line.a { left: 25%; }
        .melody-beat-line.b { left: 50%; }
        .melody-beat-line.c { left: 75%; }

        .melody-block {
          position: absolute;
          height: calc(25% - 6px);
          border: 2px solid ${colors.black};
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ${fonts.mono};
          font-size: 9px;
          font-weight: 900;
          color: ${colors.black};
          background: ${colors.yellow};
        }

        .pitch-one {
          left: calc(0% + 2px);
          top: calc(75% + 3px);
          width: calc(25% - 4px);
        }

        .pitch-two {
          left: calc(25% + 2px);
          top: calc(25% + 3px);
          width: calc(50% - 4px);
        }

        .pitch-three {
          left: calc(75% + 2px);
          top: calc(50% + 3px);
          width: calc(25% - 4px);
        }

        .melody-x-axis {
          grid-column: 2;
          grid-row: 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 2px solid ${colors.black};
          background: #edeae0;
        }

        .melody-x-axis span {
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #d5d1c5;
          font-family: ${fonts.mono};
          font-size: 8px;
          font-weight: 700;
        }

        .melody-x-axis span:last-child {
          border-right: 0;
        }

        .card-copy {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tag-row {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .tag {
          border: 1.5px solid ${colors.black};
          background: ${colors.bg};
          padding: 5px 7px;
          font-family: ${fonts.mono};
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .card-copy h2 {
          font-family: ${fonts.display};
          font-size: 32px;
          letter-spacing: 2px;
          line-height: 1;
          margin: 0;
          color: ${colors.black};
        }

        .card-copy p {
          font-family: ${fonts.serif};
          font-size: 15px;
          color: #444;
          line-height: 1.7;
          margin: 0;
        }

        .open-link {
          font-family: ${fonts.mono};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          border: 2px solid ${colors.black};
          padding: 10px 18px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          align-self: flex-start;
          background: ${colors.yellow};
          color: ${colors.black};
          margin-top: auto;
        }

        @media (max-width: 760px) {
          .explorations-hero {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .explorations-grid-wrap {
            padding: 18px;
          }

          .explorations-grid {
            grid-template-columns: 1fr;
          }

          .exploration-card {
            grid-template-rows: 180px auto;
          }

          .exploration-preview {
            min-height: 180px;
          }

          .melody-workspace {
            padding: 0;
          }

          .melody-split {
            gap: 0;
          }

          .melody-graph {
            grid-template-columns: 32px 1fr;
            height: 100%;
          }

          .rhythm-graph {
            grid-template-columns: 1fr;
          }

          .melody-block {
            font-size: 8px;
          }
        }
      `}</style>
    </>
  );
}
