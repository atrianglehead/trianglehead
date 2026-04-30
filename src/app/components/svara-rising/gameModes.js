import { colors } from '../../styles';

export const GAME_MODES = [
  { id: 'nibble', label: 'Nibble', lives: 5, obstacleSpacingBars: 4, cueStartBeats: 12, color: '#fff' },
  { id: 'bite', label: 'Bite', lives: 3, obstacleSpacingBars: 4, cueStartBeats: 8, color: colors.cream },
  { id: 'gobble', label: 'Gobble', lives: 2, obstacleSpacingBars: 1, cueStartBeats: 4, singleNoteCueStartBeats: 3, noteChangeBeats: 1, color: colors.red },
  { id: 'devour', label: 'Devour', lives: 1, obstacleSpacingBars: 1, cueStartBeats: 4, singleNoteCueStartBeats: 3, noteChangeBeats: 1, successTone: false, color: colors.black },
];
