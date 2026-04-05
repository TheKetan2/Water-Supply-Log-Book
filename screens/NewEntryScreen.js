import React, { useMemo } from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import FieldLabel from "../components/FieldLabel";
import { PRESSURE_OPTIONS, SCHEME_OPTIONS, YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function NewEntryScreen({
  form,
  message,
  onChange,
  onCapturePhoto,
  onCaptureGps,
  onSubmit,
  onReset,
  gpData = [],
  language,
  t
}) {
  const safeGPData = Array.isArray(gpData) ? gpData : [];

  const gpLabels = useMemo(() => {
    const labels = {};
    safeGPData.forEach(g => { labels[g.id] = g.name; });
    return labels;
  }, [safeGPData]);

  const villageLabels = useMemo(() => {
    const labels = {};
    const currentGP = safeGPData.find(g => g.id === form.gpId);
    currentGP?.villages?.forEach(v => { labels[v.id] = v.name; });
    return labels;
  }, [safeGPData, form.gpId]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("tabNewEntry")}</Text>

        <FieldLabel text="Date" />
        <TextInput value={form.date} onChangeText={(text) => onChange("date", text)} placeholder="YYYY-MM-DD" style={styles.input} />

        <FieldLabel text={t("labelGP")} />
        <CardSelect
          options={safeGPData.map((g) => g.id)}
          selectedValue={form.gpId}
          onValueChange={(val) => {
            onChange("gpId", val);
            onChange("villageId", "");
          }}
          labels={gpLabels}
        />

        {form.gpId ? (
          <>
            <FieldLabel text={t("labelVillage")} />
            <CardSelect
              options={safeGPData.find((g) => g.id === form.gpId)?.villages?.map((v) => v.id) || []}
              selectedValue={form.villageId}
              onValueChange={(val) => onChange("villageId", val)}
              labels={villageLabels}
            />
          </>
        ) : null}

        <FieldLabel text={t("labelScheme")} />
        <CardSelect
          options={SCHEME_OPTIONS}
          selectedValue={form.schemeType}
          onValueChange={(value) => onChange("schemeType", value)}
          labels={{
            "Independent Water Supply": language === "mr" ? "स्वतंत्र" : "Independent",
            "Grid Water Supply": language === "mr" ? "ग्रीड" : "Grid"
          }}
        />

        <FieldLabel text={t("labelWaterReleased")} />
        <CardSelect
          options={YES_NO_OPTIONS}
          selectedValue={form.waterReleased}
          onValueChange={(value) => onChange("waterReleased", value)}
          labels={{
            Yes: t("yes"),
            No: t("no")
          }}
        />

        <FieldLabel text={t("labelStartTime")} />
        <TextInput value={form.startTime} onChangeText={(text) => onChange("startTime", text)} placeholder="HH:MM" style={styles.input} />

        <FieldLabel text={t("labelEndTime")} />
        <TextInput value={form.endTime} onChangeText={(text) => onChange("endTime", text)} placeholder="HH:MM" style={styles.input} />

        <FieldLabel text={t("labelDuration")} />
        <TextInput value={form.duration} editable={false} style={[styles.input, styles.readOnly]} />

        <FieldLabel text={t("labelWardArea")} />
        <TextInput value={form.wardArea} onChangeText={(text) => onChange("wardArea", text)} style={styles.input} />

        <FieldLabel text={t("labelAdequacy")} />
        <CardSelect
          options={YES_NO_OPTIONS}
          selectedValue={form.waterAdequate}
          onValueChange={(value) => onChange("waterAdequate", value)}
          labels={{
            Yes: t("yes"),
            No: t("no")
          }}
        />

        <FieldLabel text={t("labelPressure")} />
        <CardSelect
          options={PRESSURE_OPTIONS}
          selectedValue={form.pressureLevel}
          onValueChange={(value) => onChange("pressureLevel", value)}
          labels={{
            Low: language === "mr" ? "कमी" : "Low",
            Medium: language === "mr" ? "मध्यम" : "Medium",
            High: language === "mr" ? "जास्त" : "High"
          }}
        />

        <FieldLabel text={t("labelIssueDescription")} />
        <TextInput
          value={form.issueDescription}
          onChangeText={(text) => onChange("issueDescription", text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <FieldLabel text={t("labelReason")} />
        <TextInput
          value={form.reason}
          onChangeText={(text) => onChange("reason", text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.buttonRow}>
          <ActionButton title="Take Photo" onPress={onCapturePhoto} style={styles.actionFlex} />
          <ActionButton title={t("btnCaptureGPS")} onPress={onCaptureGps} secondary style={styles.actionFlex} />
        </View>

        {form.photoBase64 ? <Image source={{ uri: form.photoBase64 }} style={styles.preview} /> : null}
        <Text style={styles.gpsText}>GPS: {form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : "Not captured"}</Text>

        {message.text ? <Text style={message.type === "error" ? styles.errorText : styles.successText}>{message.text}</Text> : null}

        <View style={styles.buttonRow}>
          <ActionButton title={t("btnSubmit")} onPress={onSubmit} style={styles.actionFlex} />
          <ActionButton title={t("btnReset")} onPress={onReset} secondary style={styles.actionFlex} />
        </View>
      </View>
    </ScrollView>
  );
}
