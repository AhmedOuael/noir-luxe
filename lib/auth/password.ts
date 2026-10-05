import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Node's built-in scrypt (memory-hard: ~16MB per hash), stored as
// "scrypt$N$r$p$salt$hash" (base64url) so the cost can be raised later
// without invalidating existing passwords.
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export const MIN_PASSWORD_LENGTH = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  // A malformed hash can decode to 0 bytes; scrypt would then derive 0 bytes and
  // timingSafeEqual(empty, empty) is true, accepting ANY password. Reject it.
  if (expected.length === 0) return false;
  try {
    const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    // Constant-time compare: doesn't leak how many bytes matched.
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    // Invalid parameters in a corrupted/legacy row (e.g. N not a power of two).
    return false;
  }
}

// Verified against when the email doesn't exist, so response time doesn't reveal valid emails.
let dummyHash: Promise<string> | null = null;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}
