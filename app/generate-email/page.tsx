"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function GenerateEmail() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login")
    },
  })

  const [prompt, setPrompt] = useState("")
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [subject, setSubject] = useState("")
  const { toast } = useToast()

  const generateEmail = async () => {
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate email")
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
      setSubject(data.subject)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      })
    }
  }

  const saveEmail = async () => {
    try {
      const response = await fetch("/api/save-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, content: generatedEmail }),
      })

      if (!response.ok) {
        throw new Error("Failed to save email")
      }

      toast({
        title: "Success",
        description: "Email saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Generate Email</h1>
      <div className="mb-4">
        <Textarea
          placeholder="Enter your email prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32"
        />
      </div>
      <Button onClick={generateEmail} className="mb-4">Generate Email</Button>
      {generatedEmail && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mb-2"
          />
          <Textarea
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="w-full h-64"
          />
          <Button onClick={saveEmail} className="mt-2">Save Email</Button>
        </div>
      )}
    </div>
  )
}