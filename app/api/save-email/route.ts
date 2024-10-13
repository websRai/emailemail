import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, content } = await req.json()

    const email = await prisma.email.create({
      data: {
        subject,
        content,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ email })
  } catch (error) {
    console.error("Error saving email:", error)
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
  }
}