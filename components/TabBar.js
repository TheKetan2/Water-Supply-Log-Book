import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            android_ripple={{ color: "#d3e3fd", borderless: true }}
            style={styles.tabButton}
          >
            <View style={[styles.tabPill, isActive && styles.tabPillActive]}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
