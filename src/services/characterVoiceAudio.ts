import { sound } from './audio';
import {
  CharacterVoiceLine,
  DialogueTrigger,
  getCharacterVoiceLine,
} from '../data/characterVoiceLines';

class CharacterVoiceAudioEngine {
  private activeAudioElements: HTMLAudioElement[] = [];

  /**
   * Plays the iconic character dialogue line and concurrent sound effect URL.
   * Handles muted state, network errors, and browser speech synthesis gracefully.
   */
  public triggerVoiceLine(
    characterId: string,
    trigger: DialogueTrigger
  ): CharacterVoiceLine {
    const voiceLine = getCharacterVoiceLine(characterId, trigger);

    if (sound.isMuted) {
      // Muted: return line for visual subtitle banner without audio
      return voiceLine;
    }

    // 1. Play Pre-defined Sound Effect URL from array
    try {
      const audio = new Audio(voiceLine.soundEffectUrl);
      audio.volume = 0.55;
      this.activeAudioElements.push(audio);

      // Clean up after playback
      audio.onended = () => {
        this.activeAudioElements = this.activeAudioElements.filter((a) => a !== audio);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((_err) => {
          // If network / autoplay restricts external URL, fallback to procedural anime audio
          sound.playJoJoMoveSound(characterId);
        });
      }
    } catch (_e) {
      sound.playJoJoMoveSound(characterId);
    }

    // 2. Play Procedural Anime Stand Cry accompaniment
    if (trigger === 'clash_win') {
      sound.playClashFinisher();
      sound.playPunchBarrage();
    } else if (trigger === 'special_cell') {
      sound.playStandSummon();
    } else {
      sound.playJoJoMoveSound(characterId);
    }

    // SpeechSynthesis voice-over has been removed per user feedback.
    // Ensure browser speech synthesis is silenced.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }

    return voiceLine;
  }

  /**
   * Stop all active voice audio
   */
  public stopAllVoiceAudio() {
    this.activeAudioElements.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_e) {}
    });
    this.activeAudioElements = [];

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
  }
}

export const characterVoiceAudio = new CharacterVoiceAudioEngine();
