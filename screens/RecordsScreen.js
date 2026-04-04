import React, { useState } from "react";
import { FlatList, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import ActionButton from "../components/ActionButton";
import EntryCard from "../components/EntryCard";
import FieldLabel from "../components/FieldLabel";
import { styles } from "../styles/appStyles";
import { shareRecordPdf } from "../utils/pdf";

export default function RecordsScreen({ entries, onExport, gpData, onDelete }) {
  const [selectedId, setSelectedId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedEntry = entries.find((e) => e.createdAt === selectedId);

  const handleBack = () => {
    setSelectedId(null);
    setIsConfirming(false);
  };

  const handleDeleteTrigger = () => {
    if (isConfirming) {
        onDelete(selectedEntry.createdAt);
        handleBack();
    } else {
        setIsConfirming(true);
    }
  };

  if (selectedId && selectedEntry) {
    const gp = gpData.find((g) => g.id === selectedEntry.gpId);
    const village = gp?.villages?.find((v) => v.id === selectedEntry.villageId);
    const gpName = gp?.name || "N/A";
    const villageName = village?.name || selectedEntry.villageName || "N/A";

    return (
      <View style={styles.recordsContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={{ color: "#1565c0", fontWeight: "700", fontSize: 16 }}>← Back to Records</Text>
          </TouchableOpacity>
          <ActionButton title="Share PDF" onPress={() => shareRecordPdf(selectedEntry, gpData)} small secondary />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: "#1565c0", fontSize: 20 }]}>Report Details</Text>
            
            <View style={[styles.statCard, { marginBottom: 15, marginTop: 10 }]}>
              <Text style={{ color: "#546e7a", fontSize: 11, fontWeight: "bold" }}>STATUS</Text>
              <Text style={[styles.statusPill, selectedEntry.waterReleased === "Yes" ? styles.okPill : styles.noPill, { alignSelf: 'flex-start', marginTop: 5 }]}>
                Water Released: {selectedEntry.waterReleased}
              </Text>
            </View>

            <FieldLabel text="Gram Panchayat" />
            <Text style={styles.input}>{gpName}</Text>

            <FieldLabel text="Village Name" />
            <Text style={styles.input}>{villageName}</Text>

            <FieldLabel text="Ward / Area" />
            <Text style={styles.input}>{selectedEntry.wardArea}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Date" />
                <Text style={styles.input}>{selectedEntry.date}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Scheme" />
                <Text style={styles.input}>{selectedEntry.schemeType === "Independent Water Supply" ? "Independent" : "Grid"}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Start Time" />
                <Text style={styles.input}>{selectedEntry.startTime}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel text="End Time" />
                <Text style={styles.input}>{selectedEntry.endTime}</Text>
              </View>
            </View>

            <FieldLabel text="Supply Duration" />
            <Text style={styles.input}>{selectedEntry.duration}</Text>

            <FieldLabel text="Quality & Pressure" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <Text style={[styles.input, { flex: 1 }]}>Adequate: {selectedEntry.waterAdequate}</Text>
               <Text style={[styles.input, { flex: 1 }]}>Pressure: {selectedEntry.pressureLevel}</Text>
            </View>

            {selectedEntry.waterReleased === "No" && (
                <>
                <FieldLabel text="Reason for No Water" />
                <Text style={[styles.input, styles.textArea]}>{selectedEntry.reason}</Text>
                </>
            )}

            {selectedEntry.issueDescription ? (
                <>
                <FieldLabel text="Issue Description" />
                <Text style={[styles.input, styles.textArea]}>{selectedEntry.issueDescription}</Text>
                </>
            ) : null}

            <FieldLabel text="GPS Location" />
            <Text style={styles.input}>{selectedEntry.latitude}, {selectedEntry.longitude}</Text>

            {selectedEntry.photoBase64 ? (
              <View style={{ marginTop: 20 }}>
                <FieldLabel text="Evidence Photo" />
                <Image source={{ uri: selectedEntry.photoBase64 }} style={[styles.preview, { height: 280 }]} />
              </View>
            ) : null}

            <Text style={{ textAlign: 'center', color: '#999', fontSize: 11, marginTop: 20 }}>
                Created At: {new Date(selectedEntry.createdAt).toLocaleString()}
            </Text>

            <TouchableOpacity 
              onPress={handleDeleteTrigger} 
              style={{ 
                marginTop: 35, 
                backgroundColor: isConfirming ? '#b00020' : '#fff', 
                borderWidth: 1.5,
                borderColor: '#b00020',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center' 
              }}
            >
              <Text style={{ color: isConfirming ? '#fff' : '#b00020', fontWeight: '800' }}>
                {isConfirming ? "⚠️ CONFIRM DELETE FOREVER ⚠️" : "DELETE THIS RECORD"}
              </Text>
            </TouchableOpacity>
            {isConfirming && (
                <TouchableOpacity onPress={() => setIsConfirming(false)} style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 12 }}>Cancel Deletion</Text>
                </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.recordsContainer}>
      <View style={styles.recordsHeader}>
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Records / नोंदी</Text>
        <ActionButton title="Export CSV" onPress={onExport} small secondary />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.createdAt}
        renderItem={({ item }) => (
          <EntryCard 
            item={item} 
            gpData={gpData} 
            onPress={() => setSelectedId(item.createdAt)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
