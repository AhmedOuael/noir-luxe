// Creates the first ADMIN account (or resets an existing account's password and
// makes it an active ADMIN). Run with:
//   npx tsx prisma/create-admin.ts owner@example.com "Owner Name"
// The password is asked for interactively so it doesn't end up in shell history.
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/auth/password";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [emailArg, nameArg] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error('Usage: npx tsx prisma/create-admin.ts <email> "<name>"');
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question(`Password for ${email} (min ${MIN_PASSWORD_LENGTH} chars): `);
    rl.close();
  }
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", active: true, failedLoginCount: 0, lockedUntil: null, ...(nameArg ? { name: nameArg } : {}) },
    create: { email, name: nameArg ?? "", passwordHash, role: "ADMIN" },
  });
  console.log(`Admin ready: ${user.email} (id ${user.id})`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
