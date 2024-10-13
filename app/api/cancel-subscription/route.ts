import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import Stripe from "stripe"
import prisma from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user || !user.subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId!)

    await prisma.subscription.delete({
      where: { userId: user.id },
    })

    return NextResponse.json({ message: "Subscription cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}