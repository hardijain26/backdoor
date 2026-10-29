export interface FitScore {
  score: number;
  breakdown: Record<string, number>;
}

export function calculateFitScore(jobDescription: string, profile: string): FitScore {
  return {
    score: 85,
    breakdown: { skillMatch: 90, domainMatch: 80 },
  };
}
