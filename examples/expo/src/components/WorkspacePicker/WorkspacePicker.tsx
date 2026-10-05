import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  PLAN_LABELS,
  REGION_LABELS,
  ROLE_LABELS,
} from "examples/shared/courier/constants/labels";
import { USER_IDS, USERS } from "examples/shared/courier/constants/users";
import { WORKSPACES } from "examples/shared/courier/constants/workspaces";
import { getMemberships } from "examples/shared/courier/directory/getMemberships";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { COLORS } from "src/utils/constants/colors";

type WorkspacePickerProps = {
  membership: Membership;
  onWorkspaceSelect: (workspaceId: WorkspaceId) => void;
  onUserSelect: (userId: UserId) => void;
};

export const WorkspacePicker: React.FunctionComponent<WorkspacePickerProps> = ({
  membership,
  onWorkspaceSelect,
  onUserSelect,
}) => (
  <View style={styles.picker}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.workspaces}
    >
      {getMemberships(membership.userId).map(({ workspaceId, role }) => {
        const workspace = WORKSPACES[workspaceId];
        const selected = workspaceId === membership.workspaceId;

        return (
          <Pressable
            key={workspaceId}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onWorkspaceSelect(workspaceId)}
            style={[styles.workspace, selected && styles.selectedWorkspace]}
          >
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{workspace.initials}</Text>
            </View>
            <View>
              <Text style={styles.name}>{workspace.name}</Text>
              <Text style={styles.meta}>
                {PLAN_LABELS[workspace.plan]} ·{" "}
                {REGION_LABELS[workspace.region]} · {ROLE_LABELS[role]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
    <View style={styles.users} accessibilityRole="tablist">
      {USER_IDS.map((id) => {
        const selected = id === membership.userId;

        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onUserSelect(id)}
            style={[styles.user, selected && styles.selectedUser]}
          >
            <Text
              style={[styles.userText, selected && styles.selectedUserText]}
            >
              {USERS[id].name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  picker: { gap: 12 },
  workspaces: { gap: 8 },
  workspace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selectedWorkspace: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentSoft,
  },
  initials: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  initialsText: { fontSize: 14, fontWeight: "700", color: COLORS.onAccent },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.muted },
  users: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  user: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectedUser: { backgroundColor: COLORS.surface },
  userText: { fontSize: 14, fontWeight: "500", color: COLORS.muted },
  selectedUserText: { color: COLORS.text },
});
