import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { CRYPTO_CURRENCY_MAP, CRYPTO_PAYMENT_METHODS } from "@/lib/payments";
import { applySalePrice } from "@/lib/pricing";
import { priceForFlight } from "@/lib/flight-display";
import { decodeFlightToken } from "@/lib/flight-token";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { fetchLiveHotelPrice } from "@/lib/travala-price";
import { travalaSlugFromOffer } from "@/lib/travala-image";
import { guestDetailsSchema } from "@/lib/booking-guest";

const bookingSchema = z
  .object({
    offerId: z.string(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.number().min(1).max(20).default(2),
    rooms: z.number().min(1).max(10).default(1),
    paymentMethod: z.enum(CRYPTO_PAYMENT_METHODS).default("CRYPTO_BTC"),
    roomPackageName: z.string().optional(),
    roomMealType: z.string().optional(),
    roomTotalPrice: z.number().positive().optional(),
    cabin: z.enum(["economy", "premium_economy", "business", "first"]).optional(),
    trip: z.enum(["roundtrip", "oneway", "multicity"]).optional(),
    liveFlightToken: z.string().optional(),
    liveFlightTotal: z.number().positive().optional(),
  })
  .merge(guestDetailsSchema);

export async function POST(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in to book" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    if (data.bookingType === "BUSINESS" && !data.companyName?.trim()) {
      return NextResponse.json({ error: "Company name is required for business bookings" }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({ where: { id: data.offerId } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    let nights = 1;
    if (data.checkIn && data.checkOut) {
      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    let totalPrice = offer.price;
    let flightSpecialRequests = data.specialRequests || null;

    const liveFlight = data.liveFlightToken ? decodeFlightToken(data.liveFlightToken) : null;
    if (liveFlight) {
      totalPrice = data.liveFlightTotal ?? liveFlight.salePrice;
      flightSpecialRequests = JSON.stringify({
        type: "live_flight",
        airline: liveFlight.airline,
        route: `${liveFlight.from} → ${liveFlight.to}`,
        fromCode: liveFlight.fromCode,
        toCode: liveFlight.toCode,
        departAt: liveFlight.departAt,
        arriveAt: liveFlight.arriveAt,
        cabin: liveFlight.cabin,
        trip: liveFlight.trip,
        sourcePrice: liveFlight.sourcePrice,
        salePrice: liveFlight.salePrice,
      });
    } else if (offer.type === "HOTEL" && data.roomTotalPrice) {
      totalPrice = data.roomTotalPrice;
    } else if (offer.type === "HOTEL" && data.checkIn && data.checkOut) {
      const slug = travalaSlugFromOffer(offer.metadata);
      if (slug) {
        const live = await fetchLiveHotelPrice({
          slug,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          rooms: data.rooms,
        });
        if (live?.available) {
          totalPrice = live.totalPrice;
        } else {
          totalPrice = offer.price * nights * data.rooms;
        }
      } else {
        totalPrice = offer.price * nights * data.rooms;
      }
    } else if (offer.type === "HOTEL") {
      totalPrice = offer.price * nights * data.rooms;
    } else if (offer.type === "CAR_RENTAL") {
      totalPrice = offer.price * nights;
    } else if (offer.type === "FLIGHT" && !liveFlight) {
      totalPrice = priceForFlight(
        offer.price,
        (data.cabin as CabinClass) || "economy",
        data.guests,
        (data.trip as TripType) || "roundtrip",
      );
    } else if (!liveFlight) {
      totalPrice = offer.price * data.guests;
    }

    if (!liveFlight) {
      totalPrice = applySalePrice(totalPrice, offer.id, offer.stars);
    }

    const currency = CRYPTO_CURRENCY_MAP[data.paymentMethod];
    const wallet = await prisma.cryptoWallet.findFirst({
      where: { currency, isActive: true },
    });
    if (!wallet) {
      return NextResponse.json(
        { error: `No active ${currency} wallet configured. Contact support.` },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        offerId: offer.id,
        walletId: wallet.id,
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        guests: data.guests,
        rooms: data.rooms,
        totalPrice,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        status: "PENDING",
        paidAt: null,
        bookingType: data.bookingType,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        addressCity: data.addressCity,
        addressPostalCode: data.addressPostalCode,
        addressCountry: data.addressCountry,
        companyName: data.companyName || null,
        companyVatId: data.companyVatId || null,
        estimatedArrival: data.estimatedArrival || null,
        specialRequests: flightSpecialRequests,
        roomPackageName: data.roomPackageName || null,
        roomMealType: data.roomMealType || null,
        additionalGuests:
          data.additionalGuests.length > 0
            ? JSON.stringify(data.additionalGuests)
            : null,
      },
      include: { offer: true, wallet: true },
    });

    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { offer: true, wallet: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
