import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/appStyles";

export default function ActionButton({ title, onPress, secondary, small }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary ? styles.actionSecondary : styles.actionPrimary,
        small ? styles.actionSmall : styles.actionFlex
      ]}
    >
      <Text style={[styles.actionText, secondary ? styles.actionSecondaryText : null, small ? styles.actionTextSmall : null]}>{title}</Text>
    </Pressable>
  );
}
