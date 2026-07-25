import { SignJWT, jwtVerify } from 'jose';
import type { Role } from '@shared/types';

const ALG = 'HS256';
const TOKEN_TTL = '12h';

export interface TokenPayload {
  sub: string; // user id
  role: Role;
  org: string; // organisation id
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: TokenPayload,
  secret: string,
): Promise<string> {
  return new SignJWT({ role: payload.role, org: payload.org })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secretKey(secret));
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      role: payload.role as Role,
      org: payload.org as string,
    };
  } catch {
    return null;
  }
}

export const COOKIE_NAME = 'bridge_token';

export function buildAuthCookie(token: string): string {
  // 12h in seconds
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${12 * 60 * 60}`;
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
