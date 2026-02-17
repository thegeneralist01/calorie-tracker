import { describe, expect, it } from 'vitest';
import { activityCreateSchema, mealCreateSchema, waterCreateSchema } from '../../src/lib/schemas/log';

describe('mealCreateSchema', () => {
  it('validates a complete meal payload', () => {
    const result = mealCreateSchema.safeParse({
      mealType: 'LUNCH',
      quantityValue: 200,
      quantityUnit: 'g',
      calories: 320,
      protein: 18,
      carbs: 24,
      fat: 14,
      snapshot: {
        itemName: 'Meal prep bowl'
      }
    });

    expect(result.success).toBe(true);
  });
});

describe('waterCreateSchema', () => {
  it('rejects non-positive values', () => {
    expect(waterCreateSchema.safeParse({ amountMl: 0 }).success).toBe(false);
    expect(waterCreateSchema.safeParse({ amountMl: 250 }).success).toBe(true);
  });
});

describe('activityCreateSchema', () => {
  it('accepts direct calories method', () => {
    expect(
      activityCreateSchema.safeParse({
        name: 'Cycling',
        method: 'DIRECT_CALORIES',
        caloriesBurned: 340
      }).success
    ).toBe(true);
  });

  it('accepts estimated method', () => {
    expect(
      activityCreateSchema.safeParse({
        name: 'Run',
        method: 'ESTIMATED',
        durationMinutes: 30,
        intensity: 1.2
      }).success
    ).toBe(true);
  });
});
