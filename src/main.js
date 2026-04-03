import "./style.css";

const STORAGE_KEY = "panchayat_water_entries_v1";
const REMINDER_KEY = "panchayat_water_reminder_v1";

const appRoot = document.getElementById("app");

appRoot.innerHTML = `
  <header class="top-app-bar">
    <div>
      <h1>ग्रामपंचायत पाणी पुरवठा नोंद</h1>
      <p>Village Panchayat Water Monitor</p>
    </div>
    <div class="install-row">
      <span id="networkStatus" class="chip">Offline Ready</span>
      <button id="installBtn" class="btn-outline hidden" type="button">Install</button>
    </div>
  </header>

  <main class="content">
    <section id="dashboardTab" class="tab-panel">
      <article class="card">
        <h2>Dashboard / डॅशबोर्ड</h2>
        <div class="dashboard-grid">
          <div class="stat-card">
            <p>Today Status</p>
            <strong id="todayStatus">-</strong>
          </div>
          <div class="stat-card">
            <p>Last 7 Days Entries</p>
            <strong id="last7Count">0</strong>
          </div>
          <div class="stat-card">
            <p>No Water Days</p>
            <strong id="noWaterCount">0</strong>
          </div>
        </div>
      </article>
    </section>

    <section id="newEntryTab" class="tab-panel hidden">
      <article class="card">
        <h2>New Entry / नवीन नोंद</h2>
        <form id="waterForm" novalidate>
          <div class="form-grid">
            <label>तारीख / Date<input type="date" id="date" required /></label>

            <label>
              <span class="label-long">योजना प्रकार / Scheme Type</span>
              <span class="label-short">योजना / Scheme</span>
              <select id="schemeType" required>
                <option value="">Select / निवडा</option>
                <option value="Independent Water Supply">Independent Water Supply</option>
                <option value="Grid Water Supply">Grid Water Supply</option>
              </select>
            </label>

            <label>
              <span class="label-long">पाणी सोडले का? / Water Released?</span>
              <span class="label-short">पाणी सोडले? / Released?</span>
              <select id="waterReleased" required>
                <option value="">Select / निवडा</option>
                <option value="Yes">Yes / होय</option>
                <option value="No">No / नाही</option>
              </select>
            </label>

            <label>सुरुवातीची वेळ / Start Time<input type="time" id="startTime" required /></label>
            <label>समाप्तीची वेळ / End Time<input type="time" id="endTime" required /></label>
            <label>कालावधी / Duration<input type="text" id="duration" readonly placeholder="Auto calculated" /></label>
            <label>वॉर्ड / Ward / Area<input type="text" id="wardArea" required maxlength="100" /></label>

            <label>
              <span class="label-long">पाणी पुरेसे? / Water Adequate?</span>
              <span class="label-short">पुरेसे? / Adequate?</span>
              <select id="waterAdequate" required>
                <option value="">Select / निवडा</option>
                <option value="Yes">Yes / होय</option>
                <option value="No">No / नाही</option>
              </select>
            </label>

            <label>
              <span class="label-long">दाब पातळी / Pressure Level</span>
              <span class="label-short">दाब / Pressure</span>
              <select id="pressureLevel" required>
                <option value="">Select / निवडा</option>
                <option value="Low">Low / कमी</option>
                <option value="Medium">Medium / मध्यम</option>
                <option value="High">High / जास्त</option>
              </select>
            </label>

            <label class="full">समस्या / Issue Description
              <textarea id="issueDescription" rows="3" maxlength="300"></textarea>
            </label>

            <label class="full">कारण (No असल्यास आवश्यक) / Reason
              <textarea id="reason" rows="3" maxlength="300"></textarea>
            </label>

            <div class="full">
              <label for="photoInput">फोटो / Photo (Mandatory)</label>
              <input type="file" id="photoInput" accept="image/*" capture="environment" required />
              <img id="photoPreview" class="preview hidden" alt="Photo preview" />
            </div>

            <div class="full gps-row">
              <p id="gpsStatus">GPS: Not captured / पकडलेले नाही</p>
              <button type="button" id="captureGpsBtn" class="btn-outline">Capture GPS</button>
            </div>
          </div>

          <div class="action-row">
            <button class="btn-primary" type="submit">Submit Entry</button>
            <button class="btn-outline" id="resetBtn" type="reset">Reset</button>
          </div>
          <p id="formMessage" class="message" aria-live="polite"></p>
        </form>
      </article>
    </section>

    <section id="recordsTab" class="tab-panel hidden">
      <article class="card">
        <div class="row-between">
          <h2>Records / नोंदी</h2>
          <button id="exportBtn" class="btn-primary" type="button">Download CSV</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Scheme</th>
                <th>Status</th>
                <th>Ward</th>
                <th>Photo</th>
                <th>GPS</th>
              </tr>
            </thead>
            <tbody id="entriesTableBody"></tbody>
          </table>
        </div>
      </article>
    </section>

    <section id="alertsTab" class="tab-panel hidden">
      <article class="card">
        <h2>Alerts / स्मरण</h2>
        <p class="hint">Daily reminder to collect data</p>
        <div class="form-grid">
          <label>Reminder Time<input type="time" id="reminderTime" value="08:00" /></label>
          <label class="switch-label">
            <input type="checkbox" id="enableReminder" /> Enable Daily Reminder
          </label>
        </div>
        <div class="action-row">
          <button type="button" id="saveReminderBtn" class="btn-primary">Save Reminder</button>
          <button type="button" id="testReminderBtn" class="btn-outline">Test Alert</button>
        </div>
        <p id="alertMessage" class="message" aria-live="polite"></p>
      </article>
    </section>
  </main>

  <nav class="bottom-nav" aria-label="Main Tabs">
    <button class="tab-btn active" data-tab="dashboardTab" type="button">Dashboard</button>
    <button class="tab-btn" data-tab="newEntryTab" type="button">New Entry</button>
    <button class="tab-btn" data-tab="recordsTab" type="button">Records</button>
    <button class="tab-btn" data-tab="alertsTab" type="button">Alerts</button>
  </nav>
`;

