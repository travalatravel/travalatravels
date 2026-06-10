import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LIVE_FLIGHT_TITLE = "Live Flight Booking";

export async function GET() {
  let offer = await prisma.offer.findFirst({
    where: { type: "FLIGHT", title: LIVE_FLIGHT_TITLE },
  });

  if (!offer) {
    offer = await prisma.offer.create({
      data: {
        type: "FLIGHT",
        title: LIVE_FLIGHT_TITLE,
        description: "Live flight booking via market rates",
        location: "Worldwide",
        city: "Global",
        country: "Global",
        price: 0,
        image: "https://static.travala.com/resources/images-pc/rebranding/flight-banner.jpg",
        metadata: JSON.stringify({ source: "live-flight-system" }),
      },
    });
  }

  return NextResponse.json({ offerId: offer.id });
}
