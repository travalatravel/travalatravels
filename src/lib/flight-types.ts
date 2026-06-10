export type TripType = "roundtrip" | "oneway" | "multicity";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export type FlightLeg = {
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
};

export type FlightMetadata = {
  airline?: string;
  from?: string;
  to?: string;
  fromCode?: string;
  toCode?: string;
  duration?: string;
  class?: string;
  stops?: number;
  departTime?: string;
  arriveTime?: string;
  source?: string;
  url?: string;
};

export type FlightSearchParams = {
  trip: TripType;
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
  depart: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
  addHotel?: boolean;
  legs?: FlightLeg[];
};
