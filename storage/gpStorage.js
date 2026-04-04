import AsyncStorage from "@react-native-async-storage/async-storage";
import { GP_DATA_KEY } from "./keys";

export const defaultGPData = {
  gpName: "",
  villages: []
};

export const loadGPData = async () => {
  try {
    const raw = await AsyncStorage.getItem(GP_DATA_KEY);
    return raw ? JSON.parse(raw) : defaultGPData;
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
