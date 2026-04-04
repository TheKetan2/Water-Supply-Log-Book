import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import FieldLabel from "../components/FieldLabel";
import { YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function GPInfoScreen({ gpData, onSave }) {
  const [localGP, setLocalGP] = useState(gpData || { gpName: "", villages: [] });

  const updateGPName = (name) => {
    setLocalGP((prev) => ({ ...prev, gpName: name }));
  };

  const addVillage = () => {
    const newVillage = {
      id: Date.now().toString(),
      name: "",
      wells: "0",
      borewells: "0",
      solarPumps: "0",
      roPresent: "No",
      population: "0"
    };
    setLocalGP((prev) => ({ ...prev, villages: [...prev.villages, newVillage] }));
  };

  const updateVillage = (id, field, value) => {
    setLocalGP((prev) => ({
      ...prev,
      villages: prev.villages.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    }));
  };

  const removeVillage = (id) => {
    Alert.alert("Remove Village", "Are you sure you want to remove this village?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setLocalGP((prev) => ({
            ...prev,
            villages: prev.villages.filter((v) => v.id !== id)
          }));
        }
      }
    ]);
  };

  const handleSave = () => {
    if (!localGP.gpName.trim()) {
      Alert.alert("Error", "GP Name is required.");
      return;
    }
    onSave(localGP);
    Alert.alert("Success", "GP Information saved successfully.");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GP Information / ग्रा.पं. माहिती</Text>
        
        <FieldLabel text="GP Name / ग्रामपंचायतीचे नाव" />
        <TextInput
          value={localGP.gpName}
          onChangeText={updateGPName}
          placeholder="Enter GP Name"
          style={styles.input}
        />

        <View style={{ marginTop: 20, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Villages / गावे</Text>
          <ActionButton title="+ Add Village" onPress={addVillage} small secondary />
        </View>

        {localGP.villages.map((village, index) => (
          <View key={village.id} style={[styles.statCard, { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#1565c0" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontWeight: "bold", color: "#1565c0" }}>Village #{index + 1}</Text>
              <TouchableOpacity onPress={() => removeVillage(village.id)}>
                <Text style={{ color: "#b00020", fontWeight: "bold" }}>Remove</Text>
              </TouchableOpacity>
            </View>

            <FieldLabel text="Village Name / गावाचे नाव" />
            <TextInput
              value={village.name}
              onChangeText={(val) => updateVillage(village.id, "name", val)}
              placeholder="Village Name"
              style={styles.input}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Wells / विहिरी" />
                <TextInput
                  value={village.wells}
                  onChangeText={(val) => updateVillage(village.id, "wells", val)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Borewells / बोअरवेल" />
                <TextInput
                  value={village.borewells}
                  onChangeText={(val) => updateVillage(village.id, "borewells", val)}
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
                  onChangeText={(val) => updateVillage(village.id, "solarPumps", val)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel text="Population / लोकसंख्या" />
                <TextInput
                  value={village.population}
                  onChangeText={(val) => updateVillage(village.id, "population", val)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <FieldLabel text="RO Present? / RO उपलब्ध?" />
            <CardSelect
              options={YES_NO_OPTIONS}
              selectedValue={village.roPresent}
              onValueChange={(val) => updateVillage(village.id, "roPresent", val)}
              labels={{ Yes: "Yes", No: "No" }}
            />
          </View>
        ))}

        {localGP.villages.length === 0 && (
          <Text style={{ textAlign: "center", color: "#666", marginVertical: 20 }}>No villages added yet.</Text>
        )}

        <ActionButton title="Save GP Information" onPress={handleSave} style={{ marginTop: 10 }} />
      </View>
    </ScrollView>
  );
}
