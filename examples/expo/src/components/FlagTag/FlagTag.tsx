import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFlagDetails } from "@priemskiyyy/prism-react";
import type { RegisteredKey } from "@priemskiyyy/prism-react";
import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
import { COLORS, TONE_COLORS } from "src/utils/constants/colors";

type FlagTagProps = { flagKey: RegisteredKey };

export const FlagTag: React.FunctionComponent<FlagTagProps> = ({ flagKey }) => {
  const resolution = useFlagDetails(flagKey, (details) => details.resolution);

  return (
    <View
      style={styles.tag}
      accessible
      accessibilityLabel={`${flagKey} is ${resolution}`}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: TONE_COLORS[RESOLUTION_TONES[resolution]] },
        ]}
      />
      <Text style={styles.label}>{flagKey}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.surface,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: "Menlo", fontSize: 11, color: COLORS.accentText },
});
