import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFlag } from "@priemskiyyy/prism-react";
import { ASSISTANT_SUGGESTIONS } from "examples/shared/courier/constants/assistantSuggestions";
import { COLORS } from "src/utils/constants/colors";

type AssistantSuggestionsProps = {
  onSuggestionPick: (suggestion: string) => void;
};

export const AssistantSuggestions: React.FunctionComponent<
  AssistantSuggestionsProps
> = ({ onSuggestionPick }) => {
  const enabled = useFlag("assistant");

  if (!enabled) {
    return (
      <Text style={styles.off}>
        AI replies are not part of this workspace's plan.
      </Text>
    );
  }

  return (
    <View style={styles.suggestions}>
      <Text style={styles.heading}>Suggested replies</Text>
      {ASSISTANT_SUGGESTIONS.map((suggestion) => (
        <Pressable
          key={suggestion}
          accessibilityRole="button"
          onPress={() => onSuggestionPick(suggestion)}
          style={styles.suggestion}
        >
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  suggestions: { gap: 6, alignItems: "flex-start" },
  heading: { fontSize: 13, fontWeight: "600", color: COLORS.accentText },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentSoft,
  },
  suggestionText: { fontSize: 13, color: COLORS.accentText },
  off: { fontSize: 13, color: COLORS.muted },
});
