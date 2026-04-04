import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/appStyles";

export default function ActionButton({ title, onPress, secondary, small, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary ? styles.actionSecondary : styles.actionPrimary,
        small ? styles.actionSmall : { minHeight: 48, width: '100%' },
        style
      ]}
    >
      <Text style={[styles.actionText, secondary ? styles.actionSecondaryText : null, small ? styles.actionTextSmall : null]}>
        {title}
      </Text>
    </Pressable>
  );
}
