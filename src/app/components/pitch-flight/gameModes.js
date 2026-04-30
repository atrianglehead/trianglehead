import { colors } from '../../styles';

export const GAME_MODES = [
  { id: 'nibble', label: 'Nibble', lives: 5, obstacleSpacingBars: 4, cueStartBeats: 12, color: '#fff' },
  { id: 'bite', label: 'Bite', lives: 3, obstacleSpacingBars: 4, cueStartBeats: 8, color: colors.cream },
  { id: 'gobble', label: 'Gobble', lives: 2, obstacleSpacingBars: 3, cueStartBeats: 6, color: colors.red },
  { id: 'devour', label: 'Devour', lives: 1, obstacleSpacingBars: 2, cueStartBeats: 6, singleNoteCueStartBeats: 4, color: colors.black },
];
