// services/baseStationHandler.ts
import { MissionPlan } from '../types';
import { updateMissionPlan } from './missionDataService';

const isValidStatus = (status: any): status is MissionPlan['status'] => {
    return ['Pending', 'Active', 'Complete', 'Aborted'].includes(status);
};

/**
 * Processes a raw "update packet", validates it, constructs a MissionPlan object,
 * and persists it to the local database.
 * @param rawPacket - A JSON string containing mission update data.
 * @returns A promise that resolves to true on success, or false on any error.
 */
export const processUpdatePacket = async (rawPacket: string): Promise<boolean> => {
    try {
        const parsedPacket = JSON.parse(rawPacket);

        if (typeof parsedPacket.name !== 'string' || !isValidStatus(parsedPacket.newStatus)) {
            throw new Error("Invalid packet data.");
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
        console.error("Failed to process update packet:", error);
        return false;
    }
};
