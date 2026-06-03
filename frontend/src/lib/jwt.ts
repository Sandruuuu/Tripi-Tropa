export type UserRole = 'ADMIN' | 'CUSTOMER' | 'VENDOR';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
  transportType?: 'PLANE' | 'BUS' | 'SHIP';
  iat?: number;
  exp?: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getLoginRedirect(role: UserRole): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'VENDOR') return '/vendor';
  return '/schedules';
}
