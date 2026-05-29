// ELO-style SimScore. User starts at 1000.
// Each scenario has a baseRating that represents its "difficulty".
// Win/loss/draw is derived from the average grade across rubric dimensions.
// k = volatility per match (32 default, lowered as user accumulates sessions)

export type GradeResult = {
  rapport: number; // 0-100
  discovery: number;
  objectionHandling: number;
  close: number;
  ethicsFlags: string[];
};

export function avgGrade(g: GradeResult): number {
  return (g.rapport + g.discovery + g.objectionHandling + g.close) / 4;
}

export function expectedScore(userRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - userRating) / 400));
}

// Map 0-100 grade to ELO outcome 0-1
// 70+ = win, 50-70 = draw band, <50 = loss
function gradeToOutcome(grade: number): number {
  if (grade >= 80) return 1.0;
  if (grade >= 70) return 0.8;
  if (grade >= 60) return 0.5;
  if (grade >= 50) return 0.3;
  return 0.0;
}

export function newRating(
  userRating: number,
  opponentRating: number,
  grade: number,
  k: number = 32
): { newRating: number; delta: number } {
  const expected = expectedScore(userRating, opponentRating);
  const actual = gradeToOutcome(grade);
  const delta = Math.round(k * (actual - expected));
  return { newRating: userRating + delta, delta };
}
