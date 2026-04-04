import React from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import FieldLabel from "../components/FieldLabel";
import { PRESSURE_OPTIONS, SCHEME_OPTIONS, YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function NewEntryScreen({ form, message, onChange, onCapturePhoto, onCaptureGps, onSubmit, onReset }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Entry / नवीन नोंद</Text>

        <FieldLabel text="Date / तारीख" />
        <TextInput value={form.date} onChangeText={(text) => onChange("date", text)} placeholder="YYYY-MM-DD" style={styles.input} />

        <FieldLabel text="Village Name / गावाचे नाव" />
        <TextInput value={form.villageName} onChangeText={(text) => onChange("villageName", text)} style={styles.input} />

        <FieldLabel text="Scheme Type / योजना" />
        <CardSelect
          options={SCHEME_OPTIONS}
          selectedValue={form.schemeType}
          onValueChange={(value) => onChange("schemeType", value)}
          labels={{
            "Independent Water Supply": "Independent / स्वतंत्र",
            "Grid Water Supply": "Grid / ग्रीड"
          }}
        />

        <FieldLabel text="Water Released? / पाणी सोडले?" />
        <CardSelect
          options={YES_NO_OPTIONS}
          selectedValue={form.waterReleased}
          onValueChange={(value) => onChange("waterReleased", value)}
          labels={{
            Yes: "Yes / होय",
            No: "No / नाही"
          }}
        />

        <FieldLabel text="Start Time / सुरुवात" />
        <TextInput value={form.startTime} onChangeText={(text) => onChange("startTime", text)} placeholder="HH:MM" style={styles.input} />

        <FieldLabel text="End Time / समाप्ती" />
        <TextInput value={form.endTime} onChangeText={(text) => onChange("endTime", text)} placeholder="HH:MM" style={styles.input} />

        <FieldLabel text="Duration / कालावधी" />
        <TextInput value={form.duration} editable={false} style={[styles.input, styles.readOnly]} />

        <FieldLabel text="Ward / Area / वॉर्ड" />
        <TextInput value={form.wardArea} onChangeText={(text) => onChange("wardArea", text)} style={styles.input} />

        <FieldLabel text="Water Adequate? / पुरेसे?" />
        <CardSelect
          options={YES_NO_OPTIONS}
          selectedValue={form.waterAdequate}
          onValueChange={(value) => onChange("waterAdequate", value)}
          labels={{
            Yes: "Yes / होय",
            No: "No / नाही"
          }}
        />

        <FieldLabel text="Pressure Level / दाब" />
        <CardSelect
          options={PRESSURE_OPTIONS}
          selectedValue={form.pressureLevel}
          onValueChange={(value) => onChange("pressureLevel", value)}
          labels={{
            Low: "Low / कमी",
            Medium: "Medium / मध्यम",
            High: "High / जास्त"
          }}
        />

        <FieldLabel text="Issue Description / समस्या" />
        <TextInput
          value={form.issueDescription}
          onChangeText={(text) => onChange("issueDescription", text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <FieldLabel text="Reason (No असल्यास आवश्यक) / कारण" />
        <TextInput
          value={form.reason}
          onChangeText={(text) => onChange("reason", text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.buttonRow}>
          <ActionButton title="Capture Photo / फोटो" onPress={onCapturePhoto} />
          <ActionButton title="Capture GPS / GPS" onPress={onCaptureGps} secondary />
        </View>

        {form.photoBase64 ? <Image source={{ uri: form.photoBase64 }} style={styles.preview} /> : null}
        <Text style={styles.gpsText}>GPS: {form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : "Not captured"}</Text>

        {message.text ? <Text style={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</Text> : null}

        <View style={styles.buttonRow}>
          <ActionButton title="Submit Entry" onPress={onSubmit} />
          <ActionButton title="Reset" onPress={onReset} secondary />
        </View>
      </View>
    </ScrollView>
  );
}
