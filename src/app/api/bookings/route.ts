import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { CRYPTO_WALLET_LOOKUP, CRYPTO_PAYMENT_METHODS } from "@/lib/payments";
import { applySalePrice } from "@/lib/pricing";
import { priceForFlight } from "@/lib/flight-display";
import { decodeFlightToken } from "@/lib/flight-token";
import { normalizeFlightPayload, flightRouteLabel } from "@/lib/flight-route";
import type { CabinClass, TripType } from "@/lib/flight-types";
import { fetchLiveHotelPrice } from "@/lib/travala-price";
import { travalaSlugFromOffer } from "@/lib/travala-image";
import { BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT } from "@/lib/flight-hotel-bundle";
import { guestDetailsSchema } from "@/lib/booking-guest";
import { createBookingAccessToken, resolveBookingUserId } from "@/lib/booking-access";

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
    bundleHotelOfferId: z.string().optional(),
    bundleHotelTotal: z.number().positive().optional(),
    bundleHotelCheckIn: z.string().optional(),
    bundleHotelCheckOut: z.string().optional(),
    bundleHotelRooms: z.number().min(1).max(10).optional(),
    bundleFlightToken: z.string().optional(),
    bundleFlightTotal: z.number().positive().optional(),
  })
  .merge(guestDetailsSchema);

