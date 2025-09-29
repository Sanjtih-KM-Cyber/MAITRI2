import { Message } from '../types';
import i18n from '../i18n';

// This is a placeholder for a real local server endpoint.
// For development, you would run a local Node.js/Python server that
// interfaces with an AI model.
const API_ENDPOINT = 'http://localhost:3001/api/chat';

/**
 * Sends conversation history to a local AI service and returns a streaming response.
 * @param history An array of Message objects representing the conversation.
 * @returns A ReadableStream of the AI's response.
 */
export const getChatResponseStream = async (history: Message[]): Promise<ReadableStream<Uint8Array>> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
        throw new Error("Response body is null.");
    }

    return response.body;
  } catch (error) {
    console.error("Local AI service connection error:", error);
    // In case of a network error, return a stream that sends a translated error message.
    return new ReadableStream({
        start(controller) {
            const errorMessage = i18n.t('services.localAI.connectionError');
            controller.enqueue(new TextEncoder().encode(errorMessage));
            controller.close();
        }
    });
  }
};

/**
 * Placeholder function to summarize a given text.
 * @param text The text to be summarized.
 */
export const summarizeText = async (text: string): Promise<string> => {
    console.log("AI Service: Summarizing text...", text);
    // In a real implementation, this would make an API call.
    await new Promise(res => setTimeout(res, 1000));
    return `This is a summary of the provided text. It highlights the key points about "${text.substring(0, 30)}...".`;
}

/**
 * Placeholder function to generate a narrative based on a prompt.
 * @param prompt The prompt for the narrative.
 */
export const generateNarrative = async (prompt: string): Promise<string> => {
    console.log("AI Service: Generating narrative for prompt...", prompt);
    await new Promise(res => setTimeout(res, 1000));
    return `Based on the prompt "${prompt}", here is a generated narrative log entry from the perspective of an astronaut reflecting on their day.`;
}