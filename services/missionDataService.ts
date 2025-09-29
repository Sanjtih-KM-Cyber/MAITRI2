// services/missionDataService.ts
import { MissionPlan } from '../types';
import { saveData, loadData } from './localDBService';

const MISSION_TABLE = 'mission_data';

/**
 * Fetches the current mission plan from the local database.
 * @returns The latest MissionPlan object or null.
 */
export const fetchMissionPlan = async (): Promise<MissionPlan | null> => {
    return await loadData(MISSION_TABLE);
};

/**
 * Saves a mission plan to the local database and notifies the app of the update.
 * @param plan - The MissionPlan object to save.
 * @returns True if successful, false otherwise.
 */
export const updateMissionPlan = async (plan: MissionPlan): Promise<boolean> => {
    try {
        await saveData(MISSION_TABLE, plan);
        // Dispatch a custom event to notify components that the data has changed.
        window.dispatchEvent(new CustomEvent('missionDataUpdated'));
        return true;
    } catch (error) {
        console.error("Error updating mission plan locally:", error);
        return false;
    }
};
