import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin";

const schema = z.object({
  paymentStatus: z.enum(["PENDING", "AWAITING_CONFIRMATION", "PAID", "FAILED", "REFUNDED"]),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(request, async () => {
    const { id } = await params;
    try {
      const body = await request.json();
      const data = schema.parse(body);

      const updateData: {
        paymentStatus: string;
        status?: string;
        paidAt?: Date | null;
      } = { paymentStatus: data.paymentStatus };

      if (data.status) updateData.status = data.status;
      if (data.paymentStatus === "PAID") {
        updateData.paidAt = new Date();
        updateData.status = "CONFIRMED";
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { name: true, email: true } },
          offer: true,
          wallet: true,
        },
      });

      return NextResponse.json({ booking });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  });
}
