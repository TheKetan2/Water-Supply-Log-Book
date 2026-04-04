import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import ActionButton from "../components/ActionButton";
import FieldLabel from "../components/FieldLabel";
import { styles } from "../styles/appStyles";

export default function AlertsScreen({ reminder, setReminder, placeholderTime, message, onSave, onTest }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alerts / स्मरण</Text>
        <FieldLabel text="Reminder Time (HH:MM)" />
        <TextInput
          value={reminder.time}
          onChangeText={(text) => setReminder((prev) => ({ ...prev, time: text }))}
          placeholder={placeholderTime}
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

        {message.text ? <Text style={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</Text> : null}

        <View style={styles.buttonRow}>
          <ActionButton title="Save Reminder" onPress={onSave} />
          <ActionButton title="Test Alert" onPress={onTest} secondary />
        </View>
      </View>
    </ScrollView>
  );
}
