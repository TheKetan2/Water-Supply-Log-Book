import React from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function DashboardScreen({ stats }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dashboard / डॅशबोर्ड</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today Status</Text>
            <Text style={styles.statValue}>{stats.todayStatus}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Last 7 Days Entries</Text>
            <Text style={styles.statValue}>{stats.last7Count}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>No Water Days</Text>
            <Text style={styles.statValue}>{stats.noWaterCount}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
