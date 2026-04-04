import React from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function DashboardScreen({ stats }) {
  const isHealthy = stats.todayStatus.includes("Yes") || stats.todayStatus.includes("होय");

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Today's Status Banner */}
      <View style={[styles.banner, isHealthy ? styles.bannerSuccess : styles.bannerWarning]}>
        <Text style={styles.bannerText}>Today: {stats.todayStatus}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{stats.totalGPs} Gram Panchayats</Text>
        <Text style={{ color: "#546e7a", fontSize: 13, marginBottom: 10 }}>Panchayat Overview / पंचायत आढावा</Text>

        {/* Top level GP Info */}
        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardBlue]}>
            <Text style={styles.infoLabel}>VILLAGES</Text>
            <Text style={styles.infoValue}>{stats.totalVillages}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardPurple]}>
            <Text style={styles.infoLabel}>POPULATION</Text>
            <Text style={styles.infoValue}>{stats.totalPopulation.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Infrastructure / पायाभूत सुविधा</Text>
        
        {/* Resource Grid */}
        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardGreen]}>
            <Text style={styles.infoLabel}>WELLS</Text>
            <Text style={styles.infoValue}>{stats.totalWells}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardAmber]}>
            <Text style={styles.infoLabel}>BOREWELLS</Text>
            <Text style={styles.infoValue}>{stats.totalBorewells}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardAmber]}>
            <Text style={styles.infoLabel}>SOLAR PUMPS</Text>
            <Text style={styles.infoValue}>{stats.totalPumps}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardBlue]}>
            <Text style={styles.infoLabel}>SUPPLY DAYS (7D)</Text>
            <Text style={styles.infoValue}>{stats.waterReleasedDays}/7</Text>
          </View>
        </View>

        {/* Progress Section */}
        <Text style={styles.sectionHeader}>Clean Water Coverage / RO सुविधा</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={{ fontSize: 13, color: "#455a64", fontWeight: "600" }}>RO Coverage</Text>
            <Text style={{ fontSize: 18, color: "#1565c0", fontWeight: "800" }}>{stats.roCoverage}%</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${stats.roCoverage}%` }]} />
          </View>
          <Text style={{ color: "#78909c", fontSize: 11, marginTop: 4 }}>Percentage of villages with RO systems</Text>
        </View>
      </View>
    </ScrollView>
  );
}
