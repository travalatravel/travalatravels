import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const total = await prisma.offer.count({ where: { type: "HOTEL" } });
const germany = await prisma.$queryRawUnsafe(
  `SELECT COUNT(*) as cnt FROM Offer WHERE type = 'HOTEL' AND LOWER(country) LIKE '%germany%'`,
);
console.log({ total, germany: Number(germany[0]?.cnt ?? 0) });
await prisma.$disconnect();
