import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePrismStatus } from "@priemskiyyy/prism-react";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import { COLORS, TONE_COLORS } from "src/utils/constants/colors";

export const Header: React.FunctionComponent = () => {
  const status = usePrismStatus();

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Courier
        </Text>
        <View style={styles.status} accessibilityLiveRegion="polite">
          <View
            style={[
              styles.dot,
              { backgroundColor: TONE_COLORS[getStatusTone(status)] },
            ]}
          />
          <Text style={styles.statusText}>{formatStatus(status)}</Text>
        </View>
      </View>
      {status.error === undefined ? null : (
        <Text style={styles.error}>{status.error.message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  logoText: { fontSize: 17, fontWeight: "700", color: COLORS.onAccent },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "500", color: COLORS.body },
  error: { fontSize: 13, color: COLORS.danger },
});
