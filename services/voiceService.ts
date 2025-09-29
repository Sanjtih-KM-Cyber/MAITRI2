// FIX: Add type definitions for the non-standard Web Speech API to the global Window object.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Starts a new, isolated speech recognition session.
 * @param onFinalResult - Callback for the final, confirmed transcript.
 * @param onInterimResult - Callback for real-time, interim transcription results.
 * @param options - Configuration for the recognition session.
 * @returns A function to manually stop this specific listening session.
 */
export const startListening = (
  onFinalResult: (transcript: string) => void,
  onInterimResult: (transcript: string) => void,
  options: { continuous?: boolean } = {}
): (() => void) => {
  const { continuous = false } = options;

  if (!SpeechRecognition) {
    console.warn("Speech Recognition API not supported in this browser.");
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
        if (continuous) {
          // In continuous mode, fire final result and reset for the next one.
          onFinalResult(finalTranscript.trim());
          finalTranscript = '';
        }
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    if (interimTranscript) {
      onInterimResult(interimTranscript);
    }
  };

  recognition.onend = () => {
    // In non-continuous mode, onend signals the final result.
    if (!continuous && finalTranscript) {
      onFinalResult(finalTranscript.trim());
    }
    // For continuous mode, onend means the session was stopped.
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Could not start recognition service.", e);
  }

  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // May have already stopped.
    }
  };
};


// --- Speech Synthesis Enhancement ---

let voices: SpeechSynthesisVoice[] = [];
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (voices.length) {
      return resolve(voices);
    }
    // The voices list is often loaded asynchronously.
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length) {
      voices = availableVoices;
      return resolve(voices);
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

// Pre-warm the voices cache on script load.
if ('speechSynthesis' in window) {
  getVoices();
}


/**
 * Uses the browser's speech synthesis to speak a given text, with high-quality voice selection.
 * @param text The text to be spoken.
 * @param gender An optional gender preference for the voice ('male' | 'female').
 */
export const speak = async (text: string, gender?: 'male' | 'female'): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return;
  }
  
  const allVoices = await getVoices();
  if (!allVoices.length) {
    console.warn("No speech synthesis voices available. Using browser default.");
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return;
  }

  let selectedVoice: SpeechSynthesisVoice | null = null;
  const targetLang = 'en';

  const isHighQuality = (v: SpeechSynthesisVoice) => v.name.includes('Google') || v.name.includes('Microsoft');
  const genderMatch = (name: string, g: 'male' | 'female') => {
      const lowerName = name.toLowerCase();
      if (g === 'female') return lowerName.includes('female') || lowerName.includes('woman') || lowerName.includes('zira') || lowerName.includes('eva');
      if (g === 'male') return lowerName.includes('male') || lowerName.includes('man') || lowerName.includes('david');
      return false;
  };
  
  const localVoices = allVoices.filter(v => v.lang.startsWith(targetLang));

  if (gender) {
    // 1. Try for high-quality, gender-matched voice
    selectedVoice = localVoices.find(v => isHighQuality(v) && genderMatch(v.name, gender)) || null;
    // 2. Fallback to any quality, gender-matched voice
    if (!selectedVoice) {
      selectedVoice = localVoices.find(v => genderMatch(v.name, gender)) || null;
    }
  }

  // 3. If no gender specified or no match, find best default (prefer high-quality female)
  if (!selectedVoice) {
      selectedVoice = localVoices.find(v => isHighQuality(v) && genderMatch(v.name, 'female')) 
        || localVoices.find(isHighQuality)
        || null;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice || allVoices.find(v => v.default) || allVoices[0];
  utterance.pitch = 1;
  utterance.rate = 1;

  if(utterance.voice) {
      console.log(`Using voice: ${utterance.voice.name}`);
  }

  window.speechSynthesis.speak(utterance);
};


/**
 * Cancels any ongoing or queued speech synthesis.
 */
export const cancelSpeech = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};