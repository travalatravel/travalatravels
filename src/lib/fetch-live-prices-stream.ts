import type { LivePriceResult } from "@/lib/travala-price";

export async function fetchLivePricesStream(
  input: {
    offerIds: string[];
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  },
  onPrice: (id: string, price: LivePriceResult) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/hotel-live-prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ ...input, stream: true }),
  });

  if (!res.ok || !res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line) as { id: string; price: LivePriceResult };
        if (row.id && row.price) onPrice(row.id, row.price);
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
}
