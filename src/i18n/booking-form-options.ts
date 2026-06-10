import type { Messages } from "./messages";

const ARRIVAL_SLOT_KEYS: Record<string, keyof Messages["checkout"]["arrivalSlots"]> = {
  "I don't know yet": "unknown",
  "12:00 – 14:00": "slot1214",
  "14:00 – 16:00": "slot1416",
  "16:00 – 18:00": "slot1618",
  "18:00 – 20:00": "slot1820",
  "20:00 – 22:00": "slot2022",
  "After 22:00": "after2200",
};

export function arrivalSlotLabel(m: Messages, value: string): string {
  const key = ARRIVAL_SLOT_KEYS[value];
  return key ? m.checkout.arrivalSlots[key] : value;
}

export function countryLabel(m: Messages, country: string): string {
  const names = m.checkout.countryNames as Record<string, string>;
  return names[country] ?? country;
}
