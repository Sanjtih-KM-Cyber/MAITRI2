import { loadData, saveData } from './localDBService';
import { Message, View } from '../types';

const TABLE_NAME = 'chat_history';

/**
 * Retrieves the chat history for a specific persona from local storage.
 * @param persona - The persona ('chat', 'coPilot', 'playmate') to fetch history for.
 * @returns A promise that resolves to an array of Message objects.
 */
export const getChatHistory = async (persona: View): Promise<Message[]> => {
    // Add parentheses to correctly type `allHistory` as an array of objects that are `Message & { persona: View }`.
    // Without parentheses, it was incorrectly parsed as an intersection of `Message` and an array of ` { persona: View }`.
    const allHistory: (Message & { persona: View })[] = await loadData(TABLE_NAME) || [];
    
    // Filter history by the requested persona
    const personaHistory = allHistory.filter(msg => msg.persona === persona);

    // Return the last 20 messages for that persona
    return personaHistory.slice(-20);
};

/**
 * Saves a new chat message to local storage.
 * @param message - The message object to save.
 * @param persona - The persona associated with the message.
 * @returns A promise that resolves when the operation is complete.
 */
export const saveChatMessage = async (message: Message, persona: View): Promise<void> => {
    const messageToSave = {
        ...message,
        persona: persona,
    };
    await saveData(TABLE_NAME, messageToSave);
};