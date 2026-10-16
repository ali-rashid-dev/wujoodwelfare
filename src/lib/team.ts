export const TEAM_SECTIONS = [
  "founders",
  "executive_leadership",
  "coordinators",
  "department_leads",
  "team_members_volunteers",
] as const;

export type TeamSection = (typeof TEAM_SECTIONS)[number];

export const TEAM_SECTION_LABELS: Record<TeamSection, string> = {
  founders: "Founders",
  executive_leadership: "Executive Leadership",
  coordinators: "Coordinators",
  department_leads: "Department Leads",
  team_members_volunteers: "Team Members and Volunteers",
};
