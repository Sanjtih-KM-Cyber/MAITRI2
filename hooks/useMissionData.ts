import { useState, useEffect } from 'react';
import { MissionChecklist, CadenceItem } from '../types';

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
    const loadMissionData = async () => {
      try {
        const response = await fetch('/data/missionDataPacket.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const missionPacket = await response.json();
        
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
        console.error("Failed to fetch or parse mission packet data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMissionData();
  }, []);

  return { ...data, isLoading };
};