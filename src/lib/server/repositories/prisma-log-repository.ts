import { prisma } from '../db/prisma';
import type { LogRepository, MealLogInput } from '../../domain/repositories/log-repository';

export class PrismaLogRepository implements LogRepository {
  async createMealEntry(input: MealLogInput) {
    await prisma.mealEntry.create({
      data: {
        userId: input.userId,
        productId: input.productId,
        mealType: input.mealType,
        consumedAt: input.consumedAt,
        quantityValue: input.quantityValue,
        quantityUnit: input.quantityUnit,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        snapshotJson: input.snapshotJson
      }
    });
  }

  async listMealEntriesByDay(input: { userId: string; dayStart: Date; dayEnd: Date }) {
    return prisma.mealEntry.findMany({
      where: {
        userId: input.userId,
        consumedAt: {
          gte: input.dayStart,
          lt: input.dayEnd
        }
      },
      orderBy: {
        consumedAt: 'asc'
      },
      select: {
        id: true,
        mealType: true,
        consumedAt: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        quantityValue: true,
        quantityUnit: true
      }
    });
  }

  async createWaterEntry(input: { userId: string; amountMl: number; consumedAt: Date }) {
    await prisma.waterEntry.create({
      data: {
        userId: input.userId,
        amountMl: input.amountMl,
        consumedAt: input.consumedAt
      }
    });
  }

  async createActivityEntry(input: {
    userId: string;
    name: string;
    method: 'DIRECT_CALORIES' | 'ESTIMATED';
    durationMinutes?: number;
    distanceKm?: number;
    intensity?: number;
    caloriesBurned: number;
    startedAt: Date;
  }) {
    await prisma.activityEntry.create({
      data: {
        userId: input.userId,
        name: input.name,
        method: input.method,
        durationMinutes: input.durationMinutes,
        distanceKm: input.distanceKm,
        intensity: input.intensity,
        caloriesBurned: input.caloriesBurned,
        startedAt: input.startedAt
      }
    });
  }
}
