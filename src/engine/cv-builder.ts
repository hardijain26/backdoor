export interface CVTemplate {
  targetRole: string;
  tailoredSections: string[];
}

export function buildTailoredCV(role: string): CVTemplate {
  return {
    targetRole: role,
    tailoredSections: ["Executive Summary", "Impact Metrics"],
  };
}
