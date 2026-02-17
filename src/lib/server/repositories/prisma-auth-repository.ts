import { prisma } from '../db/prisma';
import type { AuthRepository, NewSessionInput, NewUserInput } from '../../domain/repositories/auth-repository';

function mapProfile(user: { id: string; username: string; email: string; locale: string; isAdmin: boolean }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    locale: (user.locale === 'de' ? 'de' : 'en') as 'en' | 'de',
    isAdmin: user.isAdmin
  };
}

export class PrismaAuthRepository implements AuthRepository {
  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        locale: true,
        isAdmin: true
      }
    });

    if (!user) {
      return null;
    }

    return mapProfile(user);
  }

  async findUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        locale: true,
        isAdmin: true
      }
    });

    if (!user) {
      return null;
    }

    return mapProfile(user);
  }

  async findAuthUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        locale: true,
        isAdmin: true,
        passwordHash: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...mapProfile(user),
      passwordHash: user.passwordHash
    };
  }

  async createUser(input: NewUserInput) {
    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash: input.passwordHash,
        locale: input.locale,
        goal: {
          create: {
            type: input.goalType,
            calorieFormula: 'MIFFLIN_ST_JEOR',
            adaptiveSuggestions: true,
            requiresApproval: true
          }
        },
        settings: {
          create: {
            waterGoalLiters: 2
          }
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        locale: true,
        isAdmin: true
      }
    });

    return mapProfile(user);
  }

  async createSession(input: NewSessionInput) {
    await prisma.session.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        rememberDevice: input.rememberDevice,
        expiresAt: input.expiresAt,
        recentAuthAt: new Date(),
        lastActiveAt: new Date()
      }
    });
  }

  async findSession(tokenHash: string) {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            locale: true,
            isAdmin: true
          }
        }
      }
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return {
      ...mapProfile(session.user),
      sessionId: session.id,
      expiresAt: session.expiresAt,
      recentAuthAt: session.recentAuthAt
    };
  }

  async updateSessionActivity(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() }
    });
  }

  async deleteSession(tokenHash: string) {
    await prisma.session.deleteMany({
      where: { tokenHash }
    });
  }

  async scheduleUserDeletion(userId: string, scheduledDeletionAt: Date) {
    await prisma.user.update({
      where: { id: userId },
      data: { scheduledDeletionAt }
    });
  }

  async undoUserDeletion(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { scheduledDeletionAt: null }
    });
  }
}
