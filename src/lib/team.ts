export const TEAM_SECTIONS = [
  "founders",
  "executive_leadership",
  "leadership",
  "department_leads",
] as const;

export type TeamSection = (typeof TEAM_SECTIONS)[number];

export const TEAM_SECTION_LABELS: Record<TeamSection, string> = {
  founders: "Founders",
  executive_leadership: "Executive Leadership",
  leadership: "Leadership",
  department_leads: "Department Leads",
};
