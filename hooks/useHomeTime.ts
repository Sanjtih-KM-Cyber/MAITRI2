import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { TimeOfDay } from '../types';

export const useHomeTime = () => {
    const { homeTimeZone } = useSettings();
    const [homeTime, setHomeTime] = useState(new Date());
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: homeTimeZone,
                hour: 'numeric',
                hour12: false,
            });
            
            const currentHour = parseInt(formatter.format(now), 10);
            
            let newTimeOfDay: TimeOfDay = 'night';
            if (currentHour >= 5 && currentHour < 7) {
                newTimeOfDay = 'dawn';
            } else if (currentHour >= 7 && currentHour < 12) {
                newTimeOfDay = 'morning';
            } else if (currentHour >= 12 && currentHour < 17) {
                newTimeOfDay = 'afternoon';
            } else if (currentHour >= 17 && currentHour < 19) {
                newTimeOfDay = 'dusk';
            }

            // This check is crucial, but it only works if the `timeOfDay` variable
            // it's comparing against is not from a stale closure.
            if (newTimeOfDay !== timeOfDay) {
                setTimeOfDay(newTimeOfDay);
            }
            
            setHomeTime(now);
        };

        calculateTime(); 
        const intervalId = setInterval(calculateTime, 60000); 

        return () => clearInterval(intervalId);
    // FIX: Added `timeOfDay` to the dependency array. This is critical.
    // It ensures the effect re-runs when the time of day changes, creating a new
    // `calculateTime` function with the latest state and preventing a stale closure.
    }, [homeTimeZone, timeOfDay]);

    return { homeTime, timeOfDay };
};