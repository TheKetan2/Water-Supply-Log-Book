import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import TabBar from "./components/TabBar";
import Toast from "./components/Toast";
import { TABS } from "./constants/options";
import AlertsScreen from "./screens/AlertsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import GPInfoScreen from "./screens/GPInfoScreen";
import NewEntryScreen from "./screens/NewEntryScreen";
import RecordsScreen from "./screens/RecordsScreen";
import { loadEntries, saveEntries } from "./storage/entriesStorage";
import { defaultGPData, loadGPData, saveGPData as persistGPData } from "./storage/gpStorage";
import { defaultReminder, loadReminder, saveReminder as persistReminder } from "./storage/reminderStorage";
import { styles } from "./styles/appStyles";
import { buildEntriesCsv } from "./utils/csv";
import { calcDuration, nowTimeString, todayDateString } from "./utils/dateTime";
import { createEmptyForm, validateEntryForm } from "./utils/form";
import { translations } from "./constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const parseTime = (timeValue) => {
  const [hour, minute] = (timeValue || "08:00").split(":").map(Number);
  return {
    hour: Number.isNaN(hour) ? 8 : hour,
    minute: Number.isNaN(minute) ? 0 : minute
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [entries, setEntries] = useState([]);
  const [networkStatus] = useState("Offline-Ready");
  const [form, setForm] = useState(createEmptyForm());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [toast, setToast] = useState("");
  const [reminder, setReminder] = useState(defaultReminder);
  const [gpData, setGPData] = useState(defaultGPData);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  const [language, setLanguage] = useState("en");

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, duration: calcDuration(prev.startTime, prev.endTime) }));
  }, [form.startTime, form.endTime]);

  const dashboardStats = useMemo(() => {
    const today = todayDateString();
    const todayEntries = entries.filter((entry) => entry.date === today);
    const todayStatus = todayEntries.some((entry) => entry.waterReleased === "Yes") ? "Yes / होय" : "No / नाही";

    const last7DaysList = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    const last7 = entries.filter((entry) => last7DaysList.includes(entry.date));
    const waterReleasedDays = new Set(last7.filter((entry) => entry.waterReleased === "Yes").map((entry) => entry.date)).size;

    // GP Infrastructure Stats (Aggregated across all GPs)
    let totalPopulation = 0;
    let totalWells = 0;
    let totalBorewells = 0;
    let totalHandpumps = 0;
    let totalPumps = 0;
    let totalROPlants = 0;
    let totalFamilies = 0;
    let totalAnganwadis = 0;
    let totalSchools = 0;
    let totalAnganwadiStudents = 0;
    let totalSchoolStudents = 0;
    let totalROPercentageCount = 0;
    let totalVillages = 0;

    gpData?.forEach((gp) => {
      totalVillages += gp.villages?.length || 0;
      gp.villages?.forEach((v) => {
        totalPopulation += parseInt(v.population || 0, 10);
        totalWells += parseInt(v.wells || 0, 10);
        totalBorewells += parseInt(v.borewells || 0, 10);
        totalHandpumps += parseInt(v.handpumps || 0, 10);
        totalPumps += parseInt(v.solarPumps || 0, 10);
        totalROPlants += parseInt(v.roPlants || 0, 10);
        totalFamilies += parseInt(v.households || 0, 10);
        totalAnganwadis += parseInt(v.anganwadis || 0, 10);
        totalSchools += parseInt(v.schools || 0, 10);
        totalAnganwadiStudents += parseInt(v.anganwadiStudents || 0, 10);
        totalSchoolStudents += parseInt(v.schoolStudents || 0, 10);
        
        const hasRO = parseInt(v.roPlants || 0, 10) > 0 || v.roPresent === "Yes";
        if (hasRO) totalROPercentageCount += 1;
      });
    });

    return {
      todayStatus,
      last7Count: last7.length,
      waterReleasedDays,
      totalGPs: gpData?.length || 0,
      totalVillages,
      totalPopulation,
      totalWells,
      totalBorewells,
      totalHandpumps,
      totalPumps,
      totalROPlants,
      totalFamilies,
      totalAnganwadis,
      totalSchools,
      totalAnganwadiStudents,
      totalSchoolStudents,
      roCoverage: totalVillages ? Math.round((totalROPercentageCount / totalVillages) * 100) : 0
    };
  }, [entries, gpData]);

  const hydrate = async () => {
    const [loadedEntries, loadedReminder, loadedGP, savedLang] = await Promise.all([
        loadEntries(), 
        loadReminder(), 
        loadGPData(),
        AsyncStorage.getItem("app_lang")
    ]);
    setEntries(loadedEntries);
    setReminder(loadedReminder);
    setGPData(loadedGP);
    if (savedLang) setLanguage(savedLang);
  };

  const toggleLanguage = async () => {
    const nextLang = language === "en" ? "mr" : "en";
    setLanguage(nextLang);
    await AsyncStorage.setItem("app_lang", nextLang);
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
      quality: 0.4,
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
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
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
    setForm(createEmptyForm());
    setMessage({ type: "", text: "" });
  };

  const submitEntry = async () => {
    const validationError = validateEntryForm(form, entries);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    const newEntry = {
      ...form,
      wardArea: (form.wardArea || "").trim(),
      issueDescription: (form.issueDescription || "").trim(),
      reason: (form.reason || "").trim(),
      createdAt: new Date().toISOString()
    };

    const nextEntries = [newEntry, ...entries];
    setEntries(nextEntries);
    await saveEntries(nextEntries);

    setToast("Data Saved Successfully ✓");
    resetForm();
    setActiveTab("Records");
  };

  const deleteEntry = async (createdAt) => {
    const nextEntries = entries.filter((e) => e.createdAt !== createdAt);
    setEntries(nextEntries);
    await saveEntries(nextEntries);
    setToast("Record Deleted");
  };

  const exportCsv = async () => {
    if (!entries.length) {
      Alert.alert("No data", "No entries available to export.");
      return;
    }

    try {
      const csv = buildEntriesCsv(entries, gpData);
      const filename = `water_supply_log_${new Date().toISOString().split('T')[0]}.csv`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "text/csv",
          dialogTitle: "Export Water Supply Log",
          UTI: "public.comma-separated-values-text"
        });
      } else {
        Alert.alert("Export Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("CSV Export Failure:", error);
      Alert.alert("Export Failed", "Could not create CSV file. Please check device permissions.");
    }
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
          trigger: { hour, minute, repeats: true }
        });
        nextReminder = { ...nextReminder, notificationId: id };
      } else {
        nextReminder = { ...nextReminder, notificationId: "" };
      }

      setReminder(nextReminder);
      await persistReminder(nextReminder);
      setToast("Reminder Saved ✓");
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
      content: {
        title: "Panchayat Water Reminder",
        body: "Test alert: collect today's data."
      },
      trigger: null
    });
    setAlertMessage({ type: "success", text: "Test alert sent." });
  };

  const saveGPInfo = async (data) => {
    setGPData(data);
    await persistGPData(data);
    setToast("GP Info Saved ✓");
  };

  const exportBackup = async () => {
    try {
      const backupData = {
        app: "panchayat-water-monitor",
        version: "1.2.0",
        timestamp: new Date().toISOString(),
        payload: {
          entries,
          gpData,
          reminder
        }
      };

      const filename = `water_app_backup_${new Date().toISOString().split('T')[0]}.json`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(path, JSON.stringify(backupData, null, 2), { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "application/json",
          dialogTitle: "Export Data Backup",
          UTI: "public.json"
        });
      } else {
        Alert.alert("Export Error", "Sharing is not available.");
      }
    } catch (error) {
      console.error("Backup Export Failure:", error);
      Alert.alert("Export Failed", "Could not create backup file.");
    }
  };

  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets?.length) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backup = JSON.parse(content);

      // Validation
      if (backup.app !== "panchayat-water-monitor" || !backup.payload) {
        Alert.alert("Invalid Backup", "This file is not a valid Water Monitor backup.");
        return;
      }

      Alert.alert(
        "Confirm Restore",
        "This will replace ALL current data with the data from the backup. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Restore Now", 
            style: "destructive",
            onPress: async () => {
              const { entries: nextEntries, gpData: nextGP, reminder: nextRem } = backup.payload;
              
              setEntries(nextEntries || []);
              setGPData(nextGP || []);
              setReminder(nextRem || defaultReminder);

              await Promise.all([
                saveEntries(nextEntries || []),
                persistGPData(nextGP || []),
                persistReminder(nextRem || defaultReminder)
              ]);

              setToast("Data Restored Successfully ✓");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Backup Import Failure:", error);
      Alert.alert("Import Failed", "The file could not be read or is corrupted.");
    }
  };

  const renderScreen = () => {
    if (activeTab === "Dashboard") {
      return <DashboardScreen stats={dashboardStats} gpData={gpData} entries={entries} language={language} t={t} />;
    }

    if (activeTab === "New Entry") {
      return (
        <NewEntryScreen
          form={form}
          message={message}
          onChange={updateField}
          onCapturePhoto={capturePhoto}
          onCaptureGps={captureGps}
          onSubmit={submitEntry}
          onReset={resetForm}
          gpData={gpData}
          language={language}
          t={t}
        />
      );
    }

    if (activeTab === "GP Info") {
      return <GPInfoScreen gpData={gpData} onSave={saveGPInfo} language={language} t={t} />;
    }

    if (activeTab === "Records") {
      return (
        <RecordsScreen
          entries={entries}
          onExport={exportCsv}
          gpData={gpData}
          onDelete={deleteEntry}
          language={language}
          t={t}
        />
      );
    }

    return (
      <AlertsScreen
        reminder={reminder}
        setReminder={setReminder}
        placeholderTime={nowTimeString()}
        message={alertMessage}
        onSave={saveReminder}
        onTest={sendTestAlert}
        onExport={exportBackup}
        onImport={importBackup}
        language={language}
        t={t}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t("headerTitle")}</Text>
          <Text style={styles.headerSubtitle}>{t("headerSubtitle")}</Text>
        </View>
        
        <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
          <Text style={[styles.langToggleText, language === "en" && styles.langToggleActive]}>EN</Text>
          <Text style={styles.langToggleDivider}>|</Text>
          <Text style={[styles.langToggleText, language === "mr" && styles.langToggleActive]}>म</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>{renderScreen()}</View>

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} t={t} />
      <Toast message={toast} onHide={() => setToast("")} />
    </SafeAreaView>
  );
}
