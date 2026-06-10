import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [hotels, flights, cars, acts, total] = await Promise.all([
    prisma.offer.count({ where: { type: "HOTEL" } }),
    prisma.offer.count({ where: { type: "FLIGHT" } }),
    prisma.offer.count({ where: { type: "CAR_RENTAL" } }),
    prisma.offer.count({ where: { type: "ACTIVITY" } }),
    prisma.offer.count(),
  ]);
  console.log(JSON.stringify({ hotels, flights, carRentals: cars, activities: acts, total }));
}

main().finally(() => prisma.$disconnect());
