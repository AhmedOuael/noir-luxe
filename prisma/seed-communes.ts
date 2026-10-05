// Seeds the 1,541 communes, attached to their wilaya by code. Safe to re-run.
// Run with: npx tsx prisma/seed-communes.ts
//
// Source: commune names from github.com/othmanus/algeria-cities (58-wilaya
// division). The 2025 wilayas (59-69) get no communes until their list is added.
// To be reconciled with the delivery company's commune list in phase 4.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import communes from "./data/communes.json";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting commune seeding...");

  const wilayas = await prisma.wilaya.findMany({ select: { id: true, code: true } });
  const wilayaIdByCode = new Map(wilayas.map((w) => [w.code, w.id]));

  const missing = [...new Set(communes.map((c) => c.wilayaCode))].filter((code) => !wilayaIdByCode.has(code));
  if (missing.length) throw new Error(`Wilayas not seeded yet: ${missing.join(", ")} (run prisma/seed.ts first)`);

  const { count } = await prisma.commune.createMany({
    data: communes.map((c) => ({ wilayaId: wilayaIdByCode.get(c.wilayaCode)!, name: c.name })),
    skipDuplicates: true,
  });

  console.log(`Inserted ${count} new communes (${communes.length} in the list).`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
