import React from "react";
import { Image, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function EntryCard({ item }) {
  return (
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
}
