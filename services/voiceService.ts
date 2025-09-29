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

/**
 * Uses the browser's speech synthesis to speak a given text, interrupting any ongoing speech.
 * @param text The text to be spoken.
 */
export const speak = (text: string): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Interrupt any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: configure voice, pitch, rate
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices[0];
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech Synthesis not supported in this browser.");
  }
};

/**
 * Cancels any ongoing or queued speech synthesis.
 */
export const cancelSpeech = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};