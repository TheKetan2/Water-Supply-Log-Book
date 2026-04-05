import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActionButton from "../components/ActionButton";
import FieldLabel from "../components/FieldLabel";
import { styles } from "../styles/appStyles";

export default function AlertsScreen({ reminder, setReminder, placeholderTime, message, onSave, onTest, onExport, onImport, language, t }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("tabAlerts")}</Text>
        <FieldLabel text={t("labelReminderTime")} />
        <TextInput
          value={reminder.time}
          onChangeText={(text) => setReminder((prev) => ({ ...prev, time: text }))}
          placeholder={placeholderTime}
          style={styles.input}
        />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t("labelEnableReminder")}</Text>
          <Pressable
            style={[styles.toggleBtn, reminder.enabled ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setReminder((prev) => ({ ...prev, enabled: !prev.enabled }))}
          >
            <Text style={styles.toggleText}>{reminder.enabled ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>

        {message.text ? <Text style={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</Text> : null}

        <View style={styles.buttonRow}>
          <ActionButton title={t("btnSaveReminder")} onPress={onSave} style={styles.actionFlex} />
          <ActionButton title={t("btnTestAlert")} onPress={onTest} secondary style={styles.actionFlex} />
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeader}>{t("titleBackup")}</Text>
          <View style={styles.statCard}>
            <Text style={{ color: "#546e7a", fontSize: 13, marginBottom: 15, textAlign: "center" }}>
              {t("descBackup")}
            </Text>
            <View style={styles.buttonRow}>
              <ActionButton title={t("btnExportBackup")} onPress={onExport} style={styles.actionFlex} />
              <ActionButton title={t("btnImportBackup")} onPress={onImport} secondary style={styles.actionFlex} />
            </View>
          </View>
        </View>
        
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeader}>{t("titleAbout")}</Text>
          <View style={[styles.statCard, { alignItems: 'center', paddingVertical: 20 }]}>
            <Text style={styles.recordTitle}>{t("appName")}</Text>
            <Text style={{ color: '#78909c', fontSize: 12, marginTop: 4 }}>{t("appVersion")}</Text>
            
            <View style={[styles.aboutFooter, { marginTop: 15, borderTopWidth: 1.5 }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.aboutText}>Vibecoded By </Text>
                <MaterialCommunityIcons name="github" size={14} color="#b0bec5" style={{ marginHorizontal: 2 }} />
                <Text style={styles.aboutText}>TheKetan2</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
