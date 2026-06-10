import type { CabinClass } from "@/lib/flight-types";
import type { Messages } from "./messages";

export function cabinLabel(cabin: CabinClass, messages: Messages): string {
  const key =
    cabin === "premium_economy"
      ? "premiumEconomy"
      : cabin;
  return messages.search.cabin[key as keyof typeof messages.search.cabin];
}