const form = document.getElementById("waterForm");
const dateInput = document.getElementById("date");
const schemeTypeInput = document.getElementById("schemeType");
const waterReleasedInput = document.getElementById("waterReleased");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const durationInput = document.getElementById("duration");
const wardAreaInput = document.getElementById("wardArea");
const waterAdequateInput = document.getElementById("waterAdequate");
const pressureLevelInput = document.getElementById("pressureLevel");
const issueDescriptionInput = document.getElementById("issueDescription");
const reasonInput = document.getElementById("reason");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const captureGpsBtn = document.getElementById("captureGpsBtn");
const gpsStatus = document.getElementById("gpsStatus");
const formMessage = document.getElementById("formMessage");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const tableBody = document.getElementById("entriesTableBody");
const todayStatusEl = document.getElementById("todayStatus");
const last7CountEl = document.getElementById("last7Count");
const noWaterCountEl = document.getElementById("noWaterCount");
const installBtn = document.getElementById("installBtn");
const networkStatus = document.getElementById("networkStatus");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const reminderTimeInput = document.getElementById("reminderTime");
const enableReminderInput = document.getElementById("enableReminder");
const saveReminderBtn = document.getElementById("saveReminderBtn");
const testReminderBtn = document.getElementById("testReminderBtn");
const alertMessage = document.getElementById("alertMessage");

let photoBase64 = "";
let currentLocation = null;
let deferredInstallPrompt = null;
let reminderTimer = null;

init();

function init() {
  setDefaultDate();
  registerServiceWorker();
  attachEvents();
  updateNetworkStatus();
  switchTab("dashboardTab");
  initReminder();
  renderAll();
}

function attachEvents() {
  startTimeInput.addEventListener("change", updateDuration);
  endTimeInput.addEventListener("change", updateDuration);
  waterReleasedInput.addEventListener("change", toggleReasonRequirement);
  photoInput.addEventListener("change", handlePhotoChange);
  captureGpsBtn.addEventListener("click", captureGPS);
  form.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", handleReset);
  exportBtn.addEventListener("click", exportCSV);
  installBtn.addEventListener("click", installApp);
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  saveReminderBtn.addEventListener("click", saveReminderSettings);
  testReminderBtn.addEventListener("click", testReminder);
  document.addEventListener("visibilitychange", checkReminderDue);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab || "dashboardTab"));
  });
}

function switchTab(tabId) {
  tabPanels.forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabId));
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
}

function initReminder() {
  const settings = getReminderSettings();
  reminderTimeInput.value = settings.time;
  enableReminderInput.checked = settings.enabled;
  maybeRequestNotificationPermission(settings.enabled);
  reminderTimer = window.setInterval(checkReminderDue, 30000);
  checkReminderDue();
}

function getReminderSettings() {
  const defaults = { enabled: false, time: "08:00", lastTriggeredDate: "" };
  try {
    const parsed = JSON.parse(localStorage.getItem(REMINDER_KEY) || "null");
    if (!parsed) return defaults;
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === "string" && parsed.time ? parsed.time : defaults.time,
      lastTriggeredDate: typeof parsed.lastTriggeredDate === "string" ? parsed.lastTriggeredDate : ""
    };
  } catch {
    return defaults;
  }
}

function persistReminderSettings(settings) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

