// ─── Notification Sound Utility ──────────────────────────────────────────────
// Plays a subtle notification chime when a new notification arrives.
// Uses a pre-loaded Audio element for fast playback.
// Falls back to Web Audio API if the mp3 file is unavailable.

const SOUND_STORAGE_KEY = 'notification_sound_enabled';
const SOUND_FILE_PATH = '/sounds/notification-tone.mp3';

let audioElement = null;
let audioContext = null;
let isPlaying = false;

/**
 * Check if notification sound is enabled.
 */
export function isSoundEnabled() {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    // Default to true if not set
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set notification sound enabled/disabled.
 */
export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch { /* noop */ }
}

/**
 * Generate a pleasant notification chime using Web Audio API.
 * Used as a fallback if the mp3 file fails to load.
 */
function playGeneratedChime() {
  try {
    const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    audioContext = ctx;

    const now = ctx.currentTime;

    // Two-note chime (C5 → E5) — pleasant, Slack-like
    const frequencies = [523.25, 659.25]; // C5, E5
    const durations = [0.12, 0.18];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + (i * 0.15);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durations[i] + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + durations[i] + 0.2);
    });
  } catch (err) {
    console.warn('Web Audio API chime failed:', err);
  }
}

/**
 * Play a notification sound. Prevents overlapping plays.
 * Tries mp3 first, falls back to generated chime.
 */
export function playNotificationSound() {
  if (isPlaying) return;
  if (!isSoundEnabled()) return;

  isPlaying = true;

  // Reset lock after 1 second to prevent permanent blocking
  setTimeout(() => { isPlaying = false; }, 1000);

  try {
    if (!audioElement) {
      audioElement = new Audio(SOUND_FILE_PATH);
      audioElement.volume = 0.4;
      audioElement.preload = 'auto';
    }

    // Reset to start in case it's still loaded from a previous play
    audioElement.currentTime = 0;

    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // mp3 failed (not found, autoplay blocked, etc.) — use generated chime
        playGeneratedChime();
      });
    }
  } catch {
    // Audio constructor failed — use generated chime
    playGeneratedChime();
  }
}
