import type { Section } from "src/types/Section";
import type { SectionId } from "src/types/SectionId";

export const SECTIONS: Record<SectionId, Section> = {
  workspace: { number: 1, title: "Your workspace", label: "Workspace" },
  flags: { number: 2, title: "Every flag, typed", label: "Flags" },
  providers: { number: 3, title: "Swap the provider", label: "Providers" },
  lab: { number: 4, title: "Break the flag service", label: "Lab" },
  timeline: { number: 5, title: "Watch it happen", label: "Timeline" },
};

export const SECTION_IDS: SectionId[] = [
  "workspace",
  "flags",
  "providers",
  "lab",
  "timeline",
];
