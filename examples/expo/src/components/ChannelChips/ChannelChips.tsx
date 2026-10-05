import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import {
  CHANNEL_IDS,
  CHANNEL_LABELS,
} from "examples/shared/courier/constants/channels";
import { getChannelState } from "examples/shared/courier/inbox/getChannelState";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import { COLORS } from "src/utils/constants/colors";

type ChannelChipsProps = {
  channels: ChannelId[];
  inbox: Inbox;
  onFilterSelect: (channel: ChannelId | undefined) => void;
};

export const ChannelChips: React.FunctionComponent<ChannelChipsProps> = ({
  channels,
  inbox,
  onFilterSelect,
}) => {
  const countOf = (channel: ChannelId) =>
    inbox.available.filter((conversation) => conversation.channel === channel)
      .length;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: inbox.filter === undefined }}
        onPress={() => onFilterSelect(undefined)}
        style={[styles.chip, inbox.filter === undefined && styles.selected]}
      >
        <Text
          style={[
            styles.label,
            inbox.filter === undefined && styles.selectedLabel,
          ]}
        >
          All · {inbox.available.length}
        </Text>
      </Pressable>
      {CHANNEL_IDS.map((channel) => {
        const state = getChannelState(channel, channels, inbox.filter);

        return (
          <Pressable
            key={channel}
            accessibilityRole="button"
            accessibilityState={{
              selected: state === "selected",
              disabled: state === "locked",
            }}
            disabled={state === "locked"}
            onPress={() => onFilterSelect(channel)}
            style={[
              styles.chip,
              state === "selected" && styles.selected,
              state === "locked" && styles.locked,
            ]}
          >
            <Text
              style={[
                styles.label,
                state === "selected" && styles.selectedLabel,
                state === "locked" && styles.lockedLabel,
              ]}
            >
              {CHANNEL_LABELS[channel]} ·{" "}
              {state === "locked" ? "locked" : countOf(channel)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chips: { gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  locked: { borderStyle: "dashed", backgroundColor: COLORS.sunken },
  label: { fontSize: 13, fontWeight: "500", color: COLORS.body },
  selectedLabel: { color: COLORS.onAccent },
  lockedLabel: { color: COLORS.faint },
});
