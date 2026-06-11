import { NextResponse } from "next/server";
import { z } from "zod";
import { getCryptoQuote } from "@/lib/crypto-rates";
import { getOrLockBtcQuote } from "@/lib/btc-verify";

const schema = z.object({
  currency: z.enum(["BTC", "ETH", "USDC", "USDT", "LTC", "SOL"]),
  usd: z.coerce.number().positive(),
  bookingId: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({
    currency: searchParams.get("currency")?.toUpperCase(),
    usd: searchParams.get("usd"),
    bookingId: searchParams.get("bookingId") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    // BTC amounts are locked per booking (unique satoshi suffix) so the
    // on-chain watcher can match the incoming payment unambiguously.
    if (parsed.data.currency === "BTC" && parsed.data.bookingId) {
      const locked = await getOrLockBtcQuote(parsed.data.bookingId, parsed.data.usd);
      if (locked) return NextResponse.json({ quote: locked });
    }

    const quote = await getCryptoQuote(parsed.data.currency, parsed.data.usd);
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: "Could not fetch exchange rate" }, { status: 502 });
  }
}
