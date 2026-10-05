import type React from "react";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { usePrism } from "@priemskiyyy/prism-react";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { findMembership } from "examples/shared/courier/directory/findMembership";
import { findUserMembership } from "examples/shared/courier/directory/findUserMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { reportError } from "examples/shared/courier/utils/reportError";
import { ContextFooter } from "src/components/ContextFooter/ContextFooter";
import { Header } from "src/components/Header/Header";
import { MaintenanceBanner } from "src/components/MaintenanceBanner/MaintenanceBanner";
import { WorkspacePicker } from "src/components/WorkspacePicker/WorkspacePicker";
import { WorkspaceView } from "src/components/WorkspaceView/WorkspaceView";
import { COLORS } from "src/utils/constants/colors";

export const Application: React.FunctionComponent = () => {
  const flags = usePrism();
  const [membership, setMembership] = useState(INITIAL_MEMBERSHIP);
  const [pulling, setPulling] = useState(false);

  const selectMembership = (next: Membership) => {
    setMembership(next);
    flags.context(getCourierContext(next)).catch(reportError);
  };

  const handleWorkspaceSelect = (workspaceId: WorkspaceId) => {
    const next = findMembership(membership.userId, workspaceId);

    if (next === undefined) {
      return;
    }

    selectMembership(next);
  };

  const handleUserSelect = (userId: UserId) => {
    const next = findUserMembership(userId, membership.workspaceId);

    if (next === undefined) {
      return;
    }

    selectMembership(next);
  };

  const handleRefresh = () => {
    setPulling(true);
    flags
      .refresh()
      .catch(reportError)
      .finally(() => setPulling(false));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={pulling} onRefresh={handleRefresh} />
      }
    >
      <Header />
      <WorkspacePicker
        membership={membership}
        onWorkspaceSelect={handleWorkspaceSelect}
        onUserSelect={handleUserSelect}
      />
      <MaintenanceBanner />
      <WorkspaceView
        key={membership.workspaceId}
        workspaceId={membership.workspaceId}
      />
      <ContextFooter membership={membership} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { gap: 16, padding: 16, paddingTop: 64, paddingBottom: 40 },
});
