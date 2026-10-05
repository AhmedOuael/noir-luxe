import "server-only";
import { prisma } from "./prisma";

// Communes exist only for the 58-wilaya division for now; the 2025 wilayas
// (59-69) have none until their list is added, so orders there are confirmed
// with the wilaya only.

export type CommuneOption = { id: string; name: string };

export async function getCommuneOptions(wilayaId: bigint): Promise<CommuneOption[]> {
  const rows = await prisma.commune.findMany({
    where: { wilayaId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows.map((c) => ({ id: c.id.toString(), name: c.name }));
}
