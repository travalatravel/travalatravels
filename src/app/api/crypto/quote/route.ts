import { NextResponse } from "next/server";
import { z } from "zod";
import { getCryptoQuote } from "@/lib/crypto-rates";

const schema = z.object({
  currency: z.enum(["BTC", "ETH", "USDC", "USDT", "LTC", "SOL"]),
  usd: z.coerce.number().positive(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({
    currency: searchParams.get("currency")?.toUpperCase(),
    usd: searchParams.get("usd"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const quote = await getCryptoQuote(parsed.data.currency, parsed.data.usd);
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: "Could not fetch exchange rate" }, { status: 502 });
  }
}
