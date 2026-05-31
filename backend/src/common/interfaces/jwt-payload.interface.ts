import { Role, TransportType } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  transportType?: TransportType;
}

export class AuthUser {
  id!: number;
  username!: string;
  role!: Role;
  transportType?: TransportType;
}
