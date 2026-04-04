import AsyncStorage from "@react-native-async-storage/async-storage";
import { GP_DATA_KEY } from "./keys";

export const defaultGPData = [];

export const loadGPData = async () => {
  try {
    const raw = await AsyncStorage.getItem(GP_DATA_KEY);
    if (!raw) return defaultGPData;
    const parsed = JSON.parse(raw);
    
    // Migration: If old data was a single GP object, wrap it in an array
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (parsed.gpName || parsed.villages?.length) {
        return [{ id: Date.now().toString(), name: parsed.gpName, villages: parsed.villages || [] }];
      }
      return defaultGPData;
    }
    
    return Array.isArray(parsed) ? parsed : defaultGPData;
  } catch {
    return defaultGPData;
  }
};

export const saveGPData = async (data) => {
  try {
    await AsyncStorage.setItem(GP_DATA_KEY, JSON.stringify(data));
  } catch {
    // Error saving data
  }
};
