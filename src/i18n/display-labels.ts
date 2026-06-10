import type { CabinClass } from "@/lib/flight-types";
import type { OfferType, PaymentStatus } from "@/lib/types";
import type { Messages } from "./messages";

export function offerTypeLabel(m: Messages, type: OfferType): string {
  return m.offerTypes[type];
}

export function cabinClassLabel(m: Messages, cabin: CabinClass): string {
  const map: Record<CabinClass, string> = {
    economy: m.search.cabin.economy,
    premium_economy: m.search.cabin.premiumEconomy,
    business: m.search.cabin.business,
    first: m.search.cabin.first,
  };
  return map[cabin];
}

export function paymentStatusLabel(m: Messages, status: PaymentStatus): string {
  return m.paymentStatus[status];
}

export function cryptoPaymentLabel(m: Messages, method: string): string {
  const key = method as keyof typeof m.cryptoPayments;
  return m.cryptoPayments[key] ?? method;
}
