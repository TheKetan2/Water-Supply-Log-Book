import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export default function Toast({ message, onHide, duration = 2500 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onHide]);

  if (!message) return null;

  return (
    <View style={styles.toastContainer}>
      <View style={styles.toastContent}>
        <Text style={styles.toastIcon}>✓</Text>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}
