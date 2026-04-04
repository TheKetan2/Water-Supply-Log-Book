import { todayDateString } from "./dateTime";

export const createEmptyForm = () => ({
  date: todayDateString(),
  schemeType: "",
  waterReleased: "",
  startTime: "",
  endTime: "",
  duration: "",
  wardArea: "",
  waterAdequate: "",
  reason: "",
  gpId: "",
  villageId: "",
  photoBase64: "",
  latitude: "",
  longitude: ""
});

export const validateEntryForm = (form, entries) => {
  if (!form.date) return "Date is required.";
  if (!form.schemeType) return "Scheme Type is required.";
  if (!form.waterReleased) return "Water Released is required.";
  if (!form.startTime) return "Start Time is required.";
  if (!form.endTime) return "End Time is required.";
  if (!form.duration || form.duration === "Invalid time range") return "Provide valid Start/End time.";
  if (!form.gpId) return "GP Selection is required.";
  if (!form.villageId) return "Village Selection is required.";
  if (!form.wardArea.trim()) return "Ward / Area is required.";
  if (!form.waterAdequate) return "Water Adequate is required.";
  if (!form.pressureLevel) return "Pressure Level is required.";
  if (form.waterReleased === "No" && !form.reason.trim()) return "Reason is mandatory when Water Released = No.";
  if (!form.photoBase64) return "Photo is mandatory before submit.";
  if (!form.latitude || !form.longitude) return "GPS is mandatory before submit.";

  const duplicate = entries.some((entry) => entry.date === form.date && entry.schemeType === form.schemeType);
  if (duplicate) return "Duplicate blocked for same date + scheme.";

  return "";
};
