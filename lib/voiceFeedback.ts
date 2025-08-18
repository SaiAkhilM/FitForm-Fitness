let Audio: any = null;

try {
  const expoAv = require('expo-av');
  Audio = expoAv.Audio;
  console.log('Successfully imported expo-av Audio');
} catch (error) {
  console.warn('Failed to import expo-av Audio:', error);
}

import { Platform } from 'react-native';

export interface VoiceConfig {
  voiceId: string;
  speed: number; // 0.5 - 2.0
  stability: number; // 0.0 - 1.0
  clarity: number; // 0.0 - 1.0
}

export interface VoiceFeedbackOptions {
  text: string;
  priority: 'high' | 'medium' | 'low';
  interrupt?: boolean; // Whether to interrupt current speech
}

export class VoiceFeedbackService {
  private elevenLabsApiKey: string;
  private isEnabled = true;
  private currentSound: Audio.Sound | null = null;
  private speechQueue: VoiceFeedbackOptions[] = [];
  private isSpeaking = false;
  private audioAvailable = false;
  
  private defaultVoiceConfig: VoiceConfig = {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni voice - clear and energetic
    speed: 1.0,
    stability: 0.8,
    clarity: 0.9,
  };

  constructor() {
    this.elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
    if (!this.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not found. Voice feedback will be disabled.');
      this.isEnabled = false;
    }
    
    // Initialize audio asynchronously to avoid blocking
    setTimeout(() => {
      this.initializeAudio();
    }, 0);
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Check if Audio is available
      if (!Audio || typeof Audio === 'undefined' || !Audio.setAudioModeAsync) {
        console.warn('Audio API not available on this platform');
        this.audioAvailable = false;
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.audioAvailable = true;
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.audioAvailable = false;
    }
  }

  async speak(options: VoiceFeedbackOptions): Promise<void> {
    if (!this.isEnabled || !options.text.trim()) {
      console.log(`[Voice Feedback]: ${options.text} (disabled or empty)`);
      return;
    }

    // Ensure audio is initialized
    if (!this.audioAvailable && Audio) {
      await this.initializeAudio();
    }

    // Handle interruption
    if (options.interrupt && this.isSpeaking) {
      await this.stopCurrentSpeech();
      this.speechQueue = []; // Clear queue
    }

    // Add to queue based on priority
    if (options.priority === 'high') {
      this.speechQueue.unshift(options); // High priority goes to front
    } else {
      this.speechQueue.push(options);
    }

    // Start processing if not already speaking
    if (!this.isSpeaking) {
      await this.processSpeechQueue();
    }
  }

  private async processSpeechQueue(): Promise<void> {
    while (this.speechQueue.length > 0) {
      const nextSpeech = this.speechQueue.shift()!;
      await this.synthesizeAndPlay(nextSpeech.text);
    }
  }

  private async synthesizeAndPlay(text: string): Promise<void> {
    if (!this.elevenLabsApiKey || !this.audioAvailable) {
      // Fallback to text-to-speech or audio file
      await this.playFallbackAudio(text);
      return;
    }

    try {
      this.isSpeaking = true;
      
      // Call ElevenLabs API
      const audioData = await this.callElevenLabsAPI(text);
      
      // Play the synthesized audio
      await this.playAudioData(audioData);
      
    } catch (error) {
      console.error('Voice synthesis error:', error);
      // Fallback to alternative TTS
      await this.playFallbackAudio(text);
    } finally {
      this.isSpeaking = false;
    }
  }

  private async callElevenLabsAPI(text: string): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.defaultVoiceConfig.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: this.defaultVoiceConfig.stability,
            similarity_boost: this.defaultVoiceConfig.clarity,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  private async playAudioData(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioAvailable || !Audio || !Audio.Sound) {
      console.warn('Audio not available, using fallback');
      return this.playFallbackAudio('Audio playback not available');
    }

    try {
      // Convert ArrayBuffer to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      const uri = `data:audio/mpeg;base64,${base64Audio}`;

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.8 }
      );

      this.currentSound = sound;

      // Wait for playback to complete
      return new Promise((resolve, reject) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.currentSound = null;
            resolve();
          } else if (!status.isLoaded && status.error) {
            reject(new Error(status.error));
          }
        });
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      // Fallback to text logging
      await this.playFallbackAudio('Audio playback failed');
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async playFallbackAudio(text: string): Promise<void> {
    // For now, just log the text that would be spoken
    console.log(`[Voice Feedback]: ${text}`);
    
    // Try to use browser's speech synthesis if available (web fallback)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        return new Promise((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            reject(error);
          };
          window.speechSynthesis.speak(utterance);
        });
      } catch (error) {
        console.error('Speech synthesis failed:', error);
      }
    }
    
    // Fallback to simulated speech duration
    const duration = Math.max(1000, text.length * 50); // Approximate reading time
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  async stopCurrentSpeech(): Promise<void> {
    if (this.currentSound && this.audioAvailable) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
    this.isSpeaking = false;
  }

  clearQueue(): void {
    this.speechQueue = [];
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopCurrentSpeech();
      this.clearQueue();
    }
  }

  updateVoiceConfig(config: Partial<VoiceConfig>): void {
    this.defaultVoiceConfig = { ...this.defaultVoiceConfig, ...config };
  }

  // Predefined coaching phrases for better performance
  async speakCoachingPhrase(phraseType: string, customText?: string): Promise<void> {
    const phrases: Record<string, string> = {
      'good_form': 'Great form! Keep it up!',
      'rep_complete': 'Rep complete! Nice work!',
      'elbow_position': 'Keep your elbows higher',
      'shoulder_level': 'Keep your shoulders level',
      'core_engaged': 'Remember to keep your core tight',
      'full_extension': 'Great full extension!',
      'control_movement': 'Focus on controlled movement',
      'breathe': 'Don\'t forget to breathe',
      'setup_position': 'Good setup position',
      'finish_strong': 'Finish strong!',
    };

    const text = customText || phrases[phraseType] || phraseType;
    
    await this.speak({
      text,
      priority: phraseType.startsWith('safety_') ? 'high' : 'medium',
      interrupt: phraseType.startsWith('safety_'),
    });
  }

  // Quick feedback for real-time coaching
  async provideFeedback(feedbackType: 'positive' | 'correction' | 'safety', message: string): Promise<void> {
    const priority = feedbackType === 'safety' ? 'high' : feedbackType === 'correction' ? 'medium' : 'low';
    const interrupt = feedbackType === 'safety';

    await this.speak({
      text: message,
      priority,
      interrupt,
    });
  }

  destroy(): void {
    this.stopCurrentSpeech();
    this.clearQueue();
  }

  // Get service status for debugging
  getStatus(): { enabled: boolean; audioAvailable: boolean; isSpeaking: boolean; queueLength: number } {
    return {
      enabled: this.isEnabled,
      audioAvailable: this.audioAvailable,
      isSpeaking: this.isSpeaking,
      queueLength: this.speechQueue.length,
    };
  }
}

export default VoiceFeedbackService;