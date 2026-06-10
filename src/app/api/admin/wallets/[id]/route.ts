import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

const updateSchema = z.object({
  currency: z.enum(["BTC", "ETH", "USDC", "USDT", "SOL"]).optional(),
  label: z.string().min(2).optional(),
  address: z.string().min(10).optional(),
  network: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async (admin) => {
    const { id } = await params;
    try {
      const body = await request.json();
      const data = updateSchema.parse(body);

      const wallet = await prisma.cryptoWallet.update({
        where: { id },
        data: { ...data, lastModifiedBy: admin.label },
      });

      return NextResponse.json({ wallet });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async () => {
    const { id } = await params;
    const used = await prisma.booking.count({ where: { walletId: id } });
    if (used > 0) {
      await prisma.cryptoWallet.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ message: "Wallet deactivated (has bookings)" });
    }
    await prisma.cryptoWallet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
