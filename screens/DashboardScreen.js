import React, { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import CardSelect from "../components/CardSelect";
import { styles } from "../styles/appStyles";

export default function DashboardScreen({ stats, gpData = [], entries = [] }) {
  const [selectedGPId, setSelectedGPId] = useState("");
  const [selectedVillageId, setSelectedVillageId] = useState("");

  const filteredStats = useMemo(() => {
    if (!selectedGPId) return stats;

    let totalPopulation = 0;
    let totalWells = 0;
    let totalBorewells = 0;
    let totalPumps = 0;
    let totalRO = 0;
    let totalVillages = 0;

    const targetGPs = gpData.filter((gp) => gp.id === selectedGPId);

    targetGPs.forEach((gp) => {
      const targetVillages = selectedVillageId ? gp.villages?.filter((v) => v.id === selectedVillageId) : gp.villages;
      totalVillages += targetVillages?.length || 0;

      targetVillages?.forEach((v) => {
        totalPopulation += parseInt(v.population || 0, 10);
        totalWells += parseInt(v.wells || 0, 10);
        totalBorewells += parseInt(v.borewells || 0, 10);
        totalPumps += parseInt(v.solarPumps || 0, 10);
        if (v.roPresent === "Yes") totalRO += 1;
      });
    });

    const last7Count = entries.filter((e) => {
        const entryDate = new Date(e.date);
        const isRecent = !isNaN(entryDate) && (new Date() - entryDate) / (1000 * 60 * 60 * 24) <= 7;
        const matchesGP = !selectedGPId || e.gpId === selectedGPId;
        const matchesVillage = !selectedVillageId || e.villageId === selectedVillageId;
        return isRecent && matchesGP && matchesVillage;
    }).length;

    return {
      ...stats,
      totalGPs: 1,
      totalVillages,
      totalPopulation,
      totalWells,
      totalBorewells,
      totalPumps,
      last7Count,
      roCoverage: totalVillages ? Math.round((totalRO / totalVillages) * 100) : 0
    };
  }, [selectedGPId, selectedVillageId, stats, gpData, entries]);

  const allVillages = useMemo(() => {
    const list = [];
    gpData.forEach((gp) => {
      gp.villages?.forEach((v) => {
        list.push({ ...v, gpName: gp.name });
      });
    });
    return list;
  }, [gpData]);

  // Safer alternative to Object.fromEntries for older devices
  const gpLabels = useMemo(() => {
    const labels = { "": "All GPs" };
    gpData.forEach(g => { labels[g.id] = g.name; });
    return labels;
  }, [gpData]);

  const villageLabels = useMemo(() => {
    const labels = { "": "All Villages" };
    const currentGP = gpData.find(g => g.id === selectedGPId);
    currentGP?.villages?.forEach(v => { labels[v.id] = v.name; });
    return labels;
  }, [gpData, selectedGPId]);

  const isHealthy = filteredStats.todayStatus && (filteredStats.todayStatus.includes("Yes") || filteredStats.todayStatus.includes("होय"));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.banner, isHealthy ? styles.bannerSuccess : styles.bannerWarning]}>
        <Text style={styles.bannerText}>Today: {filteredStats.todayStatus || "No Data"}</Text>
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.cardTitle}>
            {selectedGPId ? "Scoped Context" : `${filteredStats.totalGPs || 0} Gram Panchayats`}
          </Text>
          {(selectedGPId || selectedVillageId) && (
            <TouchableOpacity onPress={() => { setSelectedGPId(""); setSelectedVillageId(""); }}>
              <Text style={{ color: "#1565c0", fontSize: 12, fontWeight: "700" }}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ color: "#546e7a", fontSize: 13, marginBottom: 15 }}>Insights & Analytics / अंतर्दृष्टी</Text>

        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#90a4ae", marginBottom: 6 }}>FILTER BY PANCHAYAT</Text>
            <CardSelect 
                options={["", ...gpData.map(g => g.id)]}
                selectedValue={selectedGPId}
                onValueChange={(val) => { setSelectedGPId(val); setSelectedVillageId(""); }}
                labels={gpLabels}
            />
            
            {selectedGPId ? (
                <>
                <Text style={{ fontSize: 11, fontWeight: "bold", color: "#90a4ae", marginBottom: 6, marginTop: 10 }}>FILTER BY VILLAGE</Text>
                <CardSelect 
                    options={["", ...(gpData.find(g => g.id === selectedGPId)?.villages?.map(v => v.id) || [])]}
                    selectedValue={selectedVillageId}
                    onValueChange={setSelectedVillageId}
                    labels={villageLabels}
                />
                </>
            ) : null}
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardBlue]}>
            <Text style={styles.infoLabel}>VILLAGES</Text>
            <Text style={styles.infoValue}>{filteredStats.totalVillages || 0}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardPurple]}>
            <Text style={styles.infoLabel}>POPULATION</Text>
            <Text style={styles.infoValue}>{(filteredStats.totalPopulation || 0).toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Infrastructure / पायाभूत सुविधा</Text>
        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardGreen]}>
            <Text style={styles.infoLabel}>WELLS</Text>
            <Text style={styles.infoValue}>{filteredStats.totalWells || 0}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardAmber]}>
            <Text style={styles.infoLabel}>BOREWELLS</Text>
            <Text style={styles.infoValue}>{filteredStats.totalBorewells || 0}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.infoCard, styles.infoCardAmber]}>
            <Text style={styles.infoLabel}>SOLAR PUMPS</Text>
            <Text style={styles.infoValue}>{filteredStats.totalPumps || 0}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardBlue]}>
            <Text style={styles.infoLabel}>SUPPLY DAYS (7D)</Text>
            <Text style={styles.infoValue}>{filteredStats.waterReleasedDays || 0}/7</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Clean Water Coverage / RO सुविधा</Text>
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={{ fontSize: 13, color: "#455a64", fontWeight: "600" }}>RO Coverage</Text>
            <Text style={{ fontSize: 18, color: "#1565c0", fontWeight: "800" }}>{filteredStats.roCoverage || 0}%</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${filteredStats.roCoverage || 0}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Village Overview / सर्व गावे</Text>
        <View style={{ marginTop: 5 }}>
            {allVillages.map((v) => (
                <View key={v.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eceff1" }}>
                    <View>
                        <Text style={{ fontWeight: "bold", color: "#37474f", fontSize: 14 }}>{v.name}</Text>
                        <Text style={{ fontSize: 11, color: "#78909c" }}>{v.gpName}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 12, color: "#1565c0", fontWeight: "700" }}>Pop: {parseInt(v.population || 0).toLocaleString()}</Text>
                        <Text style={{ fontSize: 10, color: v.roPresent === "Yes" ? "#2e7d32" : "#b00020" }}>
                            {v.roPresent === "Yes" ? "✓ RO" : "✗ No RO"}
                        </Text>
                    </View>
                </View>
            ))}
            {allVillages.length === 0 && (
                <Text style={{ textAlign: "center", color: "#999", marginVertical: 10 }}>No village data found.</Text>
            )}
        </View>
      </View>
    </ScrollView>
  );
}
