import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  language: string;
  theme: string;
  dashboardLayout: unknown;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        theme: true,
        dashboardLayout: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        theme: true,
        dashboardLayout: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.theme !== undefined && { theme: dto.theme }),
        ...(dto.dashboardLayout !== undefined && {
          // Исправлено: добавлено 'as any' для совместимости с типами JSON в Prisma
          dashboardLayout: dto.dashboardLayout as any,
        }),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        theme: true,
        dashboardLayout: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${userId} profile updated`);

    return updatedUser;
  }

  async delete(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`User ${userId} deleted`);
  }
}
