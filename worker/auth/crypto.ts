// Password hashing via the Web Crypto API (PBKDF2, 100k iterations, SHA-256).
// bcrypt would blow the Workers 10ms CPU budget; PBKDF2 runs natively.

const ITERATIONS = 100_000;
const KEY_LEN = 32; // bytes
const HASH = 'SHA-256';

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function randomSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return toHex(salt.buffer);
}

async function derive(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex),
      iterations: ITERATIONS,
      hash: HASH,
    },
    keyMaterial,
    KEY_LEN * 8,
  );
  return toHex(bits);
}

export async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomSalt();
  const hash = await derive(password, salt);
  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await derive(password, saltHex);
  // constant-time-ish compare
  if (actual.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export function uuid(): string {
  return crypto.randomUUID();
}
