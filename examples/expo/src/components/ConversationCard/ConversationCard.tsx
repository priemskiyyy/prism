import type React from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { AssistantSuggestions } from "src/components/AssistantSuggestions/AssistantSuggestions";
import { Card } from "src/components/Card/Card";
import { Composer } from "src/components/Composer/Composer";
import { COLORS } from "src/utils/constants/colors";

type ConversationCardProps = { conversation: Conversation };

export const ConversationCard: React.FunctionComponent<
  ConversationCardProps
> = ({ conversation }) => {
  const [draft, setDraft] = useState("");

  return (
    <Card
      title={`${conversation.contact} · ${CHANNEL_LABELS[conversation.channel]}`}
      flagKeys={["assistant", "composer", "uploads"]}
    >
      <View style={styles.messages}>
        {conversation.messages.map((message) => (
          <Text
            key={message.text}
            style={[
              styles.bubble,
              message.from === "agent" ? styles.agent : styles.contact,
            ]}
          >
            {message.text}
          </Text>
        ))}
      </View>
      <AssistantSuggestions onSuggestionPick={setDraft} />
      <Composer draft={draft} onDraftChange={setDraft} />
    </Card>
  );
};

const styles = StyleSheet.create({
  messages: { gap: 6 },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    overflow: "hidden",
    fontSize: 15,
    lineHeight: 21,
  },
  contact: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  agent: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.accent,
    color: COLORS.onAccent,
  },
});
