import { MAINTENANCE_MESSAGE } from "examples/shared/courier/constants/maintenanceNotice";
import {
  CHANNELS_BY_PLAN,
  CONTACT_LIMITS,
  DAILY_RECIPIENTS,
  UPLOADS_BY_PLAN,
} from "examples/shared/courier/constants/planLimits";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { CourierRules } from "examples/shared/courier/types/CourierRules";
import type { ProviderEvaluation } from "examples/shared/courier/types/ProviderEvaluation";

const getSwitch = (enabled: boolean): ProviderEvaluation => ({
  value: enabled,
  variant: enabled ? "on" : "off",
});

const getChannels = (
  { corruptChannels }: CourierRules,
  { plan }: CourierContext,
): ProviderEvaluation => {
  if (corruptChannels) {
    return { value: ["whatsapp", "fax"], variant: "corrupt" };
  }

  return { value: CHANNELS_BY_PLAN[plan], variant: plan };
};

const isAssistantEnabled = (
  { assistantRollout }: CourierRules,
  { plan }: CourierContext,
) => {
  if (assistantRollout === "EVERYONE") {
    return true;
  }

  return assistantRollout === "PAID" && plan !== "starter";
};

const isComposerEnabled = (
  { composerRollout }: CourierRules,
  { role }: CourierContext,
) => {
  if (composerRollout === "EVERYONE") {
    return true;
  }

  return composerRollout === "ADMINS" && role === "admin";
};

const getLayout = ({ userId }: CourierContext): ProviderEvaluation => {
  if (userId === "alex") {
    return { value: "split", variant: "split-view" };
  }

  return { value: "classic", variant: "control" };
};

const getCampaigns = ({ role, plan }: CourierContext): ProviderEvaluation => {
  if (role !== "admin" || plan === "starter") {
    return {
      value: { enabled: false, dailyRecipients: 0 },
      variant: "disabled",
    };
  }

  return {
    value: { enabled: true, dailyRecipients: DAILY_RECIPIENTS[plan] },
    variant: plan,
  };
};

const getMaintenance = (
  { maintenance }: CourierRules,
  { region }: CourierContext,
): ProviderEvaluation => {
  if (!maintenance || region !== "eu") {
    return { value: null, variant: "none" };
  }

  return { value: { message: MAINTENANCE_MESSAGE }, variant: "scheduled" };
};

export const evaluateCourierFlags = (
  context: CourierContext,
  rules: CourierRules,
) =>
  new Map<string, ProviderEvaluation>([
    ["channels", getChannels(rules, context)],
    ["ai-assistant", getSwitch(isAssistantEnabled(rules, context))],
    ["new-composer", getSwitch(isComposerEnabled(rules, context))],
    ["inbox-layout", getLayout(context)],
    [
      "uploads",
      { value: UPLOADS_BY_PLAN[context.plan], variant: context.plan },
    ],
    ["campaigns", getCampaigns(context)],
    [
      "contact-limit",
      { value: CONTACT_LIMITS[context.plan], variant: context.plan },
    ],
    ["maintenance", getMaintenance(rules, context)],
  ]);