function saveReminderSettings() {
  if (!reminderTimeInput.value) {
    setAlertMessage("Reminder time is required.", true);
    return;
  }

  const settings = getReminderSettings();
  settings.enabled = enableReminderInput.checked;
  settings.time = reminderTimeInput.value;
  persistReminderSettings(settings);
  maybeRequestNotificationPermission(settings.enabled);
  setAlertMessage("Reminder saved for " + settings.time, false);
}

function testReminder() {
  triggerReminder("Test reminder: Please collect today's water supply data.");
  setAlertMessage("Test alert sent.", false);
}

function checkReminderDue() {
  const settings = getReminderSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const today = toDateString(now);
  const currentTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

  if (currentTime !== settings.time || settings.lastTriggeredDate === today) return;

  settings.lastTriggeredDate = today;
  persistReminderSettings(settings);
  triggerReminder("Time to collect today's water supply data.");
}

function triggerReminder(message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Panchayat Water Reminder", {
      body: message,
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    });
    return;
  }
  window.alert(message);
}

function maybeRequestNotificationPermission(enabled) {
  if (!enabled || !("Notification" in window) || Notification.permission !== "default") return;
  Notification.requestPermission().catch(() => null);
}

function setAlertMessage(message, isError) {
  alertMessage.textContent = message;
  alertMessage.className = "message " + (message ? (isError ? "error" : "success") : "");
}

function setDefaultDate() {
  dateInput.value = toDateString(new Date());
}

function toDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateDuration() {
  if (!startTimeInput.value || !endTimeInput.value) {
    durationInput.value = "";
    return;
  }

  const start = timeToMinutes(startTimeInput.value);
  const end = timeToMinutes(endTimeInput.value);
  if (end <= start) {
    durationInput.value = "Invalid time range";
    return;
  }

  const diff = end - start;
  durationInput.value = `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function timeToMinutes(value) {
  const [hh, mm] = value.split(":").map(Number);
  return hh * 60 + mm;
}

function toggleReasonRequirement() {
  if (waterReleasedInput.value === "No") {
    reasonInput.setAttribute("required", "required");
    reasonInput.placeholder = "Reason is mandatory / कारण आवश्यक";
  } else {
    reasonInput.removeAttribute("required");
    reasonInput.placeholder = "Enter reason";
  }
}

function handlePhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    photoBase64 = "";
    photoPreview.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    photoBase64 = String(reader.result || "");
    photoPreview.src = photoBase64;
    photoPreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function captureGPS() {
  if (!("geolocation" in navigator)) {
    setMessage("Geolocation is not supported on this device.", true);
    return;
  }

  gpsStatus.textContent = "GPS: Capturing...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentLocation = {
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6)
      };
      gpsStatus.textContent = `GPS: ${currentLocation.latitude}, ${currentLocation.longitude}`;
      setMessage("GPS captured successfully.", false);
    },
    (err) => {
      currentLocation = null;
      gpsStatus.textContent = "GPS: Not captured / पकडलेले नाही";
      setMessage("GPS capture failed: " + err.message, true);
    },
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

function handleSubmit(event) {
  event.preventDefault();
  setMessage("", false);
  updateDuration();
  toggleReasonRequirement();

  const entry = collectFormData();
  const error = validateEntry(entry);
  if (error) {
    setMessage(error, true);
    return;
  }

  const entries = getEntries();
  const duplicate = entries.some((item) => item.date === entry.date && item.schemeType === entry.schemeType);
  if (duplicate) {
    setMessage("Duplicate blocked: same Date + Scheme already exists.", true);
    return;
  }

  entries.push(entry);
  saveEntries(entries);
  renderAll();
  setMessage("Entry saved successfully.", false);
  hardResetForm();
  switchTab("recordsTab");
}

function collectFormData() {
  return {
    id: "id_" + Date.now(),
    date: dateInput.value.trim(),
    schemeType: schemeTypeInput.value,
    waterReleased: waterReleasedInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    duration: durationInput.value,
    wardArea: wardAreaInput.value.trim(),
    waterAdequate: waterAdequateInput.value,
    pressureLevel: pressureLevelInput.value,
    issueDescription: issueDescriptionInput.value.trim(),
    reason: reasonInput.value.trim(),
    photoBase64,
    latitude: currentLocation?.latitude || "",
    longitude: currentLocation?.longitude || "",
    createdAt: new Date().toISOString()
  };
}

function validateEntry(entry) {
  if (!entry.date) return "Date is required.";
  if (!entry.schemeType) return "Scheme Type is required.";
  if (!entry.waterReleased) return "Water Released status is required.";
  if (!entry.startTime) return "Start Time is required.";
  if (!entry.endTime) return "End Time is required.";
  if (!entry.duration || entry.duration === "Invalid time range") return "Provide valid Start/End time.";
  if (!entry.wardArea) return "Ward/Area is required.";
  if (!entry.waterAdequate) return "Water Adequate is required.";
  if (!entry.pressureLevel) return "Pressure Level is required.";
  if (entry.waterReleased === "No" && !entry.reason) return "Reason is mandatory when Water Released = No.";
  if (!entry.photoBase64) return "Photo is mandatory before submission.";
  if (!entry.latitude || !entry.longitude) return "GPS is required. Please capture location.";
  return "";
}

function hardResetForm() {
  form.reset();
  setDefaultDate();
  durationInput.value = "";
  photoBase64 = "";
  currentLocation = null;
  photoPreview.classList.add("hidden");
  photoPreview.removeAttribute("src");
  gpsStatus.textContent = "GPS: Not captured / पकडलेले नाही";
  toggleReasonRequirement();
}

function handleReset() {
  window.setTimeout(() => {
    setDefaultDate();
    durationInput.value = "";
    photoBase64 = "";
    currentLocation = null;
    photoPreview.classList.add("hidden");
    photoPreview.removeAttribute("src");
    gpsStatus.textContent = "GPS: Not captured / पकडलेले नाही";
    toggleReasonRequirement();
    setMessage("", false);
  }, 0);
}

function setMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.className = "message " + (message ? (isError ? "error" : "success") : "");
}

function getEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderAll() {
  const entries = getEntries();
  renderDashboard(entries);
  renderTable(entries);
}

function renderDashboard(entries) {
  const today = toDateString(new Date());
  const todayEntries = entries.filter((entry) => entry.date === today);
  const todayStatus = todayEntries.some((entry) => entry.waterReleased === "Yes") ? "Yes / होय" : "No / नाही";

  const last7Start = new Date();
  last7Start.setDate(last7Start.getDate() - 6);
  const startString = toDateString(last7Start);

  const last7Entries = entries.filter((entry) => entry.date >= startString && entry.date <= today);
  const noWaterDays = new Set(last7Entries.filter((entry) => entry.waterReleased === "No").map((entry) => entry.date));

  todayStatusEl.textContent = todayStatus;
  last7CountEl.textContent = String(last7Entries.length);
  noWaterCountEl.textContent = String(noWaterDays.size);
}

function renderTable(entries) {
  if (!entries.length) {
    tableBody.innerHTML = '<tr><td colspan="6">No entries yet.</td></tr>';
    return;
  }

  const sorted = entries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  tableBody.innerHTML = sorted
    .map((entry) => {
      const gps = entry.latitude && entry.longitude ? `${entry.latitude}, ${entry.longitude}` : "-";
      const photo = entry.photoBase64 ? `<img src="${escapeHtml(entry.photoBase64)}" alt="thumbnail" />` : "-";
      return `<tr>
        <td>${escapeHtml(entry.date)}</td>
        <td>${escapeHtml(entry.schemeType)}</td>
        <td>${escapeHtml(entry.waterReleased)}</td>
        <td>${escapeHtml(entry.wardArea)}</td>
        <td>${photo}</td>
        <td>${escapeHtml(gps)}</td>
      </tr>`;
    })
    .join("");
}

function exportCSV() {
  const entries = getEntries();
  if (!entries.length) {
    setMessage("No entries available to export.", true);
    return;
  }

  const headers = [
    "Date", "Scheme Type", "Water Released", "Start Time", "End Time", "Duration", "Ward/Area",
    "Water Adequate", "Pressure Level", "Issue Description", "Reason", "Latitude", "Longitude", "Photo Base64", "Created At"
  ];

  const rows = entries.map((e) => [
    e.date, e.schemeType, e.waterReleased, e.startTime, e.endTime, e.duration, e.wardArea, e.waterAdequate,
    e.pressureLevel, e.issueDescription, e.reason, e.latitude, e.longitude, e.photoBase64, e.createdAt
  ]);

  const csv = [headers, ...rows].map((line) => line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "panchayat-water-log.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setMessage("CSV downloaded successfully.", false);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateNetworkStatus() {
  networkStatus.textContent = navigator.onLine ? "Online" : "Offline";
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.classList.remove("hidden");
}

async function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } finally {
    deferredInstallPrompt = null;
    installBtn.classList.add("hidden");
  }
}

function handleAppInstalled() {
  deferredInstallPrompt = null;
  installBtn.classList.add("hidden");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => {
        if (!navigator.serviceWorker.controller) {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (sessionStorage.getItem("sw_reloaded_once") === "1") return;
            sessionStorage.setItem("sw_reloaded_once", "1");
            window.location.reload();
          });
        }
      })
      .catch(() => null);
  }
}

window.addEventListener("beforeunload", () => {
  if (reminderTimer) window.clearInterval(reminderTimer);
});
