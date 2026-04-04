import React, { useState, useEffect } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import FieldLabel from "../components/FieldLabel";
import { YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function GPInfoScreen({ gpData = [], onSave }) {
  const [editingGPId, setEditingGPId] = useState(null);
  const [localGPs, setLocalGPs] = useState(Array.isArray(gpData) ? gpData : []);
  const [isConfirmingGPDelete, setIsConfirmingGPDelete] = useState(false);

  useEffect(() => {
    setLocalGPs(Array.isArray(gpData) ? gpData : []);
  }, [gpData]);

  const currentGP = localGPs.find((g) => g && g.id === editingGPId);

  const addGP = () => {
    const newGP = {
      id: "G" + Date.now().toString(),
      name: "",
      villages: []
    };
    const next = [...localGPs, newGP];
    setLocalGPs(next);
    setEditingGPId(newGP.id);
  };

  const updateGP = (id, field, value) => {
    setLocalGPs((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const removeGP = (id) => {
    const next = localGPs.filter((g) => g.id !== id);
    onSave(next);
    setLocalGPs(next);
    setEditingGPId(null);
    setIsConfirmingGPDelete(false);
  };

  const addVillage = (gpId) => {
    const newVillage = {
      id: "V" + Date.now().toString(),
      name: "",
      wells: "0",
      borewells: "0",
      solarPumps: "0",
      roPresent: "No",
      population: "0"
    };
    setLocalGPs((prev) =>
      prev.map((g) => (g.id === gpId ? { ...g, villages: [...(g.villages || []), newVillage] } : g))
    );
  };

  const updateVillage = (gpId, villageId, field, value) => {
    setLocalGPs((prev) =>
      prev.map((g) =>
        g.id === gpId
          ? {
              ...g,
              villages: (g.villages || []).map((v) => (v.id === villageId ? { ...v, [field]: value } : v))
            }
          : g
      )
    );
  };

  const removeVillage = (gpId, villageId) => {
    setLocalGPs((prev) =>
      prev.map((g) =>
        g.id === gpId
          ? { ...g, villages: (g.villages || []).filter((v) => v.id !== villageId) }
          : g
      )
    );
  };

  const handleSaveClose = () => {
    const invalid = localGPs.some((g) => g && !g.name.trim());
    if (invalid) {
      Alert.alert("Missing Name", "Enter a name for the Gram Panchayat.");
      return;
    }
    onSave(localGPs);
    setEditingGPId(null);
  };

  if (editingGPId && currentGP) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => { setEditingGPId(null); setIsConfirmingGPDelete(false); }} style={{ marginBottom: 15 }}>
            <Text style={{ color: "#1565c0", fontWeight: "700" }}>← Back to List</Text>
          </TouchableOpacity>

          <FieldLabel text="Gram Panchayat Name" />
          <TextInput
            value={currentGP.name}
            onChangeText={(val) => updateGP(currentGP.id, "name", val)}
            placeholder="Name e.g. Borda"
            style={styles.input}
          />

          <View style={{ marginTop: 25, marginBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Villages</Text>
            <ActionButton title="+ New" onPress={() => addVillage(currentGP.id)} small secondary />
          </View>

          {(currentGP.villages || []).map((v, i) => (
            <View key={v.id} style={[styles.statCard, { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#1565c0" }]}>
              <View style={styles.rowBetween}>
                <Text style={{ fontWeight: "700", color: "#1565c0" }}>Village #{i + 1}</Text>
                <TouchableOpacity onPress={() => removeVillage(currentGP.id, v.id)}>
                   <Text style={{ color: "#b00020", fontWeight: "700", fontSize: 12 }}>Delete Village</Text>
                </TouchableOpacity>
              </View>
              
              <FieldLabel text="Name" />
              <TextInput value={v.name} onChangeText={(t) => updateVillage(currentGP.id, v.id, "name", t)} style={styles.input} />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                 <View style={{ flex: 1 }}>
                   <FieldLabel text="Wells" />
                   <TextInput value={v.wells} onChangeText={(t) => updateVillage(currentGP.id, v.id, "wells", t)} keyboardType="numeric" style={styles.input} />
                 </View>
                 <View style={{ flex: 1 }}>
                   <FieldLabel text="Borewells" />
                   <TextInput value={v.borewells} onChangeText={(t) => updateVillage(currentGP.id, v.id, "borewells", t)} keyboardType="numeric" style={styles.input} />
                 </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                 <View style={{ flex: 1 }}>
                    <FieldLabel text="Population" />
                    <TextInput value={v.population} onChangeText={(t) => updateVillage(currentGP.id, v.id, "population", t)} keyboardType="numeric" style={styles.input} />
                 </View>
                 <View style={{ flex: 1 }}>
                    <FieldLabel text="RO?" />
                    <CardSelect options={YES_NO_OPTIONS} selectedValue={v.roPresent} onValueChange={(val) => updateVillage(currentGP.id, v.id, "roPresent", val)} />
                 </View>
              </View>
            </View>
          ))}

          <ActionButton title="Save & Back" onPress={handleSaveClose} style={{ marginTop: 20 }} />
          
          <View style={{ marginTop: 35, paddingTop: 25, borderTopWidth: 1.5, borderTopColor: '#ffebee' }}>
            <Text style={{ color: '#b00020', fontSize: 11, fontWeight: '800', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase' }}>
               Danger Zone / धोकादायक क्षेत्र
            </Text>
            <ActionButton 
              title={isConfirmingGPDelete ? "⚠️ CONFIRM DELETE ⚠️" : "DELETE GRAM PANCHAYAT"} 
              onPress={() => {
                if (isConfirmingGPDelete) {
                    removeGP(currentGP.id);
                } else {
                    setIsConfirmingGPDelete(true);
                }
              }} 
              secondary
              style={{ 
                backgroundColor: isConfirmingGPDelete ? '#b00020' : '#fff5f5', 
                borderColor: '#b00020', 
                borderWidth: 2 
              }}
            />
            {isConfirmingGPDelete && (
                <TouchableOpacity onPress={() => setIsConfirmingGPDelete(false)} style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 12 }}>Cancel Deletion</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.recordsHeader}>
          <Text style={styles.cardTitle}>List of GPs</Text>
          <ActionButton title="+ New GP" onPress={addGP} small secondary />
        </View>

        {localGPs.map((gp) => (
          <TouchableOpacity key={gp.id} onPress={() => setEditingGPId(gp.id)} style={[styles.statCard, { marginBottom: 10 }]}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#1565c0" }}>{gp.name || "Unnamed GP"}</Text>
                <Text style={{ fontSize: 11, color: "#78909c" }}>{(gp.villages || []).length} Villages configured</Text>
              </View>
              <Text style={{ fontSize: 20, color: "#1565c0" }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {localGPs.length === 0 && (
          <Text style={{ textAlign: "center", paddingVertical: 40, color: "#90a4ae" }}>No Gram Panchayats added yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
