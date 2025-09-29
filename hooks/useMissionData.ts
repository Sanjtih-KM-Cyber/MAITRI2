import { useState, useEffect, useMemo, useCallback } from 'react';
import { MissionPlan, CadenceItem, MissionChecklist } from '../types';
import { fetchMissionPlan } from '../services/missionDataService';

interface MissionData {
  missionPlan: MissionPlan | null;
  missionCadence: CadenceItem[] | null;
  procedureChecklist: MissionChecklist | null;
  isLoading: boolean;
  error: string | null;
}

export const useMissionData = (): MissionData => {
  const [missionPlan, setMissionPlan] = useState<MissionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Set loading to true only if there's no plan yet
    if (!missionPlan) setIsLoading(true);
    try {
      const plan = await fetchMissionPlan();
      setMissionPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mission data');
    } finally {
      setIsLoading(false);
    }
  }, [missionPlan]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up event listener for real-time local updates
    const handleUpdate = () => {
      console.log('Local mission data update detected, refetching...');
      fetchData();
    };

    window.addEventListener('missionDataUpdated', handleUpdate);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('missionDataUpdated', handleUpdate);
    };
  }, [fetchData]);

  const parsedData = useMemo(() => {
    if (!missionPlan || !missionPlan.packetData) {
      return { missionCadence: null, procedureChecklist: null };
    }
    try {
      const packet = JSON.parse(missionPlan.packetData);
      const missionCadence = packet.details?.cadence || null;
      const procedureChecklist = packet.details?.checklist || null;
      return { missionCadence, procedureChecklist };
    } catch (e) {
      console.error("Failed to parse mission packet data:", e);
      setError("Error parsing mission data packet.");
      return { missionCadence: null, procedureChecklist: null };
    }
  }, [missionPlan]);

  return {
    missionPlan,
    ...parsedData,
    isLoading,
    error,
  };
};
