import React from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { styles } from "../styles/appStyles";

export default function EntryCard({ item, gpData = [], onPress, t, language }) {
  const safeGPData = Array.isArray(gpData) ? gpData : [];
  const gp = safeGPData.find((g) => g && g.id === item.gpId);
  const village = gp?.villages?.find((v) => v && v.id === item.villageId);

  const displayName = gp && village ? `${gp.name} - ${village.name}` : item.villageName || t("noData");

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.recordCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.recordTitle}>{item.date || t("noData")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.statusPill, item.waterReleased === "Yes" ? styles.okPill : styles.noPill]}>
            {item.waterReleased === "Yes" ? t("yes") : t("no")}
          </Text>
          <Text style={{ color: "#1565c0", fontSize: 18, fontWeight: "bold" }}>›</Text>
        </View>
      </View>
      <Text style={[styles.recordText, { fontWeight: "700", color: "#1565c0" }]}>{displayName}</Text>
      <Text style={styles.recordText}>{t("labelScheme")}: {
        item.schemeType === "Independent Water Supply" 
          ? (language === "mr" ? "स्वतंत्र" : "Independent") 
          : (language === "mr" ? "ग्रीड" : "Grid")
      }</Text>
      <Text style={styles.recordText}>{t("labelWardArea")}: {item.wardArea || "N/A"}</Text>
      {item.photoBase64 ? <Image source={{ uri: item.photoBase64 }} style={styles.thumb} /> : null}
    </TouchableOpacity>
  );
}
