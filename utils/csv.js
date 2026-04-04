export const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const buildEntriesCsv = (entries, gpData = []) => {
  const headers = [
    "Date",
    "Gram Panchayat",
    "Village Name",
    "Scheme Type",
    "Water Released",
    "Start Time",
    "End Time",
    "Duration",
    "Ward / Area",
    "Water Adequate",
    "Pressure Level",
    "Issue Description",
    "Reason",
    "Latitude",
    "Longitude",
    "Created At"
  ];

  const lines = entries.map((entry) => {
    // Lookup Names from IDs
    const gp = gpData.find((g) => g.id === entry.gpId);
    const village = gp?.villages?.find((v) => v.id === entry.villageId);
    const gpName = gp?.name || "N/A";
    const villageName = village?.name || entry.villageName || "N/A";

    return [
      entry.date,
      gpName,
      villageName,
      entry.schemeType,
      entry.waterReleased,
      entry.startTime,
      entry.endTime,
      entry.duration,
      entry.wardArea,
      entry.waterAdequate,
      entry.pressureLevel,
      entry.issueDescription,
      entry.reason,
      entry.latitude,
      entry.longitude,
      entry.createdAt
    ]
      .map(escapeCsv)
      .join(",");
  });

  return [headers.map(escapeCsv).join(","), ...lines].join("\n");
};
