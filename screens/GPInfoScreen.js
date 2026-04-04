import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import FieldLabel from "../components/FieldLabel";
import { YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function GPInfoScreen({ gpData, onSave }) {
  const [editingGPId, setEditingGPId] = useState(null);
  const [localGPs, setLocalGPs] = useState(gpData || []);

  const currentGP = localGPs.find((g) => g.id === editingGPId);

  const addGP = () => {
    const newGP = {
      id: Date.now().toString(),
      name: "",
      villages: []
    };
    setLocalGPs((prev) => [...prev, newGP]);
    setEditingGPId(newGP.id);
  };

  const updateGP = (id, field, value) => {
    setLocalGPs((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const removeGP = (id) => {
    Alert.alert("Remove GP", "Remove entire Gram Panchayat and its villages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setLocalGPs((prev) => {
            const next = prev.filter((g) => g.id !== id);
            onSave(next);
            return next;
          });
        }
      }
    ]);
  };

  const addVillage = (gpId) => {
    const newVillage = {
      id: Date.now().toString(),
      name: "",
      wells: "0",
      borewells: "0",
      solarPumps: "0",
      roPresent: "No",
      population: "0"
    };
    setLocalGPs((prev) =>
      prev.map((g) => (g.id === gpId ? { ...g, villages: [...g.villages, newVillage] } : g))
    );
  };

  const updateVillage = (gpId, villageId, field, value) => {
    setLocalGPs((prev) =>
      prev.map((g) =>
        g.id === gpId
          ? {
              ...g,
              villages: g.villages.map((v) => (v.id === villageId ? { ...v, [field]: value } : v))
            }
          : g
      )
    );
  };

  const removeVillage = (gpId, villageId) => {
    setLocalGPs((prev) =>
      prev.map((g) =>
        g.id === gpId
          ? { ...g, villages: g.villages.filter((v) => v.id !== villageId) }
          : g
      )
    );
  };

  const handleGlobalSave = () => {
    const invalid = localGPs.some((g) => !g.name.trim());
    if (invalid) {
      Alert.alert("Error", "All GPs must have a name.");
      return;
    }
    onSave(localGPs);
    setEditingGPId(null);
  };

  if (editingGPId && currentGP) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setEditingGPId(null)}>
              <Text style={{ color: "#1565c0", fontWeight: "700" }}>← Back to List</Text>
            </TouchableOpacity>
            <Text style={styles.cardTitle}>Edit GP Info</Text>
          </View>

          <FieldLabel text="GP Name / ग्रामपंचायतीचे नाव" />
          <TextInput
            value={currentGP.name}
            onChangeText={(val) => updateGP(currentGP.id, "name", val)}
            placeholder="Enter GP Name"
            style={styles.input}
          />

          <View style={{ marginTop: 20, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Villages / गावे</Text>
            <ActionButton title="+ Add Village" onPress={() => addVillage(currentGP.id)} small secondary />
          </View>

          {currentGP.villages.map((village, index) => (
            <View key={village.id} style={[styles.statCard, { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#1565c0" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontWeight: "bold", color: "#1565c0" }}>Village #{index + 1}</Text>
                <TouchableOpacity onPress={() => removeVillage(currentGP.id, village.id)}>
                  <Text style={{ color: "#b00020", fontWeight: "bold" }}>Remove</Text>
                </TouchableOpacity>
              </View>

              <FieldLabel text="Village Name / गावाचे नाव" />
              <TextInput
                value={village.name}
                onChangeText={(val) => updateVillage(currentGP.id, village.id, "name", val)}
                placeholder="Village Name"
                style={styles.input}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Wells / विहिरी" />
                  <TextInput
                    value={village.wells}
                    onChangeText={(val) => updateVillage(currentGP.id, village.id, "wells", val)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Borewells / बोअरवेल" />
                  <TextInput
                    value={village.borewells}
                    onChangeText={(val) => updateVillage(currentGP.id, village.id, "borewells", val)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Solar Pumps / सौर पंप" />
                  <TextInput
                    value={village.solarPumps}
                    onChangeText={(val) => updateVillage(currentGP.id, village.id, "solarPumps", val)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel text="Population / लोकसंख्या" />
                  <TextInput
                    value={village.population}
                    onChangeText={(val) => updateVillage(currentGP.id, village.id, "population", val)}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <FieldLabel text="RO Present? / RO उपलब्ध?" />
              <CardSelect
                options={YES_NO_OPTIONS}
                selectedValue={village.roPresent}
                onValueChange={(val) => updateVillage(currentGP.id, village.id, "roPresent", val)}
                labels={{ Yes: "Yes", No: "No" }}
              />
            </View>
          ))}

          {currentGP.villages.length === 0 && (
            <Text style={{ textAlign: "center", color: "#666", marginVertical: 20 }}>No villages added yet.</Text>
          )}

          <ActionButton title="Save & Close" onPress={handleGlobalSave} style={{ marginTop: 10 }} />
          <TouchableOpacity onPress={() => removeGP(currentGP.id)} style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={{ color: "#b00020", fontWeight: "700" }}>Delete This Gram Panchayat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.cardTitle}>Gram Panchayats</Text>
          <ActionButton title="+ Add GP" onPress={addGP} small secondary />
        </View>

        {localGPs.map((gp) => (
          <TouchableOpacity key={gp.id} onPress={() => setEditingGPId(gp.id)} style={[styles.statCard, { marginBottom: 12 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1565c0" }}>{gp.name || "Untitled GP"}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>{gp.villages.length} Villages</Text>
              </View>
              <Text style={{ color: "#1565c0", fontSize: 18 }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {localGPs.length === 0 && (
          <Text style={{ textAlign: "center", color: "#666", paddingVertical: 40 }}>No Gram Panchayats added yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
