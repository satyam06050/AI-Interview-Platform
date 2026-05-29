// src/app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Fetch order details from Razorpay to get credits
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const credits = parseInt(order.notes?.credits ?? 0);

    // Add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: credits } },
    });

    // Record payment
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        planId: order.notes?.planId ?? "unknown",
        amount: order.amount / 100,
        credits,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "success",
      },
    });

    // Update session
    session.user.credits = updatedUser.credits;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        credits: updatedUser.credits,
      },
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
