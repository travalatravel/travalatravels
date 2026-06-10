/* eslint-disable @typescript-eslint/no-explicit-any */

export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export function deepMerge<T>(base: T, override: DeepPartial<T>): T {
  if (!override || typeof override !== "object") return base;
  const out = Array.isArray(base) ? ([...(base as unknown[])] as T) : ({ ...(base as object) } as T);

  for (const key of Object.keys(override) as (keyof T)[]) {
    const bVal = (base as any)[key];
    const oVal = (override as any)[key];
    if (Array.isArray(oVal)) {
      (out as any)[key] = oVal;
    } else if (oVal && typeof oVal === "object" && bVal && typeof bVal === "object" && !Array.isArray(bVal)) {
      (out as any)[key] = deepMerge(bVal, oVal);
    } else if (oVal !== undefined) {
      (out as any)[key] = oVal;
    }
  }
  return out;
}