export async function POST(request: Request) {
  const user = await getSessionFromRequest(request);

  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);
    const userId = await resolveBookingUserId(user, {
      guestFirstName: data.guestFirstName,
      guestLastName: data.guestLastName,
      contactEmail: data.contactEmail,
    });

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
      const norm = normalizeFlightPayload(liveFlight);
      totalPrice = data.liveFlightTotal ?? liveFlight.salePrice;
      flightSpecialRequests = JSON.stringify({
        type: "live_flight",
        airline: norm.airline,
        route: flightRouteLabel(norm),
        fromCode: norm.fromCode,
        toCode: norm.toCode,
        departAt: norm.departAt,
        arriveAt: norm.arriveAt,
        cabin: liveFlight.cabin,
        trip: liveFlight.trip,
        sourcePrice: liveFlight.sourcePrice,
        salePrice: liveFlight.salePrice,
        token: data.liveFlightToken,
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

    const walletMeta = CRYPTO_WALLET_LOOKUP[data.paymentMethod];
    const wallet = await prisma.cryptoWallet.findFirst({
      where: { currency: walletMeta.currency, network: walletMeta.network, isActive: true },
    });
    if (!wallet) {
      return NextResponse.json(
        { error: `No active ${walletMeta.currency} (${walletMeta.network}) wallet configured. Contact support.` },
        { status: 400 }
      );
    }

    const guestData = {
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
      additionalGuests:
        data.additionalGuests.length > 0 ? JSON.stringify(data.additionalGuests) : null,
    };

    const liveFlightFromHotel = data.bundleFlightToken
      ? decodeFlightToken(data.bundleFlightToken)
      : null;

    const hasBundle =
      liveFlight &&
      data.bundleHotelOfferId &&
      data.bundleHotelTotal &&
      data.bundleHotelCheckIn &&
      data.bundleHotelCheckOut;

    if (hasBundle) {
      const hotelOffer = await prisma.offer.findUnique({ where: { id: data.bundleHotelOfferId } });
      if (!hotelOffer || hotelOffer.type !== "HOTEL") {
        return NextResponse.json({ error: "Hotel offer not found" }, { status: 404 });
      }

      const bundleGroupId = `bundle-${Date.now()}`;
      let hotelTotal = data.bundleHotelTotal!;
      const slug = travalaSlugFromOffer(hotelOffer.metadata);
      if (slug) {
        const live = await fetchLiveHotelPrice({
          slug,
          checkIn: data.bundleHotelCheckIn!,
          checkOut: data.bundleHotelCheckOut!,
          guests: data.guests,
          rooms: data.bundleHotelRooms ?? data.rooms,
        });
        if (live?.available && live.totalPrice > 0) {
          const extra = 1 - BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT / 100;
          hotelTotal = Math.round(live.totalPrice * extra * 100) / 100;
        }
      }
      const flightTotal = data.liveFlightTotal ?? liveFlight!.salePrice;

      const [flightBooking, hotelBooking] = await prisma.$transaction([
        prisma.booking.create({
          data: {
            userId,
            offerId: offer.id,
            walletId: wallet.id,
            checkIn: data.checkIn ? new Date(data.checkIn) : null,
            checkOut: data.checkOut ? new Date(data.checkOut) : null,
            guests: data.guests,
            rooms: data.rooms,
            totalPrice: flightTotal,
            paymentMethod: data.paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING",
            paidAt: null,
            specialRequests: JSON.stringify({
              type: "live_flight_bundle",
              bundleGroupId,
              bundleRole: "flight",
              pairedBookingId: "pending",
              airline: liveFlight!.airline,
              route: `${liveFlight!.from} → ${liveFlight!.to}`,
              fromCode: liveFlight!.fromCode,
              toCode: liveFlight!.toCode,
              departAt: liveFlight!.departAt,
              arriveAt: liveFlight!.arriveAt,
              cabin: liveFlight!.cabin,
              trip: liveFlight!.trip,
              hotelOfferId: hotelOffer.id,
              hotelTitle: hotelOffer.title,
              token: data.liveFlightToken,
            }),
            ...guestData,
          },
          include: { offer: true, wallet: true },
        }),
        prisma.booking.create({
          data: {
            userId,
            offerId: hotelOffer.id,
            walletId: wallet.id,
            checkIn: new Date(data.bundleHotelCheckIn!),
            checkOut: new Date(data.bundleHotelCheckOut!),
            guests: data.guests,
            rooms: data.bundleHotelRooms ?? data.rooms,
            totalPrice: hotelTotal,
            paymentMethod: data.paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING",
            paidAt: null,
            specialRequests: JSON.stringify({
              type: "hotel_bundle",
              bundleGroupId,
              bundleRole: "hotel",
              pairedBookingId: "pending",
              flightRoute: `${liveFlight!.from} → ${liveFlight!.to}`,
            }),
            ...guestData,
          },
          include: { offer: true, wallet: true },
        }),
      ]);

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: flightBooking.id },
          data: {
            specialRequests: JSON.stringify({
              ...JSON.parse(flightBooking.specialRequests || "{}"),
              pairedBookingId: hotelBooking.id,
            }),
          },
        }),
        prisma.booking.update({
          where: { id: hotelBooking.id },
          data: {
            specialRequests: JSON.stringify({
              ...JSON.parse(hotelBooking.specialRequests || "{}"),
              pairedBookingId: flightBooking.id,
            }),
          },
        }),
      ]);

      const accessToken = await createBookingAccessToken([
        flightBooking.id,
        hotelBooking.id,
      ]);

      return NextResponse.json({
        booking: flightBooking,
        bundleBookingId: hotelBooking.id,
        bundleTotal: flightTotal + hotelTotal,
        accessToken,
      });
    }

    const hasHotelFlightBundle =
      offer.type === "HOTEL" &&
      liveFlightFromHotel &&
      data.bundleFlightToken &&
      data.bundleFlightTotal;

    if (hasHotelFlightBundle) {
      const flightOffer = await prisma.offer.findFirst({ where: { type: "FLIGHT" } });
      if (!flightOffer) {
        return NextResponse.json({ error: "Flight checkout unavailable" }, { status: 400 });
      }

      const bundleGroupId = `bundle-${Date.now()}`;
      const extra = 1 - BUNDLE_HOTEL_EXTRA_DISCOUNT_PCT / 100;
      let hotelTotal = totalPrice;
      if (data.roomTotalPrice) {
        hotelTotal = data.roomTotalPrice;
      }
      hotelTotal = Math.round(hotelTotal * extra * 100) / 100;
      const flightTotal = data.bundleFlightTotal!;

      const [hotelBooking, flightBooking] = await prisma.$transaction([
        prisma.booking.create({
          data: {
            userId,
            offerId: offer.id,
            walletId: wallet.id,
            checkIn: data.checkIn ? new Date(data.checkIn) : null,
            checkOut: data.checkOut ? new Date(data.checkOut) : null,
            guests: data.guests,
            rooms: data.rooms,
            totalPrice: hotelTotal,
            paymentMethod: data.paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING",
            paidAt: null,
            roomPackageName: data.roomPackageName || null,
            roomMealType: data.roomMealType || null,
            specialRequests: JSON.stringify({
              type: "hotel_bundle",
              bundleGroupId,
              bundleRole: "hotel",
              pairedBookingId: "pending",
              flightRoute: `${liveFlightFromHotel!.from} → ${liveFlightFromHotel!.to}`,
              flightAirline: liveFlightFromHotel!.airline,
            }),
            ...guestData,
          },
          include: { offer: true, wallet: true },
        }),
        prisma.booking.create({
          data: {
            userId,
            offerId: flightOffer.id,
            walletId: wallet.id,
            checkIn: data.checkIn ? new Date(data.checkIn) : null,
            checkOut: data.checkOut ? new Date(data.checkOut) : null,
            guests: data.guests,
            rooms: data.rooms,
            totalPrice: flightTotal,
            paymentMethod: data.paymentMethod,
            paymentStatus: "PENDING",
            status: "PENDING",
            paidAt: null,
            specialRequests: JSON.stringify({
              type: "live_flight_bundle",
              bundleGroupId,
              bundleRole: "flight",
              pairedBookingId: "pending",
              airline: liveFlightFromHotel!.airline,
              route: `${liveFlightFromHotel!.from} → ${liveFlightFromHotel!.to}`,
              fromCode: liveFlightFromHotel!.fromCode,
              toCode: liveFlightFromHotel!.toCode,
              departAt: liveFlightFromHotel!.departAt,
              arriveAt: liveFlightFromHotel!.arriveAt,
              cabin: liveFlightFromHotel!.cabin,
              trip: liveFlightFromHotel!.trip,
              hotelOfferId: offer.id,
              hotelTitle: offer.title,
              token: data.bundleFlightToken,
            }),
            ...guestData,
          },
          include: { offer: true, wallet: true },
        }),
      ]);

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: hotelBooking.id },
          data: {
            specialRequests: JSON.stringify({
              ...JSON.parse(hotelBooking.specialRequests || "{}"),
              pairedBookingId: flightBooking.id,
            }),
          },
        }),
        prisma.booking.update({
          where: { id: flightBooking.id },
          data: {
            specialRequests: JSON.stringify({
              ...JSON.parse(flightBooking.specialRequests || "{}"),
              pairedBookingId: hotelBooking.id,
            }),
          },
        }),
      ]);

      const accessToken = await createBookingAccessToken([
        hotelBooking.id,
        flightBooking.id,
      ]);

      return NextResponse.json({
        booking: hotelBooking,
        bundleBookingId: flightBooking.id,
        bundleTotal: hotelTotal + flightTotal,
        accessToken,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
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
        specialRequests: flightSpecialRequests,
        roomPackageName: data.roomPackageName || null,
        roomMealType: data.roomMealType || null,
        ...guestData,
      },
      include: { offer: true, wallet: true },
    });

    const accessToken = await createBookingAccessToken([booking.id]);

    return NextResponse.json({ booking, accessToken });
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
