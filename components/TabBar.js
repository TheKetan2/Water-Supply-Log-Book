import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "../styles/appStyles";

export default function TabBar({ tabs = [], activeTab, onChange }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        if (!tab || !tab.name) return null;
        const isActive = activeTab === tab.name;
        
        return (
          <Pressable
            key={tab.name}
            onPress={() => onChange && onChange(tab.name)}
            android_ripple={{ color: "#d3e3fd", borderless: true }}
            style={styles.tabButton}
          >
            <View style={[styles.tabPill, isActive && styles.tabPillActive]}>
              <MaterialCommunityIcons 
                name={tab.icon || "help-circle"} 
                size={22} 
                color={isActive ? "#1565c0" : "#455a64"} 
              />
              {isActive && (
                <Text numberOfLines={1} style={[styles.tabText, styles.tabTextActive, { marginLeft: 4 }]}>
                  {tab.name}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
