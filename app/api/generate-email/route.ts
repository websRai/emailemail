import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional email writer. Generate a concise and effective email based on the given prompt." },
        { role: "user", content: prompt }
      ],
    })

    const generatedEmail = completion.data.choices[0].message?.content

    // Generate a subject line
    const subjectCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Generate a short, concise subject line for the following email:" },
        { role: "user", content: generatedEmail || "" }
      ],
    })

    const subject = subjectCompletion.data.choices[0].message?.content

    return NextResponse.json({ email: generatedEmail, subject })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}