import { describe, expect, it } from 'vitest';
import { estimateCaloriesBurned } from '../../src/lib/domain/activity';

describe('estimateCaloriesBurned', () => {
  it('returns a positive estimate for valid activity inputs', () => {
    const burned = estimateCaloriesBurned({
      durationMinutes: 45,
      distanceKm: 6,
      intensity: 1.2,
      userWeightKg: 72
    });

    expect(burned).toBeGreaterThan(0);
  });

  it('never returns a negative number', () => {
    const burned = estimateCaloriesBurned({
      durationMinutes: 0,
      distanceKm: 0,
      intensity: 0,
      userWeightKg: 70
    });

    expect(burned).toBe(0);
  });
});
