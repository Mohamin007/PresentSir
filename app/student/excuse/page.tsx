"use client"

import { useEffect, useMemo, useState } from "react"
import { Upload, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"

const reasonCategories = ["Sick", "Family Emergency", "Transport", "Other"]

type SessionOption = {
  id: string
  label: string
}

type ExcuseRow = {
  id: string
  session_id: string
  reason_category: string
  description: string
  status: string
  created_at?: string
}

export default function SubmitExcusePage() {
  const [selectedSession, setSelectedSession] = useState("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [availableSessions, setAvailableSessions] = useState<SessionOption[]>([])
  const [myExcuses, setMyExcuses] = useState<ExcuseRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const loadData = async () => {
    const userProfile = await getUser()
    if (!userProfile) {
      setStatusMessage("Please sign in to submit an excuse.")
      return
    }

    const [{ data: sessionsData }, { data: excusesData }, { data: roomsData }] = await Promise.all([
      supabase.from("sessions").select("id, room_id, created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("excuses").select("id, session_id, reason_category, description, status, created_at").eq("student_id", userProfile.id).order("created_at", { ascending: false }),
      supabase.from("rooms").select("id, name, subject"),
    ])

    const roomMap = new Map((roomsData || []).map((room: any) => [room.id, room]))

    setAvailableSessions((sessionsData || []).map((session: any) => {
      const room = roomMap.get(session.room_id)
      const label = room ? `${room.name} • ${room.subject}` : `Session ${String(session.id).slice(0, 8)}`
      return { id: session.id, label }
    }))

    setMyExcuses(excusesData || [])
  }

  useEffect(() => {
    void loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rejected</Badge>
      default:
        return null
    }
  }

  const selectedSessionLabel = useMemo(
    () => availableSessions.find((item) => item.id === selectedSession)?.label,
    [availableSessions, selectedSession]
  )

  const handleSubmit = async () => {
    if (!selectedSession || !reason || !description) return

    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const userProfile = await getUser()
      if (!userProfile) {
        setStatusMessage("Please sign in to submit an excuse.")
        return
      }

      const { error } = await supabase.from("excuses").insert({
        student_id: userProfile.id,
        session_id: selectedSession,
        reason_category: reason,
        description,
        status: "pending",
      })

      if (error) {
        setStatusMessage("Could not submit your excuse. Please try again.")
        console.error(error)
        return
      }

      setSelectedSession("")
      setReason("")
      setDescription("")
      setStatusMessage("Your excuse was submitted and is now pending review.")
      await loadData()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Excuse</h1>
        <p className="text-muted-foreground">Request excuse for missed classes</p>
      </div>

      {statusMessage ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-foreground">{statusMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Excuse Request</CardTitle>
            <CardDescription>Fill out the form to submit an excuse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a missed session" />
                </SelectTrigger>
                <SelectContent>
                  {availableSessions.length > 0 ? availableSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.label}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-sessions" disabled>
                      No recent sessions found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedSessionLabel ? <p className="text-xs text-muted-foreground">Selected: {selectedSessionLabel}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Reason Category</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide details about your absence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Document (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
                <Input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>

            <Button className="w-full" disabled={!selectedSession || !reason || !description || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Submitting..." : "Submit Excuse Request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>Track your past excuse requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myExcuses.map((excuse) => (
                <div key={excuse.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{excuse.reason_category}</p>
                      {getStatusBadge(excuse.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {excuse.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {excuse.created_at ? new Date(excuse.created_at).toLocaleString() : excuse.session_id}
                    </p>
                  </div>
                </div>
              ))}

              {myExcuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No excuse requests yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
