"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AIInsightsPanelProps {
  title: string
  description: string
  buttonLabel: string
  buildPrompt: () => string
  className?: string
  compact?: boolean
}

export function AIInsightsPanel({
  title,
  description,
  buttonLabel,
  buildPrompt,
  className,
  compact = false,
}: AIInsightsPanelProps) {
  const [insight, setInsight] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(false)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      })

      if (!response.ok) {
        throw new Error("AI request failed")
      }

      const data = await response.json()
      if (typeof data.response !== "string" || !data.response.trim()) {
        throw new Error("Empty AI response")
      }

      setInsight(data.response.trim())
    } catch (requestError) {
      setError(true)
      setInsight("")
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <div className={cn("rounded-2xl border border-primary/20 bg-primary/5", compact && "border-0 bg-transparent", className)}>
      <div className={cn("p-4", !compact && "p-0")}> 
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {buttonLabel}
          </Button>
          {error ? <span className="text-sm text-muted-foreground">AI insights unavailable right now</span> : null}
        </div>

        {insight ? (
          <div className="mt-4 rounded-xl border bg-background p-4 text-sm leading-6 text-foreground shadow-sm">
            {insight}
          </div>
        ) : null}
      </div>
    </div>
  )

  if (compact) {
    return content
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}