import React from "react";
import { FlatList, Text, View } from "react-native";
import ActionButton from "../components/ActionButton";
import EntryCard from "../components/EntryCard";
import { styles } from "../styles/appStyles";

export default function RecordsScreen({ entries, onExport, gpData }) {
  return (
    <View style={styles.recordsContainer}>
      <View style={styles.recordsHeader}>
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Records / नोंदी</Text>
        <ActionButton title="Export CSV" onPress={onExport} small secondary />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.createdAt}
        renderItem={({ item }) => <EntryCard item={item} gpData={gpData} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
