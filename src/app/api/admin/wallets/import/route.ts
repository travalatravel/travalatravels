import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";
import { walletBackupFileSchema } from "@/lib/wallet-backup";

const importBodySchema = z.object({
  file: walletBackupFileSchema,
});

export async function POST(request: Request) {
  return withAdmin(request, async (admin) => {
    try {
      const body = await request.json();
      const { file } = importBodySchema.parse(body);

      let created = 0;
      let updated = 0;

      for (const entry of file.wallets) {
        const existing = await prisma.cryptoWallet.findFirst({
          where: {
            OR: [
              { currency: entry.currency, address: entry.address },
              { currency: entry.currency, network: entry.network },
            ],
          },
        });

        if (existing) {
          await prisma.cryptoWallet.update({
            where: { id: existing.id },
            data: {
              currency: entry.currency,
              label: entry.label,
              address: entry.address,
              network: entry.network,
              isActive: entry.isActive,
              lastModifiedBy: admin.label,
            },
          });
          updated += 1;
        } else {
          await prisma.cryptoWallet.create({
            data: {
              ...entry,
              lastModifiedBy: admin.label,
            },
          });
          created += 1;
        }
      }

      const wallets = await prisma.cryptoWallet.findMany({
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { bookings: true } } },
      });

      return NextResponse.json({
        ok: true,
        created,
        updated,
        total: wallets.length,
        wallets,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0]?.message || "Invalid backup file" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to import wallets" }, { status: 500 });
    }
  });
}
