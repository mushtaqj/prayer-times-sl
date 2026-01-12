/**
 * Audio utilities
 * Functions for playing notification sounds
 */

// ============================================================================
// Constants
// ============================================================================

/** Audio frequencies for notification tones (in Hz) */
const TONE_FREQUENCIES = {
  /** G#5 - First tone start */
  FIRST_START: 830,
  /** E5 - First tone end */
  FIRST_END: 659,
  /** B5 - Second tone end */
  SECOND_END: 988,
} as const

/** Timing constants for audio playback (in seconds) */
const AUDIO_TIMING = {
  /** Frequency change point */
  FREQ_CHANGE: 0.15,
  /** Fade in duration */
  FADE_IN: 0.05,
  /** Peak hold point */
  PEAK_HOLD: 0.2,
  /** Total tone duration */
  TONE_DURATION: 0.4,
  /** Delay before second tone (ms) */
  SECOND_TONE_DELAY_MS: 400,
} as const

/** Volume levels */
const VOLUME = {
  SILENT: 0,
  PEAK: 0.3,
} as const

// ============================================================================
// Functions
// ============================================================================

/**
 * Get AudioContext with webkit fallback
 */
function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    return new AudioContextClass()
  } catch {
    return null
  }
}

/**
 * Play a single tone with fade in/out
 */
function playTone(
  audioContext: AudioContext,
  startFreq: number,
  endFreq: number
): void {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Set frequency pattern
  oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime)
  oscillator.frequency.setValueAtTime(endFreq, audioContext.currentTime + AUDIO_TIMING.FREQ_CHANGE)
  oscillator.type = 'sine'

  // Fade in and out
  gainNode.gain.setValueAtTime(VOLUME.SILENT, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(VOLUME.PEAK, audioContext.currentTime + AUDIO_TIMING.FADE_IN)
  gainNode.gain.linearRampToValueAtTime(VOLUME.PEAK, audioContext.currentTime + AUDIO_TIMING.PEAK_HOLD)
  gainNode.gain.linearRampToValueAtTime(VOLUME.SILENT, audioContext.currentTime + AUDIO_TIMING.TONE_DURATION)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + AUDIO_TIMING.TONE_DURATION)
}

/**
 * Play a pleasant two-tone notification sound (like a doorbell)
 */
export function playNotificationSound(): void {
  const audioContext = getAudioContext()
  if (!audioContext) {
    console.warn('AudioContext not supported')
    return
  }

  try {
    // Play first tone
    playTone(audioContext, TONE_FREQUENCIES.FIRST_START, TONE_FREQUENCIES.FIRST_END)

    // Play second tone after delay
    setTimeout(() => {
      playTone(audioContext, TONE_FREQUENCIES.FIRST_START, TONE_FREQUENCIES.SECOND_END)
    }, AUDIO_TIMING.SECOND_TONE_DELAY_MS)
  } catch (e) {
    console.warn('Could not play notification sound:', e)
  }
}
