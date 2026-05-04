// One-time iOS audio session unlock: playing an <audio> element forces the
// session category from "ambient" (silenced by mute switch) to "playback".
// A Web Audio API oscillator alone is not sufficient on iOS.
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let unlocked = false;

export function unlockAudioSession() {
  if (unlocked) return;
  unlocked = true;
  const audio = new Audio(SILENT_WAV);
  audio.volume = 0;
  const p = audio.play();
  if (p) p.catch(() => { unlocked = false; });
}
