import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const wilayas = [
  { code: "01", name: "Adrar" },
  { code: "02", name: "Chlef" },
  { code: "03", name: "Laghouat" },
  { code: "04", name: "Oum El Bouaghi" },
  { code: "05", name: "Batna" },
  { code: "06", name: "Béjaïa" },
  { code: "07", name: "Biskra" },
  { code: "08", name: "Béchar" },
  { code: "09", name: "Blida" },
  { code: "10", name: "Bouïra" },
  { code: "11", name: "Tamanrasset" },
  { code: "12", name: "Tébessa" },
  { code: "13", name: "Tlemcen" },
  { code: "14", name: "Tiaret" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "16", name: "Algiers" },
  { code: "17", name: "Djelfa" },
  { code: "18", name: "Jijel" },
  { code: "19", name: "Sétif" },
  { code: "20", name: "Saïda" },
  { code: "21", name: "Skikda" },
  { code: "22", name: "Sidi Bel Abbès" },
  { code: "23", name: "Annaba" },
  { code: "24", name: "Guelma" },
  { code: "25", name: "Constantine" },
  { code: "26", name: "Médéa" },
  { code: "27", name: "Mostaganem" },
  { code: "28", name: "M'Sila" },
  { code: "29", name: "Mascara" },
  { code: "30", name: "Ouargla" },
  { code: "31", name: "Oran" },
  { code: "32", name: "El Bayadh" },
  { code: "33", name: "Illizi" },
  { code: "34", name: "Bordj Bou Arréridj" },
  { code: "35", name: "Boumerdès" },
  { code: "36", name: "El Tarf" },
  { code: "37", name: "Tindouf" },
  { code: "38", name: "Tissemsilt" },
  { code: "39", name: "El Oued" },
  { code: "40", name: "Khenchela" },
  { code: "41", name: "Souk Ahras" },
  { code: "42", name: "Tipaza" },
  { code: "43", name: "Mila" },
  { code: "44", name: "Aïn Defla" },
  { code: "45", name: "Naâma" },
  { code: "46", name: "Aïn Témouchent" },
  { code: "47", name: "Ghardaïa" },
  { code: "48", name: "Relizane" },
  { code: "49", name: "Timimoun" },
  { code: "50", name: "Bordj Badji Mokhtar" },
  { code: "51", name: "Ouled Djellal" },
  { code: "52", name: "Béni Abbès" },
  { code: "53", name: "In Salah" },
  { code: "54", name: "In Guezzam" },
  { code: "55", name: "Touggourt" },
  { code: "56", name: "Djanet" },
  { code: "57", name: "El M'Ghair" },
  { code: "58", name: "El Menia" },
  { code: "59", name: "Aflou" },
  { code: "60", name: "Barika" },
  { code: "61", name: "El Kantara" },
  { code: "62", name: "Bir El Ater" },
  { code: "63", name: "El Aricha" },
  { code: "64", name: "Ksar Chellala" },
  { code: "65", name: "Aïn Oussera" },
  { code: "66", name: "Messaad" },
  { code: "67", name: "Ksar El Boukhari" },
  { code: "68", name: "Bousaâda" },
  { code: "69", name: "El Abiodh Sidi Cheikh" },
];

async function main() {
  console.log("Starting wilaya seeding...");

  // Batch insert/update using createMany or transaction for speed
  for (const wilaya of wilayas) {
    await prisma.wilaya.upsert({
      where: { code: wilaya.code },
      update: { name: wilaya.name },
      create: wilaya,
    });
  }

  console.log(`Seeded ${wilayas.length} wilayas successfully.`);
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