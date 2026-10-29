export interface CadenceStep {
  stepNumber: number;
  channel: string;
  delayDays: number;
}

export function generateCadence(door: "door1" | "door2" | "door3"): CadenceStep[] {
  return [
    { stepNumber: 1, channel: "email", delayDays: 0 },
    { stepNumber: 2, channel: "linkedin", delayDays: 3 },
  ];
}
