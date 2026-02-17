import type { MealType } from '../types';

export type MealLogInput = {
  userId: string;
  productId?: string;
  mealType: MealType;
  consumedAt: Date;
  quantityValue: number;
  quantityUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  snapshotJson: string;
};

export interface LogRepository {
  createMealEntry(input: MealLogInput): Promise<void>;
  listMealEntriesByDay(input: { userId: string; dayStart: Date; dayEnd: Date }): Promise<
    Array<{
      id: string;
      mealType: MealType;
      consumedAt: Date;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      quantityValue: number;
      quantityUnit: string;
    }>
  >;
  createWaterEntry(input: { userId: string; amountMl: number; consumedAt: Date }): Promise<void>;
  createActivityEntry(input: {
    userId: string;
    name: string;
    method: 'DIRECT_CALORIES' | 'ESTIMATED';
    durationMinutes?: number;
    distanceKm?: number;
    intensity?: number;
    caloriesBurned: number;
    startedAt: Date;
  }): Promise<void>;
}
