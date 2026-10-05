import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFlag } from "@priemskiyyy/prism-react";
import { FlagTag } from "src/components/FlagTag/FlagTag";
import { COLORS } from "src/utils/constants/colors";

export const MaintenanceBanner: React.FunctionComponent = () => {
  const maintenance = useFlag("maintenance");

  if (maintenance === null) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.message}>{maintenance.message}</Text>
      <FlagTag flagKey="maintenance" />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    gap: 8,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.noticeBorder,
    backgroundColor: COLORS.noticeSoft,
  },
  message: { fontSize: 14, lineHeight: 20, color: COLORS.noticeText },
});
