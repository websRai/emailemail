"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login")
    },
  })

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Welcome, {session?.user?.name}</h1>
      <div className="flex space-x-4">
        <Link href="/generate-email" passHref>
          <Button>Generate Email</Button>
        </Link>
        <Link href="/subscription" passHref>
          <Button variant="outline">Manage Subscription</Button>
        </Link>
      </div>
    </div>
  )
}