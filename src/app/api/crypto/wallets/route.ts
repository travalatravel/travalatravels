import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wallets = await prisma.cryptoWallet.findMany({
    where: { isActive: true },
    orderBy: { currency: "asc" },
    select: {
      id: true,
      currency: true,
      label: true,
      address: true,
      network: true,
    },
  });
  return NextResponse.json({ wallets });
}
