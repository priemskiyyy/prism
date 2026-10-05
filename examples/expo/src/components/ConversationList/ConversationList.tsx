import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import { COLORS } from "src/utils/constants/colors";

type ConversationListProps = {
  inbox: Inbox;
  onConversationSelect: (id: string) => void;
};

export const ConversationList: React.FunctionComponent<
  ConversationListProps
> = ({ inbox, onConversationSelect }) => {
  if (inbox.conversations.length === 0) {
    return (
      <Text style={styles.empty}>
        This channel has no conversations in the current workspace.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {inbox.conversations.map((conversation) => {
        const selected = conversation.id === inbox.selected?.id;

        return (
          <Pressable
            key={conversation.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${conversation.contact} on ${CHANNEL_LABELS[conversation.channel]}`}
            onPress={() => onConversationSelect(conversation.id)}
            style={[styles.row, selected && styles.selected]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {conversation.contact.slice(0, 1)}
              </Text>
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.contact} numberOfLines={1}>
                  {conversation.contact}
                </Text>
                <Text style={styles.time}>{conversation.time}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {CHANNEL_LABELS[conversation.channel]} · {conversation.preview}
              </Text>
            </View>
            {conversation.unread === 0 ? null : (
              <View style={styles.unread}>
                <Text style={styles.unreadText}>{conversation.unread}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { marginHorizontal: -8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    borderRadius: 12,
  },
  selected: { backgroundColor: COLORS.accentSoft },
  avatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  avatarText: { fontSize: 16, fontWeight: "600", color: COLORS.body },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  contact: { flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.text },
  time: { fontSize: 12, color: COLORS.muted },
  preview: { fontSize: 13, color: COLORS.muted },
  unread: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
  unreadText: { fontSize: 12, fontWeight: "700", color: COLORS.onAccent },
  empty: { fontSize: 14, color: COLORS.muted },
});
