import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const STORAGE_KEY = "panchayat_water_entries_v1";
const REMINDER_KEY = "panchayat_water_reminder_v1";

const SCHEME_OPTIONS = ["Independent Water Supply", "Grid Water Supply"];
const YES_NO_OPTIONS = ["Yes", "No"];
const PRESSURE_OPTIONS = ["Low", "Medium", "High"];
const TABS = ["Dashboard", "New Entry", "Records", "Alerts"];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const todayDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const nowTimeString = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const calcDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;
  if (endMins <= startMins) return "Invalid time range";
  const diff = endMins - startMins;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
};

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  const [networkStatus] = useState("Offline-Ready");
  const [form, setForm] = useState({
    date: todayDateString(),
    schemeType: "",
    waterReleased: "",
    startTime: "",
    endTime: "",
    duration: "",
    wardArea: "",
    waterAdequate: "",
    pressureLevel: "",
    issueDescription: "",
    reason: "",
    photoBase64: "",
    latitude: "",
    longitude: ""
  });
  const [reminder, setReminder] = useState({
    enabled: false,
    time: "08:00",
    notificationId: ""
  });

  useEffect(() => {
    loadEntries();
    loadReminder();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, duration: calcDuration(prev.startTime, prev.endTime) }));
  }, [form.startTime, form.endTime]);

  const dashboardStats = useMemo(() => {
    const today = todayDateString();
    const todayEntries = entries.filter((entry) => entry.date === today);
    const todayStatus = todayEntries.some((entry) => entry.waterReleased === "Yes") ? "Yes / होय" : "No / नाही";
    const todayDate = new Date();
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - 6);
    const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(
      start.getDate()
    ).padStart(2, "0")}`;
    const last7 = entries.filter((entry) => entry.date >= startKey && entry.date <= today);
    const noWaterDays = new Set(last7.filter((entry) => entry.waterReleased === "No").map((entry) => entry.date));
    return {
      todayStatus,
      last7Count: last7.length,
      noWaterCount: noWaterDays.size
    };
  }, [entries]);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setEntries(Array.isArray(parsed) ? parsed : []);
    } catch {
      setEntries([]);
    }
  };

  const persistEntries = async (nextEntries) => {
    setEntries(nextEntries);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  };

  const loadReminder = async () => {
    try {
      const raw = await AsyncStorage.getItem(REMINDER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setReminder({
          enabled: Boolean(parsed.enabled),
          time: parsed.time || "08:00",
          notificationId: parsed.notificationId || ""
        });
      }
    } catch {
      return;
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const capturePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      setMessage({ type: "error", text: "Camera permission denied." });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true
    });

    if (result.canceled || !result.assets?.length) return;
    const photo = result.assets[0];
    if (!photo.base64) {
      setMessage({ type: "error", text: "Unable to capture image base64." });
      return;
    }

    updateField("photoBase64", `data:image/jpeg;base64,${photo.base64}`);
    setMessage({ type: "success", text: "Photo captured." });
  };

  const captureGps = async () => {
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    if (!locationPermission.granted) {
      setMessage({ type: "error", text: "Location permission denied." });
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      updateField("latitude", location.coords.latitude.toFixed(6));
      updateField("longitude", location.coords.longitude.toFixed(6));
      setMessage({ type: "success", text: "GPS captured successfully." });
    } catch {
      setMessage({ type: "error", text: "GPS capture failed." });
    }
  };

  const resetForm = () => {
    setForm({
      date: todayDateString(),
      schemeType: "",
      waterReleased: "",
      startTime: "",
      endTime: "",
      duration: "",
      wardArea: "",
      waterAdequate: "",
      pressureLevel: "",
      issueDescription: "",
      reason: "",
      photoBase64: "",
      latitude: "",
      longitude: ""
    });
    setMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    if (!form.date) return "Date is required.";
    if (!form.schemeType) return "Scheme Type is required.";
    if (!form.waterReleased) return "Water Released is required.";
    if (!form.startTime) return "Start Time is required.";
    if (!form.endTime) return "End Time is required.";
    if (!form.duration || form.duration === "Invalid time range") return "Provide valid Start/End time.";
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

  const submitEntry = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    const newEntry = {
      ...form,
      wardArea: form.wardArea.trim(),
      issueDescription: form.issueDescription.trim(),
      reason: form.reason.trim(),
      createdAt: new Date().toISOString()
    };

    const nextEntries = [newEntry, ...entries];
    await persistEntries(nextEntries);
    setMessage({ type: "success", text: "Entry saved successfully." });
    resetForm();
    setActiveTab("Records");
  };

  const exportCsv = async () => {
    if (!entries.length) {
      Alert.alert("No data", "No entries available to export.");
      return;
    }

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
    const csv = [headers.map(escapeCsv).join(","), ...lines].join("\n");

    try {
      const filePath = `${FileSystem.cacheDirectory}panchayat-water-log.csv`;
      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, { mimeType: "text/csv", dialogTitle: "Export Water Log CSV" });
      } else {
        Alert.alert("Exported", `CSV saved at: ${filePath}`);
      }
    } catch {
      Alert.alert("Export failed", "Could not export CSV.");
    }
  };

  const parseTime = (timeValue) => {
    const [hour, minute] = (timeValue || "08:00").split(":").map(Number);
    return {
      hour: Number.isNaN(hour) ? 8 : hour,
      minute: Number.isNaN(minute) ? 0 : minute
    };
  };

  const saveReminder = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        setAlertMessage({ type: "error", text: "Notification permission denied." });
        return;
      }

      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }

      let nextReminder = { ...reminder };
      if (reminder.enabled) {
        const { hour, minute } = parseTime(reminder.time);
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Panchayat Water Reminder",
            body: "Collect today's water supply data."
          },
          trigger: {
            hour,
            minute,
            repeats: true
          }
        });
        nextReminder = { ...nextReminder, notificationId: id };
      } else {
        nextReminder = { ...nextReminder, notificationId: "" };
      }

      setReminder(nextReminder);
      await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(nextReminder));
      setAlertMessage({ type: "success", text: "Daily reminder saved." });
    } catch {
      setAlertMessage({ type: "error", text: "Unable to save reminder." });
    }
  };

  const sendTestAlert = async () => {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      setAlertMessage({ type: "error", text: "Notification permission denied." });
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: "Panchayat Water Reminder", body: "Test alert: collect today's data." },
      trigger: null
    });
    setAlertMessage({ type: "success", text: "Test alert sent." });
  };

  const EntryItem = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.recordTitle}>{item.date}</Text>
        <Text style={[styles.statusPill, item.waterReleased === "Yes" ? styles.okPill : styles.noPill]}>
          {item.waterReleased}
        </Text>
      </View>
      <Text style={styles.recordText}>Scheme: {item.schemeType}</Text>
      <Text style={styles.recordText}>Ward: {item.wardArea}</Text>
      <Text style={styles.recordText}>GPS: {item.latitude}, {item.longitude}</Text>
      {item.photoBase64 ? <Image source={{ uri: item.photoBase64 }} style={styles.thumb} /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Village Panchayat Water Monitor</Text>
        <Text style={styles.headerSubtitle}>ग्रामपंचायत पाणी पुरवठा मॉनिटर</Text>
        <Text style={styles.networkChip}>{networkStatus}</Text>
      </View>

      <View style={styles.body}>
        {activeTab === "Dashboard" ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dashboard / डॅशबोर्ड</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Today Status</Text>
                  <Text style={styles.statValue}>{dashboardStats.todayStatus}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Last 7 Days Entries</Text>
                  <Text style={styles.statValue}>{dashboardStats.last7Count}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>No Water Days</Text>
                  <Text style={styles.statValue}>{dashboardStats.noWaterCount}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : null}

        {activeTab === "New Entry" ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>New Entry / नवीन नोंद</Text>

              <FieldLabel text="Date / तारीख" />
              <TextInput value={form.date} onChangeText={(text) => updateField("date", text)} placeholder="YYYY-MM-DD" style={styles.input} />

              <FieldLabel text="Scheme Type / योजना" />
              <Picker selectedValue={form.schemeType} onValueChange={(value) => updateField("schemeType", value)} style={styles.picker}>
                <Picker.Item label="Select / निवडा" value="" />
                {SCHEME_OPTIONS.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>

              <FieldLabel text="Water Released? / पाणी सोडले?" />
              <Picker selectedValue={form.waterReleased} onValueChange={(value) => updateField("waterReleased", value)} style={styles.picker}>
                <Picker.Item label="Select / निवडा" value="" />
                {YES_NO_OPTIONS.map((option) => (
                  <Picker.Item key={option} label={`${option} / ${option === "Yes" ? "होय" : "नाही"}`} value={option} />
                ))}
              </Picker>

              <FieldLabel text="Start Time / सुरुवात" />
              <TextInput value={form.startTime} onChangeText={(text) => updateField("startTime", text)} placeholder="HH:MM" style={styles.input} />

              <FieldLabel text="End Time / समाप्ती" />
              <TextInput value={form.endTime} onChangeText={(text) => updateField("endTime", text)} placeholder="HH:MM" style={styles.input} />

              <FieldLabel text="Duration / कालावधी" />
              <TextInput value={form.duration} editable={false} style={[styles.input, styles.readOnly]} />

              <FieldLabel text="Ward / Area / वॉर्ड" />
              <TextInput value={form.wardArea} onChangeText={(text) => updateField("wardArea", text)} style={styles.input} />

              <FieldLabel text="Water Adequate? / पुरेसे?" />
              <Picker selectedValue={form.waterAdequate} onValueChange={(value) => updateField("waterAdequate", value)} style={styles.picker}>
                <Picker.Item label="Select / निवडा" value="" />
                {YES_NO_OPTIONS.map((option) => (
                  <Picker.Item key={option} label={`${option} / ${option === "Yes" ? "होय" : "नाही"}`} value={option} />
                ))}
              </Picker>

              <FieldLabel text="Pressure Level / दाब" />
              <Picker selectedValue={form.pressureLevel} onValueChange={(value) => updateField("pressureLevel", value)} style={styles.picker}>
                <Picker.Item label="Select / निवडा" value="" />
                {PRESSURE_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option}
                    label={`${option} / ${option === "Low" ? "कमी" : option === "Medium" ? "मध्यम" : "जास्त"}`}
                    value={option}
                  />
                ))}
              </Picker>

              <FieldLabel text="Issue Description / समस्या" />
              <TextInput
                value={form.issueDescription}
                onChangeText={(text) => updateField("issueDescription", text)}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />

              <FieldLabel text="Reason (No असल्यास आवश्यक) / कारण" />
              <TextInput
                value={form.reason}
                onChangeText={(text) => updateField("reason", text)}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />

              <View style={styles.buttonRow}>
                <ActionButton title="Capture Photo / फोटो" onPress={capturePhoto} />
                <ActionButton title="Capture GPS / GPS" onPress={captureGps} secondary />
              </View>

              {form.photoBase64 ? <Image source={{ uri: form.photoBase64 }} style={styles.preview} /> : null}
              <Text style={styles.gpsText}>
                GPS: {form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : "Not captured"}
              </Text>

              {message.text ? <Text style={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</Text> : null}

              <View style={styles.buttonRow}>
                <ActionButton title="Submit Entry" onPress={submitEntry} />
                <ActionButton title="Reset" onPress={resetForm} secondary />
              </View>
            </View>
          </ScrollView>
        ) : null}

        {activeTab === "Records" ? (
          <View style={styles.recordsContainer}>
            <View style={styles.recordsHeader}>
              <Text style={styles.cardTitle}>Records / नोंदी</Text>
              <ActionButton title="Export CSV" onPress={exportCsv} small />
            </View>
            <FlatList
              data={entries}
              keyExtractor={(item) => item.createdAt}
              renderItem={({ item }) => <EntryItem item={item} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ) : null}

        {activeTab === "Alerts" ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alerts / स्मरण</Text>
              <FieldLabel text="Reminder Time (HH:MM)" />
              <TextInput
                value={reminder.time}
                onChangeText={(text) => setReminder((prev) => ({ ...prev, time: text }))}
                placeholder={nowTimeString()}
                style={styles.input}
              />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enable Daily Reminder</Text>
                <Pressable
                  style={[styles.toggleBtn, reminder.enabled ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => setReminder((prev) => ({ ...prev, enabled: !prev.enabled }))}
                >
                  <Text style={styles.toggleText}>{reminder.enabled ? "ON" : "OFF"}</Text>
                </Pressable>
              </View>

              {alertMessage.text ? (
                <Text style={alertMessage.type === "error" ? styles.errorText : styles.successText}>{alertMessage.text}</Text>
              ) : null}

              <View style={styles.buttonRow}>
                <ActionButton title="Save Reminder" onPress={saveReminder} />
                <ActionButton title="Test Alert" onPress={sendTestAlert} secondary />
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab ? styles.tabButtonActive : null]}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function FieldLabel({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

function ActionButton({ title, onPress, secondary, small }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, secondary ? styles.actionSecondary : styles.actionPrimary, small ? styles.actionSmall : null]}>
      <Text style={[styles.actionText, secondary ? styles.actionSecondaryText : null]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f9ff"
  },
  header: {
    backgroundColor: "#1565c0",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 12
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"
  },
  headerSubtitle: {
    color: "#d8eaff",
    marginTop: 2,
    fontSize: 13
  },
  networkChip: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#0d47a1",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
    fontSize: 12
  },
  body: {
    flex: 1
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 90
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d6e4f5",
    padding: 12
  },
  cardTitle: {
    color: "#0f2a45",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10
  },
  statsGrid: {
    gap: 8
  },
  statCard: {
    backgroundColor: "#eaf2ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e4f5",
    padding: 10
  },
  statLabel: {
    color: "#3e5f82",
    fontSize: 13
  },
  statValue: {
    marginTop: 4,
    color: "#0d47a1",
    fontSize: 20,
    fontWeight: "700"
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: "#1c3551",
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#c6d8ed",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    color: "#102a43"
  },
  readOnly: {
    backgroundColor: "#f0f5fc"
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  picker: {
    borderWidth: 1,
    borderColor: "#c6d8ed",
    borderRadius: 10,
    backgroundColor: "#fff"
  },
  buttonRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  actionPrimary: {
    backgroundColor: "#1565c0"
  },
  actionSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9ab7db"
  },
  actionText: {
    color: "#fff",
    fontWeight: "700"
  },
  actionSecondaryText: {
    color: "#15426f"
  },
  actionSmall: {
    flex: 0
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10
  },
  gpsText: {
    marginTop: 10,
    color: "#204162",
    fontSize: 13
  },
  errorText: {
    marginTop: 10,
    color: "#b00020",
    fontWeight: "600"
  },
  successText: {
    marginTop: 10,
    color: "#12713d",
    fontWeight: "600"
  },
  recordsContainer: {
    flex: 1,
    padding: 14
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  listContent: {
    paddingBottom: 90
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e4f5",
    padding: 10,
    marginBottom: 8
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  recordTitle: {
    color: "#0f2a45",
    fontWeight: "700"
  },
  statusPill: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden"
  },
  okPill: {
    backgroundColor: "#dff5e6",
    color: "#0f7a3f"
  },
  noPill: {
    backgroundColor: "#ffe4e8",
    color: "#b00020"
  },
  recordText: {
    marginTop: 4,
    color: "#2f4f70",
    fontSize: 13
  },
  thumb: {
    marginTop: 8,
    width: 70,
    height: 70,
    borderRadius: 8
  },
  emptyText: {
    textAlign: "center",
    color: "#4a678a",
    marginTop: 24
  },
  toggleRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toggleLabel: {
    color: "#1c3551",
    fontWeight: "600"
  },
  toggleBtn: {
    minWidth: 60,
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  toggleOn: {
    backgroundColor: "#1565c0"
  },
  toggleOff: {
    backgroundColor: "#8faed4"
  },
  toggleText: {
    color: "#fff",
    fontWeight: "700"
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ccddf0",
    backgroundColor: "#fff",
    paddingVertical: 8
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8
  },
  tabButtonActive: {
    backgroundColor: "#e8f0fd",
    borderRadius: 8
  },
  tabText: {
    color: "#4a678a",
    fontWeight: "600",
    fontSize: 12
  },
  tabTextActive: {
    color: "#0d47a1",
    fontWeight: "800"
  }
});
