"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function Subscription() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login")
    },
  })

  const [subscription, setSubscription] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription")
      if (!response.ok) {
        throw new Error("Failed to fetch subscription")
      }
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }
      toast({
        title: "Success",
        description: "Subscription cancelled successfully.",
      })
      fetchSubscription()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Subscription Management</h1>
      {subscription ? (
        <div>
          <p>You are currently subscribed.</p>
          <p>Next billing date: {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}</p>
          <Button onClick={handleUnsubscribe} className="mt-4">Cancel Subscription</Button>
        </div>
      ) : (
        <div>
          <p>You are not currently subscribed.</p>
          <Button onClick={handleSubscribe} className="mt-4">Subscribe Now</Button>
        </div>
      )}
    </div>
  )
}