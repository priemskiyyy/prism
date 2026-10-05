import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import type { Membership } from "examples/shared/courier/types/Membership";
import { COLORS } from "src/utils/constants/colors";
import { FLAGS_URL } from "src/utils/constants/flagsUrl";

type ContextFooterProps = { membership: Membership };

export const ContextFooter: React.FunctionComponent<ContextFooterProps> = ({
  membership,
}) => (
  <View style={styles.footer}>
    <Text style={styles.label}>Context</Text>
    <Text style={styles.code}>
      {JSON.stringify(getCourierContext(membership))}
    </Text>
    <Text style={styles.hint}>
      Flags come from {FLAGS_URL}. Pull down or reopen the app to read them
      again.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  footer: { gap: 4, paddingHorizontal: 4 },
  label: { fontSize: 12, fontWeight: "600", color: COLORS.body },
  code: { fontFamily: "Menlo", fontSize: 11, color: COLORS.muted },
  hint: { fontSize: 12, lineHeight: 18, color: COLORS.muted },
});
