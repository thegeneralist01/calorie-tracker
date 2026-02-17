export function estimateCaloriesBurned(input: {
  durationMinutes?: number;
  distanceKm?: number;
  intensity?: number;
  userWeightKg?: number;
}): number {
  const duration = input.durationMinutes ?? 0;
  const distance = input.distanceKm ?? 0;
  const intensity = input.intensity ?? 1;
  const weightKg = input.userWeightKg ?? 70;

  const baseFromTime = duration * 4.5;
  const baseFromDistance = distance * 55;
  const weighted = (baseFromTime + baseFromDistance) * intensity * (weightKg / 70);

  return Math.max(0, Math.round(weighted));
}
