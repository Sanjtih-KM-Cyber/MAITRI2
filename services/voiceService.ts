// FIX: Add type definitions for the non-standard Web Speech API to the global Window object.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// A simple wrapper around the Web Speech API

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: any;
let isManuallyStopped = false; // Flag to check if stop was intentional

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // Add a persistent onend handler to automatically restart the service
  recognition.onend = () => {
    if (isManuallyStopped) {
      console.log("Speech recognition stopped manually.");
      isManuallyStopped = false; // Reset for the next session
      return;
    }
    
    console.log("Speech recognition service ended unexpectedly. Restarting...");
    try {
      // Small delay to prevent rapid-fire restarts on some errors
      setTimeout(() => recognition.start(), 100);
    } catch (e) {
      console.error("Failed to restart speech recognition.", e);
    }
  };
}

/**
 * Starts listening for voice input. This function now manages a single recognition
 * instance, ensuring that only the latest listener is active.
 * @param onFinalResult - Callback function for when the user finishes speaking.
 * @param onInterimResult - Callback function for real-time transcription results.
 * @returns A function to stop listening.
 */
export const startListening = (
  onFinalResult: (transcript: string) => void,
  onInterimResult: (transcript: string) => void
): (() => void) => {
  if (!recognition) {
    console.warn("Speech Recognition API not supported in this browser.");
    return () => {};
  }

  let finalTranscript = '';

  // Set the result handler for the current listener
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    onInterimResult(interimTranscript);
    if (finalTranscript) {
      onFinalResult(finalTranscript);
      finalTranscript = '';
    }
  };

  // Set the error handler for the current listener
  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
    // If permission is denied, we must stop trying to restart.
    if (event.error === 'not-allowed') {
      isManuallyStopped = true;
    }
    // For other errors like 'network', the onend handler will manage the restart.
  };
  
  try {
    isManuallyStopped = false;
    recognition.start();
  } catch (e) {
    // This error is expected if recognition is already running. We can ignore it
    // because we've already updated the result and error handlers.
    console.log("Could not start recognition service (may already be active). Handlers updated.");
  }


  return () => {
    if (recognition) {
      isManuallyStopped = true; // Signal that this is an intentional stop
      recognition.stop();
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
