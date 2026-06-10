import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { travalaSlugFromOffer } from "@/lib/travala-image";
import {
  fetchHotelDetails,
  generateFallbackRooms,
  localOfferDetails,
} from "@/lib/travala-details";
import { nightsBetween } from "@/lib/travala-api";
import { defaultStayDates } from "@/lib/travala-price";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get("offerId");
  if (!offerId) {
    return NextResponse.json({ error: "offerId required" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  let checkIn = searchParams.get("checkIn") || "";
  let checkOut = searchParams.get("checkOut") || "";
  const guests = Math.min(Math.max(parseInt(searchParams.get("guests") || "2", 10), 1), 20);
  const rooms = Math.min(Math.max(parseInt(searchParams.get("rooms") || "1", 10), 1), 4);

  if (!checkIn || !checkOut) {
    const defaults = defaultStayDates();
    checkIn = defaults.checkIn;
    checkOut = defaults.checkOut;
  }

  const slug = travalaSlugFromOffer(offer.metadata);

  if (offer.type === "HOTEL" && slug) {
    try {
      const details = await fetchHotelDetails({
        slug,
        checkIn,
        checkOut,
        guests,
        rooms,
      });
      if (details) {
        if (!details.description.trim()) {
          details.description = offer.description;
        }
        if (details.rooms.length === 0) {
          const nights = nightsBetween(checkIn, checkOut);
          details.rooms = generateFallbackRooms(offer.price, nights, rooms);
        }
        return NextResponse.json(
          { details },
          { headers: { "Cache-Control": "public, max-age=600" } }
        );
      }
    } catch {
      /* fallback below */
    }
  }

  const details = localOfferDetails({
    type: offer.type,
    description: offer.description,
    location: offer.location,
    metadata: offer.metadata,
  });

  if (offer.type === "HOTEL") {
    const nights = nightsBetween(checkIn, checkOut);
    details.rooms = generateFallbackRooms(offer.price, nights, rooms);
  }

  return NextResponse.json({ details });
}
