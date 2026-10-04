import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.wilaya.count();

  console.log(`Wilayas in database: ${count}`);

  const wilayas = await prisma.wilaya.findMany({
    orderBy: {
      code: "asc",
    },
  });

  for (const wilaya of wilayas) {
    console.log(`${wilaya.code} - ${wilaya.name}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });