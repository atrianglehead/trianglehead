export const LANE_NAMES = {
  2: ['top', 'bottom'],
  3: ['top', 'middle', 'bottom'],
  4: ['top', 'upper middle', 'lower middle', 'bottom'],
  5: ['top', 'high middle', 'middle', 'low middle', 'bottom'],
  6: ['top', 'upper high', 'lower high', 'upper low', 'lower low', 'bottom'],
  7: ['top', 'upper high', 'middle high', 'middle', 'middle low', 'lower low', 'bottom'],
  8: ['top', 'upper high', 'middle high', 'upper middle', 'lower middle', 'middle low', 'lower low', 'bottom'],
};

export const BIRD_X = 92;
export const BIRD_SIZE = 34;
export const WALL_W = 76;
export const INITIAL_OBSTACLE_COUNT = 7;
export const VISIBLE_TUTORIAL_COUNT = 5;
export const SPEED = 128;
export const BEAT_SECONDS = 0.3375;
export const NOTE_CHANGE_SECONDS = BEAT_SECONDS * 2;
export const CUE_START_BEATS_BEFORE_IMPACT = 6;
export const CUE_END_BEFORE_IMPACT_SECONDS = 0.3;
export const CUE_LEAD_SECONDS = CUE_START_BEATS_BEFORE_IMPACT * BEAT_SECONDS;
export const CUE_SECONDS = CUE_LEAD_SECONDS - CUE_END_BEFORE_IMPACT_SECONDS;
export const BAR_SECONDS = BEAT_SECONDS * 4;
export const LEVELS_PER_STAGE = 25;
export const STAGE_COUNT = 3;

export const DEFAULT_SYNTH = {
  waveform: 'triangle',
  detune: 4,
  harmonic: 0.15,
  brightness: 4600,
  attack: 0.05,
  release: 0.24,
  delay: 0.14,
  vibrato: 0.8,
  volume: 0.26,
};

export const DEFAULT_MIXER = {
  cue: 1.2,
  drone: 0.9,
  drums: 0.85,
  result: 1,
};

export const DRONE_DRY_GAIN = 0.2;
export const DRONE_WET_GAIN = 0.22;
export const CRASH_TONE_SECONDS = 1.1;
