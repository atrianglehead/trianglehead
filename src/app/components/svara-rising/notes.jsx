export const LOW_TIVRA_MA_FREQ = 155.56;
export const SA_FREQ = 220;
export const LOW_SA_FREQ = 110;
export const HIGH_SA_FREQ = 440;
export const PA_FREQ = 329.63;
export const LOW_PA_FREQ = 164.815;
export const DHA_FREQ = 370;
export const LOW_DHA_FREQ = 185;
export const GA_FREQ = 277.18;
export const MA_FREQ = 293.66;
export const TIVRA_MA_FREQ = 311.13;
export const RE_FREQ = 246.94;
export const LOW_NI_FREQ = 207.65;
export const NI_FREQ = 415.3;
export const KOMAL_RE_FREQ = 233.08;
export const KOMAL_GA_FREQ = 261.63;
export const KOMAL_DHA_FREQ = 349.23;
export const KOMAL_NI_FREQ = 392;

export const NOTE_FREQS = {
  Sa: SA_FREQ,
  re: KOMAL_RE_FREQ,
  Re: RE_FREQ,
  ga: KOMAL_GA_FREQ,
  Ga: GA_FREQ,
  ma: MA_FREQ,
  Ma: TIVRA_MA_FREQ,
  Pa: PA_FREQ,
  dha: KOMAL_DHA_FREQ,
  Dha: DHA_FREQ,
  ni: KOMAL_NI_FREQ,
  Ni: NI_FREQ,
  "Sa'": HIGH_SA_FREQ,
};

export const KOMAL_NOTES = new Set(['re', 'ga', 'dha', 'ni']);

function getOctaveParts(note) {
  if (note.startsWith('low ')) {
    return { base: note.replace('low ', ''), octave: 'low' };
  }
  if (note.endsWith("'")) {
    return { base: note.slice(0, -1), octave: 'high' };
  }
  return { base: note, octave: 'middle' };
}

function addOctaveDot(display, octave) {
  if (octave === 'low') return `${display}\u0323`;
  if (octave === 'high') return `${display}\u0307`;
  return display;
}

export function displayNoteName(note) {
  const { base, octave } = getOctaveParts(note);

  if (KOMAL_NOTES.has(base)) {
    return addOctaveDot(base.split('').map((char) => `${char}\u0332`).join(''), octave);
  }
  if (base === 'Ma') {
    return addOctaveDot('M\u030Da', octave);
  }
  return addOctaveDot(base, octave);
}

export function formatNoteList(notes) {
  const displayNotes = notes.map(displayNoteName);
  if (displayNotes.length <= 1) return displayNotes[0] || '';
  return `${displayNotes.slice(0, -1).join(', ')}, or ${displayNotes[displayNotes.length - 1]}`;
}

export function renderPitchLabel(label) {
  if (!label) return null;

  const { base, octave } = getOctaveParts(label);

  const labelBody = (() => {
    if (KOMAL_NOTES.has(base)) {
      return (
        <span style={{ textDecorationLine: 'underline', textDecorationThickness: 2, textUnderlineOffset: 3 }}>
          {base}
        </span>
      );
    }

    if (base === 'Ma') {
      return (
        <span style={{ position: 'relative', display: 'inline-block', paddingTop: 4 }}>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: 2,
              height: 5,
              background: 'currentColor',
              transform: 'translateX(-50%)',
            }}
          />
          {base}
        </span>
      );
    }

    return base;
  })();

  if (octave === 'middle') return labelBody;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        paddingTop: octave === 'high' ? 6 : 0,
        paddingBottom: octave === 'low' ? 6 : 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: octave === 'high' ? 0 : 'auto',
          bottom: octave === 'low' ? 0 : 'auto',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'currentColor',
          transform: 'translateX(-50%)',
        }}
      />
      {labelBody}
    </span>
  );
}
