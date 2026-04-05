import React, { useState, useEffect } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import ActionButton from "../components/ActionButton";
import CardSelect from "../components/CardSelect";
import CounterInput from "../components/CounterInput";
import FieldLabel from "../components/FieldLabel";
import { YES_NO_OPTIONS } from "../constants/options";
import { styles } from "../styles/appStyles";

export default function GPInfoScreen({ gpData = [], onSave, language, t }) {
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
      handpumps: "0",
      solarPumps: "0",
      roPlants: "0",
      population: "0",
      households: "0",
      anganwadis: "0",
      schoolStudents: "0",
      anganwadiStudents: "0",
      schools: "0"
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
      Alert.alert(t("saveError"), t("errorRequired"));
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
            <Text style={{ color: "#1565c0", fontWeight: "700" }}>{t("btnBackToList")}</Text>
          </TouchableOpacity>

          <FieldLabel text={t("fieldGPName")} />
          <TextInput
            value={currentGP.name}
            onChangeText={(val) => updateGP(currentGP.id, "name", val)}
            placeholder={t("fieldGPNamePlaceholder")}
            style={styles.input}
          />

          <View style={{ marginTop: 25, marginBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{t("statsVillages")}</Text>
            <ActionButton title={t("btnNewVillage")} onPress={() => addVillage(currentGP.id)} small secondary />
          </View>

          {(currentGP.villages || []).map((v, i) => (
            <View key={v.id} style={[styles.statCard, { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#1565c0" }]}>
              <View style={styles.rowBetween}>
                <Text style={{ fontWeight: "700", color: "#1565c0" }}>Village #{i + 1}</Text>
                <TouchableOpacity onPress={() => removeVillage(currentGP.id, v.id)}>
                   <Text style={{ color: "#b00020", fontWeight: "700", fontSize: 12 }}>{t("btnDeleteVillage")}</Text>
                </TouchableOpacity>
              </View>
              
              <FieldLabel text={t("fieldVillageName")} />
              <TextInput value={v.name} onChangeText={(t) => updateVillage(currentGP.id, v.id, "name", t)} style={styles.input} />

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsWells")} 
                  value={v.wells || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "wells", val)} 
                />
                <CounterInput 
                  label={t("statsBorewells")} 
                  value={v.borewells || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "borewells", val)} 
                />
              </View>

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsHandpumps")} 
                  value={v.handpumps || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "handpumps", val)} 
                />
                <CounterInput 
                  label={t("statsSolarPumps")} 
                  value={v.solarPumps || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "solarPumps", val)} 
                />
              </View>

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsFamilies")} 
                  value={v.households || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "households", val)} 
                />
                <CounterInput 
                  label={t("statsPopulation")} 
                  value={v.population || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "population", val)} 
                />
              </View>

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsROUnits")} 
                  value={v.roPlants || (v.roPresent === "Yes" ? "1" : "0")} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "roPlants", val)} 
                />
                <View style={styles.fieldCol} />
              </View>

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsAnganwadis")} 
                  value={v.anganwadis || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "anganwadis", val)} 
                />
                <CounterInput 
                  label={t("statsAngStudents")} 
                  value={v.anganwadiStudents || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "anganwadiStudents", val)} 
                />
              </View>

              <View style={styles.fieldRow}>
                <CounterInput 
                  label={t("statsSchools")} 
                  value={v.schools || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "schools", val)} 
                />
                <CounterInput 
                  label={t("statsSchStudents")} 
                  value={v.schoolStudents || "0"} 
                  onValueChange={(val) => updateVillage(currentGP.id, v.id, "schoolStudents", val)} 
                />
              </View>
            </View>
          ))}

          <ActionButton title={t("btnAddVillage")} onPress={() => addVillage(currentGP.id)} secondary style={{ marginTop: 5 }} />
        </View>

        <ActionButton title={t("btnSaveBack")} onPress={handleSaveClose} style={{ marginTop: 20 }} />
        
        <View style={{ marginTop: 35, paddingTop: 25, borderTopWidth: 1.5, borderTopColor: '#ffebee' }}>
          <Text style={{ color: '#b00020', fontSize: 11, fontWeight: '800', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase' }}>
             {t("dangerZone")}
          </Text>
          <ActionButton 
            title={isConfirmingGPDelete ? t("btnConfirmDelete") : t("btnDeleteGP")} 
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
                  <Text style={{ color: '#666', fontSize: 12 }}>{t("actionCancel")}</Text>
              </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.recordsHeader}>
          <Text style={styles.cardTitle}>{t("btnManageGP")}</Text>
          <ActionButton title={t("btnAddGP")} onPress={addGP} small secondary />
        </View>

        {localGPs.map((gp) => (
          <TouchableOpacity key={gp.id} onPress={() => setEditingGPId(gp.id)} style={[styles.statCard, { marginBottom: 10 }]}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#1565c0" }}>{gp.name || t("fieldGPNamePlaceholder")}</Text>
                <Text style={{ fontSize: 11, color: "#78909c" }}>{(gp.villages || []).length} {t("villagesConfigured")}</Text>
              </View>
              <Text style={{ fontSize: 20, color: "#1565c0" }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {localGPs.length === 0 && (
          <Text style={{ textAlign: "center", paddingVertical: 40, color: "#90a4ae" }}>{t("noGPs")}</Text>
        )}
      </View>
    </ScrollView>
  );
}
