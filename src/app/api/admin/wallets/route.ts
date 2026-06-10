import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

const walletSchema = z.object({
  currency: z.enum(["BTC", "ETH", "USDC", "USDT", "SOL"]),
  label: z.string().min(2),
  address: z.string().min(10),
  network: z.string().min(2),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const wallets = await prisma.cryptoWallet.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    });
    return NextResponse.json({ wallets });
  });
}

export async function POST(request: Request) {
  return withAdmin(request, async (admin) => {
    try {
      const body = await request.json();
      const data = walletSchema.parse(body);

      const wallet = await prisma.cryptoWallet.create({
        data: { ...data, lastModifiedBy: admin.label },
      });

      return NextResponse.json({ wallet }, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
    }
  });
}
