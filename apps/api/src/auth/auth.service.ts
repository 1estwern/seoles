import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtPayload, userPublicSelect } from '../common/user-payload';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user.id, user.email, user.role);
    this.setCookie(res, token);
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userPublicSelect,
    });
  }

  logout(res: Response) {
    res.clearCookie('access_token', this.cookieOptions());
    return { ok: true };
  }

  private async signToken(sub: string, email: string, role: JwtPayload['role']) {
    return this.jwt.signAsync({ sub, email, role });
  }

  setCookie(res: Response, token: string) {
    res.cookie('access_token', token, this.cookieOptions());
  }

  private cookieOptions() {
    const secure = this.config.get('COOKIE_SECURE') === 'true';
    return {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }
}
