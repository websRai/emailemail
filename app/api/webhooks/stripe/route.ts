import { NextResponse } from "next/server"
import Stripe from "stripe"
import { buffer } from "micro"
import prisma from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  const buf = await buffer(req)
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      await prisma.subscription.create({
        data: {
          userId: checkoutSession.client_reference_id!,
          stripeCustomerId: checkoutSession.customer as string,
          stripeSubscriptionId: checkoutSession.subscription as string,
          stripePriceId: process.env.STRIPE_PRICE_ID!,
          stripeCurrentPeriodEnd: new Date(
            (checkoutSession.expires_at ?? Date.now()) * 1000
          ),
        },
      })
      break
    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice
      await prisma.subscription.update({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: {
          stripePriceId: invoice.lines.data[0].price?.id,
          stripeCurrentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
        },
      })
      break
  }

  return NextResponse.json({ received: true })
}