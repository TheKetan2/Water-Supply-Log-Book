export const todayDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const nowTimeString = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const calcDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;
  if (endMins <= startMins) return "Invalid time range";
  const diff = endMins - startMins;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
};
