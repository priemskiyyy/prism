import type React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFlag } from "@priemskiyyy/prism-react";
import { COLORS } from "src/utils/constants/colors";

type ComposerProps = {
  draft: string;
  onDraftChange: (draft: string) => void;
};

export const Composer: React.FunctionComponent<ComposerProps> = ({
  draft,
  onDraftChange,
}) => {
  const modern = useFlag("composer");
  const uploads = useFlag("uploads");
  const empty = draft.trim() === "";

  return (
    <View style={[styles.composer, modern && styles.modern]}>
      <Text style={styles.title}>
        {modern ? "New composer" : "Classic composer"}
      </Text>
      <TextInput
        value={draft}
        onChangeText={onDraftChange}
        multiline
        accessibilityLabel="Message"
        placeholder={
          modern ? "Write a reply, type / for templates" : "Write a reply"
        }
        placeholderTextColor={COLORS.faint}
        style={[styles.input, modern && styles.tallInput]}
      />
      <View style={styles.footer}>
        <Text style={styles.limits}>
          Up to {uploads.maxFiles} {uploads.maxFiles === 1 ? "file" : "files"},{" "}
          {uploads.maxMegabytes} MB each
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: empty }}
          disabled={empty}
          onPress={() => onDraftChange("")}
          style={[styles.send, empty && styles.disabled]}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  composer: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modern: { borderColor: COLORS.accentBorder, backgroundColor: COLORS.sunken },
  title: { fontSize: 14, fontWeight: "600", color: COLORS.body },
  input: {
    minHeight: 64,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: "top",
  },
  tallInput: { minHeight: 96 },
  footer: { flexDirection: "row", alignItems: "center", gap: 8 },
  limits: { flex: 1, fontSize: 13, color: COLORS.muted },
  send: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.text,
  },
  disabled: { opacity: 0.4 },
  sendText: { fontSize: 14, fontWeight: "600", color: COLORS.onAccent },
});
