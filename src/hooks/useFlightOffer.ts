"use client";

import { useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { decodeFlightToken, type FlightTokenPayload } from "@/lib/flight-token";
import { normalizeFlightPayload } from "@/lib/flight-route";

export function useFlightOffer(searchParams: ReadonlyURLSearchParams) {
  const tokenParam = searchParams.get("token") || "";
  const id = searchParams.get("id") || "";
  const [flight, setFlight] = useState<FlightTokenPayload | null>(null);
  const [token, setToken] = useState(tokenParam);
  const [loading, setLoading] = useState(Boolean(id || tokenParam));
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError("");
      const qs = searchParams.toString();
      fetch(`/api/flights/offer?${qs}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.offer && data.token) {
            setFlight(normalizeFlightPayload(data.offer));
            setToken(data.token);
          } else {
            setFlight(null);
            setError(data.error || "Offer not found");
          }
        })
        .catch(() => {
          setFlight(null);
          setError("Could not load flight offer");
        })
        .finally(() => setLoading(false));
      return;
    }

    if (tokenParam) {
      const decoded = decodeFlightToken(tokenParam);
      setFlight(decoded ? normalizeFlightPayload(decoded) : null);
      setToken(tokenParam);
      setLoading(false);
      return;
    }

    setFlight(null);
    setLoading(false);
  }, [id, tokenParam, searchParams.toString()]);

  return { flight, token, loading, error };
}
