import type { CabinClass, TripType } from "./flight-types";

export type LiveFlightSegment = {
  airline: string;
  airlineCode: string;
  flightNumber?: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departAt: string;
  arriveAt: string;
  duration: string;
};

export type FlightLeg = {
  airline: string;
  airlineCode: string;
  flightNumber?: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  departAt: string;
  arriveAt: string;
  duration: string;
  stops: number;
};

export type LiveFlightOffer = {
  id: string;
  airline: string;
  airlineCode: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  departAt: string;
  arriveAt: string;
  duration: string;
  stops: number;
  outbound: FlightLeg;
  returnLeg?: FlightLeg;
  sourcePrice: number;
  salePrice: number;
  currency: string;
  cabin: CabinClass;
  trip: TripType;
  segments: LiveFlightSegment[];
  offerToken: string;
};

export type LiveFlightSearchMeta = {
  source: "market";
  total: number;
  fromCode: string;
  toCode: string;
};
