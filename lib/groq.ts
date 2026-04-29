import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function askGroq(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  })

  return completion.choices[0]?.message?.content?.trim() || ""
}