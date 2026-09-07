import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RegisterInput, LoginInput, UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class AuthService {
  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private generateAccessToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  private async createRefreshToken(userId: string) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role || UserRole.REPORTER,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw ApiError.forbidden('User account is inactive');
    }

    const accessToken = this.generateAccessToken(storedToken.user);

    return {
      accessToken,
    };
  }

  async logout(token: string) {
    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
    }
    return { success: true };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return this.formatUser(user);
  }
}

export const authService = new AuthService();
