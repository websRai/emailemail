"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Login to AI Email SaaS</h1>
      <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
        Sign in with Google
      </Button>
    </div>
  )
}