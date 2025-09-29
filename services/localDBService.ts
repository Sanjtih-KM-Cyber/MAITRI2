// services/localDBService.ts

type TableName = 'mission_data' | 'chat_history';

/**
 * Saves data to a specified table in localStorage.
 * For 'chat_history', it appends to an existing array.
 * For 'mission_data', it overwrites the existing data.
 * @param table - The name of the table ('mission_data' or 'chat_history').
 * @param data - The data to save.
 * @returns A promise that resolves when the data is saved.
 */
export const saveData = async (table: TableName, data: any): Promise<void> => {
  try {
    if (table === 'chat_history') {
      const existingHistory = await loadData('chat_history') || [];
      const newHistory = [...existingHistory, data];
      localStorage.setItem(table, JSON.stringify(newHistory));
    } else {
      // For mission_data, we just overwrite.
      localStorage.setItem(table, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Error saving data to ${table}:`, error);
  }
};

/**
 * Loads data from a specified table in localStorage.
 * @param table - The name of the table to load from.
 * @returns A promise that resolves with the parsed data, or null if not found or an error occurs.
 */
export const loadData = async (table: TableName): Promise<any | null> => {
  try {
    const rawData = localStorage.getItem(table);
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error(`Error loading data from ${table}:`, error);
    return null;
  }
};
