import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";
import FieldLabel from "./FieldLabel";

export default function CounterInput({ value, onValueChange, label, min = 0 }) {
  // Ensure we have a string for the TextInput, and a number for calculations
  const displayValue = (value === undefined || value === null) ? "0" : value.toString();
  const numericValue = parseInt(displayValue, 10) || 0;

  const handleDecrement = () => {
    const nextVal = Math.max(min, numericValue - 1);
    onValueChange(nextVal.toString());
  };

  const handleIncrement = () => {
    const nextVal = numericValue + 1;
    onValueChange(nextVal.toString());
  };

  return (
    <View style={styles.fieldCol}>
      <FieldLabel text={label} />
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={handleDecrement}
          activeOpacity={0.6}
        >
          <Text style={styles.counterButtonText}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.counterValue}
          value={displayValue}
          onChangeText={(text) => {
            // Only allow digits
            const cleaned = text.replace(/[^0-9]/g, '');
            onValueChange(cleaned);
          }}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={handleIncrement}
          activeOpacity={0.6}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
