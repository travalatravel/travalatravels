import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";
import { WALLET_BACKUP_VERSION, walletBackupFilename } from "@/lib/wallet-backup";

export async function GET(request: Request) {
  return withAdmin(request, async () => {
    const wallets = await prisma.cryptoWallet.findMany({
      orderBy: [{ currency: "asc" }, { label: "asc" }],
      select: {
        currency: true,
        label: true,
        address: true,
        network: true,
        isActive: true,
      },
    });

    const payload = {
      version: WALLET_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      wallets,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${walletBackupFilename()}"`,
      },
    });
  });
}
