import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function CardSelect({ options, selectedValue, onValueChange, labels = {} }) {
  return (
    <View style={styles.selectionGrid}>
      {options.map((option) => {
        const isActive = selectedValue === option;
        const displayLabel = labels[option] || option;

        return (
          <Pressable
            key={option}
            onPress={() => onValueChange(option)}
            android_ripple={{ color: "#d3e3fd" }}
            style={[styles.selectableCard, isActive && styles.selectableCardActive]}
          >
            <Text style={[styles.selectableCardText, isActive && styles.selectableCardTextActive]}>
              {displayLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
