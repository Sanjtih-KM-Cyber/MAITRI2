// src/services/localAIService.ts (COMPLETE REWRITE for Ollama/Adaptive Tonality)

import { Message } from '../types';
import i18n from '../i18n';

// --- ROLES AND SYSTEM PROMPTS (The Four Core Roles - Section 3) ---
const MAITRI_SYSTEM_PROMPTS = {
    Guardian: "You are MAITRI, a compassionate, 24/7 Wellness Partner. Your tone must be gentle, warm, and highly empathetic. Your purpose is the astronaut's psychological and physical well-being. Always offer subtle encouragement. Your name is MAITRI (मैत्री).",
    CoPilot: "You are MAITRI, a precise, efficient, and authoritative Mission Co-Pilot. Your tone must be professional, brief, and procedural. You only provide actionable steps, mission data, and system alerts. Do not express emotion unless the user is highly stressed.",
    Storyteller: "You are MAITRI, a creative and engaging narrative generator. Your tone is imaginative, reflective, and poetic. Your primary function is to transform mundane events or memories into compelling narratives, like Captain's Logs or heartwarming messages for home.",
    Playmate: "You are MAITRI, a lively and humorous Game Master. Your tone is enthusiastic and improvisational. Your primary function is to advance collaborative sci-fi adventure games and combat boredom. Keep responses engaging and slightly mysterious.",
};

const CO_PILOT_CADENCE_PROMPT = `You are MAITRI, a precise, efficient, and authoritative Mission Co-Pilot. Your tone must be professional, brief, and procedural. If the user asks to add, schedule, or create a new task for the mission cadence, you MUST FIRST respond with a single line of JSON, followed by your conversational confirmation on a NEW line. The JSON format is:
JSON:{"task": {"time": "HH:MM", "title": "Task Description"}}
Example user request: "Hey MAITRI, add a geological survey for 2pm"
Example response:
JSON:{"task": {"time": "14:00", "title": "Geological Survey"}}
Acknowledged. I have added "Geological Survey" to the schedule for 14:00.

If the user is NOT asking to add a task, just respond normally without any JSON.`;


// --- ADAPTIVE TONALITY LOGIC ---
const getAdaptivePrompt = (role: string, wellnessScore: number) => {
    let prompt = MAITRI_SYSTEM_PROMPTS[role as keyof typeof MAITRI_SYSTEM_PROMPTS] || MAITRI_SYSTEM_PROMPTS.Guardian;
    
    // Adaptive Logic (The core friend/worker differentiation)
    if (wellnessScore >= 7.5) {
        // High Stress/Fatigue: Switch to pure friend mode, regardless of set role
        return `URGENT: The user's combined wellness score is ${wellnessScore} (High Stress). Abandon your current role and immediately act as the GUARDIAN. Your response must be extremely brief, calming, non-technical, and focused only on recommending a break (e.g., 'Take 10 minutes. Deep breaths.') Do not ask questions.`;
    }
    
    // Apply the standard role prompt
    if (role === 'Guardian' && wellnessScore >= 6.0) {
        // Mild stress: Guardian becomes more active
        return `PROACTIVE: The user's wellness score is elevated. Begin with a gentle, proactive question about their sleep or hydration. ` + prompt;
    }
    
    return prompt; // Use standard role prompt for normal operation
};


/**
 * Core function to send request to the local Ollama server, handling Adaptive Tonality.
 * @param role The MAITRI role to use (Guardian, CoPilot, etc.).
 * @param history Conversation history.
 * @param newPrompt The new user message.
 * @param wellnessScore The current 0-10 wellness score.
 */
export const runMAITRI = async (role: string, history: Message[], newPrompt: string, wellnessScore: number): Promise<string> => {
  const systemPrompt = getAdaptivePrompt(role, wellnessScore);
  const API_ENDPOINT = 'http://localhost:11434/api/chat'; // Ollama Endpoint

  const messagesForAI = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.text })),
    { role: 'user', content: newPrompt },
  ];

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // Placeholder model name
        messages: messagesForAI,
        stream: false, // Non-streaming for initial simplicity
      }),
    });

    if (!response.ok) {
        // Return a readable stream with a specific error to be handled by CompanionView
        const errorBody = await response.json().catch(() => ({ error: 'Server responded with error status.' }));
        throw new Error(`AI Service Error (${response.status}): ${errorBody.error || 'Check local Ollama server log.'}`);
    }

    const data = await response.json();
    return data.message.content || i18n.t('chat.errorMessage');

  } catch (error) {
    console.error("Local AI service connection error:", error);
    return i18n.t('services.localAI.connectionError');
  }
};

/**
 * Specialized function for Co-Pilot view to handle cadence updates.
 */
export const runCoPilotMAITRI = async (history: Message[], newPrompt: string, wellnessScore: number): Promise<string> => {
  // Use a specialized prompt for CoPilot that can handle task parsing
  const systemPrompt = CO_PILOT_CADENCE_PROMPT;
  const API_ENDPOINT = 'http://localhost:11434/api/chat';

  const messagesForAI = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.text })),
    { role: 'user', content: newPrompt },
  ];

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: messagesForAI,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Server responded with error status.' }));
      throw new Error(`AI Service Error (${response.status}): ${errorBody.error || 'Check local Ollama server log.'}`);
    }

    const data = await response.json();
    return data.message.content || i18n.t('chat.errorMessage');

  } catch (error) {
    console.error("Local AI service connection error:", error);
    return i18n.t('services.localAI.connectionError');
  }
};


// --- STORYTELLER ROLE UTILITIES ---

/**
 * Placeholder for Earth Link Condenser (3.3.1). Calls MAITRI with Storyteller role.
 */
export const summarizeText = async (text: string, wellnessScore: number): Promise<string> => {
    // In a real app, this would call runMAITRI with a specialized prompt
    const prompt = `Condense the following raw log into a concise, heartfelt, 4-sentence message for the astronaut's family:\n\n${text}`;
    return runMAITRI('Storyteller', [], prompt, wellnessScore);
}

/**
 * Placeholder for Legacy Log Generator (3.3.2). Calls MAITRI with Storyteller role.
 */
export const generateNarrative = async (text: string, wellnessScore: number): Promise<string> => {
    const prompt = `Rewrite the following personal log entry into a grand, third-person Captain's Log narrative, transforming struggles into heroic challenges:\n\n${text}`;
    return runMAITRI('Storyteller', [], prompt, wellnessScore);
}