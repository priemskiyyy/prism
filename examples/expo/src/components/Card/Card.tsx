import type React from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RegisteredKey } from "@priemskiyyy/prism-react";
import { FlagTag } from "src/components/FlagTag/FlagTag";
import { COLORS } from "src/utils/constants/colors";

type CardProps = {
  title: string;
  flagKeys: RegisteredKey[];
  children: ReactNode;
};

export const Card: React.FunctionComponent<CardProps> = ({
  title,
  flagKeys,
  children,
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tags}>
        {flagKeys.map((flagKey) => (
          <FlagTag key={flagKey} flagKey={flagKey} />
        ))}
      </View>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
});
