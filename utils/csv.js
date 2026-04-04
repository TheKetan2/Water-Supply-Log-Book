export const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const buildEntriesCsv = (entries) => {
  const headers = [
    "Date",
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
    "Photo Base64",
    "Created At"
  ];

  const lines = entries.map((entry) =>
    [
      entry.date,
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
      entry.photoBase64,
      entry.createdAt
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [headers.map(escapeCsv).join(","), ...lines].join("\n");
};
