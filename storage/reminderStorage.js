import AsyncStorage from "@react-native-async-storage/async-storage";
import { REMINDER_KEY } from "./keys";

const DEFAULT_REMINDER = {
  enabled: false,
  time: "08:00",
  notificationId: ""
};

export const loadReminder = async () => {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    if (!raw) return DEFAULT_REMINDER;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_REMINDER;
    return {
      enabled: Boolean(parsed.enabled),
      time: parsed.time || DEFAULT_REMINDER.time,
      notificationId: parsed.notificationId || ""
    };
  } catch {
    return DEFAULT_REMINDER;
  }
};

export const saveReminder = async (reminder) => {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(reminder));
};

export const defaultReminder = DEFAULT_REMINDER;
