import { MissionPlan } from '../types';
import { updateMissionPlan } from './missionService';

// Type guard to check if a value is a valid mission status
const isValidStatus = (status: any): status is MissionPlan['status'] => {
    return ['Pending', 'Active', 'Complete', 'Aborted'].includes(status);
};

/**
 * Processes a raw "update packet" from the ground, validates it,
 * constructs a MissionPlan object, and persists it to the database.
 * @param rawPacket - A JSON string containing mission update data.
 * @returns A promise that resolves to true on success, or false on any error.
 */
export const processUpdatePacket = async (rawPacket: string): Promise<boolean> => {
    try {
        const parsedPacket = JSON.parse(rawPacket);

        // Validate the structure and types of the parsed data
        if (typeof parsedPacket.name !== 'string' || !isValidStatus(parsedPacket.newStatus)) {
            throw new Error("Invalid packet data: 'name' must be a string and 'newStatus' must be a valid status.");
        }

        const newPlan: MissionPlan = {
            id: crypto.randomUUID(),
            missionName: parsedPacket.name,
            status: parsedPacket.newStatus,
            lastUpdated: new Date().toISOString(),
            packetData: rawPacket,
        };

        const success = await updateMissionPlan(newPlan);
        return success;

    } catch (error) {
        console.error("Failed to process update packet:", error instanceof Error ? error.message : String(error));
        return false;
    }
};
