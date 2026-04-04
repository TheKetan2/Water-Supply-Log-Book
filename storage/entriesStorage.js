import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "./keys";

export const loadEntries = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveEntries = async (entries) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};
