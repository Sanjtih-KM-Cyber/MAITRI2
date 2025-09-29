import { useState, useEffect } from 'react';
import { MissionChecklist, CadenceItem } from '../types';
import missionPacket from '../data/missionDataPacket.json';

interface MissionData {
  missionCadence: CadenceItem[] | null;
  procedureChecklist: MissionChecklist | null;
  isLoading: boolean;
  error: string | null;
}

export const useMissionData = (): MissionData => {
  const [data, setData] = useState<Omit<MissionData, 'isLoading'>>({
      missionCadence: null,
      procedureChecklist: null,
      error: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading of static data
    setTimeout(() => {
      try {
        const cadence: CadenceItem[] = missionPacket.details.cadence;
        const checklist: MissionChecklist = missionPacket.details.checklist;

        setData({
          procedureChecklist: checklist,
          missionCadence: cadence,
          error: null,
        });
      } catch (e) {
        setData({
          procedureChecklist: null,
          missionCadence: null,
          error: 'Failed to load static mission data.',
        });
        console.error("Failed to parse mission packet data:", e);
      } finally {
        setIsLoading(false);
      }
    }, 500); // simulate network delay
  }, []);

  return { ...data, isLoading };
};
