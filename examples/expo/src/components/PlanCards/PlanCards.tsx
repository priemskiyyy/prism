import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFlag } from "@priemskiyyy/prism-react";
import { CONTACT_USAGE } from "examples/shared/courier/constants/contactUsage";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { formatCount } from "examples/shared/courier/utils/formatCount";
import { Card } from "src/components/Card/Card";
import { COLORS } from "src/utils/constants/colors";

type PlanCardsProps = { workspaceId: WorkspaceId };

export const PlanCards: React.FunctionComponent<PlanCardsProps> = ({
  workspaceId,
}) => {
  const limit = useFlag("contactLimit");
  const campaigns = useFlag("campaigns");
  const used = CONTACT_USAGE[workspaceId];
  const ratio = Math.min(used / limit, 1);

  return (
    <Card title="Plan usage" flagKeys={["contactLimit", "campaigns"]}>
      <View style={styles.metric}>
        <Text style={styles.label}>Contacts</Text>
        <Text style={styles.value}>
          {formatCount(used)}
          <Text style={styles.unit}> of {formatCount(limit)}</Text>
        </Text>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: limit,
            now: Math.min(used, limit),
          }}
        >
          <View
            style={[
              styles.fill,
              { width: `${ratio * 100}%` },
              ratio >= 1 && styles.full,
            ]}
          />
        </View>
      </View>
      <View style={styles.metric}>
        <Text style={styles.label}>Broadcasts</Text>
        {campaigns.enabled ? (
          <Text style={styles.value}>
            {formatCount(campaigns.dailyRecipients)}
            <Text style={styles.unit}> recipients a day</Text>
          </Text>
        ) : (
          <Text style={styles.unit}>
            Admins on Business and Enterprise send broadcasts.
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  metric: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.body },
  value: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  unit: { fontSize: 13, fontWeight: "400", color: COLORS.muted },
  track: {
    height: 6,
    marginTop: 4,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  full: { backgroundColor: COLORS.danger },
});
