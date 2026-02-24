import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";

interface ExportButtonProps {
  accentColor: string;
}

export function ExportButton({ accentColor }: ExportButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.exportBtn, { backgroundColor: accentColor + "12" }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.exportBtnText, { color: accentColor }]}>
        Export weekly report
      </Text>
    </TouchableOpacity>
  );
}
