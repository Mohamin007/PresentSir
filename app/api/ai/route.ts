import { NextResponse } from "next/server"
import { askGroq } from "@/lib/groq"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : ""

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const response = await askGroq(prompt)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Groq API error:", error)
    return NextResponse.json(
      { error: "AI insights unavailable right now" },
      { status: 500 },
    )
  }
}