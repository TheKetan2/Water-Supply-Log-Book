import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const generateRecordHtml = (item, gpData = [], includePhoto = true) => {
  const gp = gpData.find((g) => g.id === item.gpId);
  const village = gp?.villages?.find((v) => v.id === item.villageId);
  const gpName = gp?.name || "N/A";
  const villageName = village?.name || item.villageName || "N/A";

  const showPhoto = includePhoto && item.photoBase64;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { margin: 15mm; }
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 0; width: 100%; }
          .header { text-align: center; border-bottom: 3px solid #1565c0; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #1565c0; margin: 0; font-size: 20pt; text-transform: uppercase; }
          .header p { margin: 4px 0; color: #666; font-size: 10pt; }
          
          .section-title { 
            background-color: #f0f4f8; 
            color: #1565c0; 
            font-weight: bold; 
            padding: 8px 12px; 
            font-size: 12pt; 
            margin: 15px 0 8px 0;
            border-left: 5px solid #1565c0;
          }

          table { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
          td { padding: 6px 0; border-bottom: 1px solid #eee; font-size: 10pt; vertical-align: top; }
          .label { font-weight: bold; color: #546e7a; width: 35%; }
          .value { color: #000; width: 65%; word-wrap: break-word; }

          .box { padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; font-size: 10pt; }
          .photo-container { margin-top: 20px; text-align: center; page-break-inside: avoid; }
          .photo { max-width: 90%; height: auto; border-radius: 4px; border: 1px solid #1565c0; margin-top: 5px; }
          
          .footer { margin-top: 30px; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 8pt; font-weight: bold; color: #78909c; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
            <span style="margin-right: 4px;">Vibecoded By</span>
            <svg height="12" width="12" viewBox="0 0 16 16" style="fill: #78909c; margin-right: 4px; vertical-align: middle;">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            <span>TheKetan2</span>
          </div>
          <h1>Water Supply Report</h1>
          <p>Gram Panchayat Monitoring System</p>
          <p>Ref: ${item.date} | GP: ${gpName}</p>
        </div>

        <div class="section-title">Record Details</div>
        <table>
          <tr><td class="label">Date</td><td class="value">${item.date}</td></tr>
          <tr><td class="label">Gram Panchayat</td><td class="value">${gpName}</td></tr>
          <tr><td class="label">Village Name</td><td class="value">${villageName}</td></tr>
          <tr><td class="label">Ward / Area</td><td class="value">${item.wardArea || 'N/A'}</td></tr>
        </table>

        <div class="section-title">Supply Statistics</div>
        <table>
          <tr><td class="label">Scheme</td><td class="value">${item.schemeType}</td></tr>
          <tr><td class="label">Released?</td><td class="value">${item.waterReleased}</td></tr>
          <tr><td class="label">Timing</td><td class="value">${item.startTime} - ${item.endTime}</td></tr>
          <tr><td class="label">Duration</td><td class="value">${item.duration}</td></tr>
          <tr><td class="label">Adequate?</td><td class="value">${item.waterAdequate}</td></tr>
          <tr><td class="label">Pressure</td><td class="value">${item.pressureLevel}</td></tr>
        </table>

        ${item.reason ? `
          <div class="section-title">Reason for Issue</div>
          <div class="box">${item.reason}</div>
        ` : ''}

        ${item.issueDescription ? `
          <div class="section-title">Additional Notes</div>
          <div class="box">${item.issueDescription}</div>
        ` : ''}

        <div class="section-title">GPS Verification</div>
        <table>
          <tr><td class="label">Latitude</td><td class="value">${item.latitude}</td></tr>
          <tr><td class="label">Longitude</td><td class="value">${item.longitude}</td></tr>
        </table>

        ${showPhoto ? `
          <div class="photo-container">
            <div style="font-weight: bold; color: #1565c0; font-size: 10pt;">EVIDENCE PHOTO</div>
            <img src="${item.photoBase64}" class="photo" />
          </div>
        ` : (item.photoBase64 ? '<div style="margin-top: 20px; color: #666; font-size: 9pt; font-style: italic;">[Photo omitted to save memory]</div>' : '')}

        <div class="footer">
          <div>Digitally generated on ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `;
};

export const shareRecordPdf = async (item, gpData) => {
  try {
    const html = generateRecordHtml(item, gpData, true);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Standard PDF failed, trying lightweight version...", error);
    try {
        // Fallback: Generate without photo if memory was the issue
        const htmlFallback = generateRecordHtml(item, gpData, false);
        const { uri } = await Print.printToFileAsync({ html: htmlFallback });
        await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (finalError) {
        alert("Fatal PDF Error: Device storage is full or out of memory.");
    }
  }
};
