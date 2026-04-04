import React from "react";
import { Text } from "react-native";
import { styles } from "../styles/appStyles";

export default function FieldLabel({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}
