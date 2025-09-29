// services/missionService.ts
// Manually define the type for `import.meta.env` to resolve TypeScript errors
// related to Vite environment variables. As this is a module, `declare global` is
// required to augment the global `ImportMeta` type.
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Change to a namespace import because the UMD module loaded from the CDN
// does not provide named exports. This resolves the runtime error "The requested
// module '@supabase/supabase-js' does not provide an export named 'createClient'".
import * as supabaseJs from '@supabase/supabase-js';
import { MissionPlan } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anonymous key must be provided in environment variables.");
}

export const supabase: supabaseJs.SupabaseClient = supabaseJs.createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches the current (most recent) mission plan from the database.
 * @returns The latest MissionPlan object or null if none is found or an error occurs.
 */
export const fetchMissionPlan = async (): Promise<MissionPlan | null> => {
    const { data, error } = await supabase
        .from('mission_data')
        .select('*')
        .order('lastUpdated', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching mission plan:", error.message);
        return null;
    }

    return data;
};

/**
 * Inserts or updates a mission plan in the database.
 * @param plan - The MissionPlan object to save.
 * @returns True if the operation was successful, false otherwise.
 */
export const updateMissionPlan = async (plan: MissionPlan): Promise<boolean> => {
    const { error } = await supabase
        .from('mission_data')
        .upsert(plan);

    if (error) {
        console.error("Error updating mission plan:", error.message);
        return false;
    }

    return true;
};

/**
 * Subscribes to real-time updates on the mission_data table.
 * @param callback - A function to be called with the new payload when an update occurs.
 * @returns A function to unsubscribe from the channel.
 */
export const subscribeToMissionUpdates = (callback: (payload: any) => void): (() => void) => {
    const channel: supabaseJs.RealtimeChannel = supabase.channel('mission_data_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_data' }, payload => {
            console.log('Mission data change received!', payload);
            callback(payload);
        })
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscribed to mission data updates.');
            }
            if (status === 'CHANNEL_ERROR') {
                console.error('Subscription Error:', err);
            }
        });

    return () => {
        supabase.removeChannel(channel);
    };
};