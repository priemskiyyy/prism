import type { Tone } from "examples/shared/ui/types/Tone";

export const COLORS = {
  background: "#f4f4f5",
  surface: "#ffffff",
  sunken: "#fafafa",
  border: "#e4e4e7",
  text: "#18181b",
  body: "#3f3f46",
  muted: "#71717a",
  faint: "#a1a1aa",
  accent: "#6366f1",
  accentSoft: "#eef2ff",
  accentBorder: "#c7d2fe",
  accentText: "#4338ca",
  onAccent: "#ffffff",
  noticeSoft: "#fffbeb",
  noticeBorder: "#fcd34d",
  noticeText: "#78350f",
  danger: "#e11d48",
};

export const TONE_COLORS: Record<Tone, string> = {
  neutral: "#a1a1aa",
  positive: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  accent: "#6366f1",
};
