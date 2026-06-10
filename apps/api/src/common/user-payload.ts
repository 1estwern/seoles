import { UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export const userPublicSelect = {
  id: true,
  email: true,
  role: true,
  specialty: true,
  createdAt: true,
} as const;
