"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Scan, MapPin, Smile, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { liveSessionStudents } from "@/lib/data"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { generateQR } from "@/lib/qr"

const durations = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
  { value: "custom", label: "Custom" },
]

function PresenceDot({ status }: { status: "online" | "away" | "offline" }) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
        status === "online" && "bg-green-500",
        status === "away" && "bg-amber-500",
        status === "offline" && "bg-red-500"
      )}
    />
  )
}

export default function StartSessionPage() {
  const [activeSession, setActiveSession] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [roomsList, setRoomsList] = useState<any[]>([])
  const fallbackRooms = [
    { id: "room-fallback-1", name: "Introduction to Programming", subject: "CS101" },
    { id: "room-fallback-2", name: "Data Structures", subject: "CS201" },
    { id: "room-fallback-3", name: "Web Development", subject: "CS301" },
    { id: "room-fallback-4", name: "Database Systems", subject: "CS202" },
  ]
  const effectiveRooms = roomsList.length > 0 ? roomsList : fallbackRooms
  const [duration, setDuration] = useState("60")
  const [faceVerification, setFaceVerification] = useState(true)
  const [gpsCheck, setGpsCheck] = useState(true)
  const [sentimentPulse, setSentimentPulse] = useState(true)
  const [presenceTracking, setPresenceTracking] = useState(true)
  const [qrImage, setQrImage] = useState("")
  const [sessionActive, setSessionActive] = useState(false)
  const [qrInterval, setQrInterval] = useState<any>(null)
  const [qrRefreshTime, setQrRefreshTime] = useState(20)
  const [presenceByStudent, setPresenceByStudent] = useState<Record<string, "online" | "offline">>({})
  const [sentimentSummary, setSentimentSummary] = useState({ focused: 0, neutral: 0, lost: 0 })

  useEffect(() => {
    return () => {
      if (qrInterval) clearInterval(qrInterval)
    }
  }, [qrInterval])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const teacherId = userData?.user?.id
        if (!teacherId) return

        const { data, error } = await supabase
          .from("rooms")
          .select("id,name,subject")
          .eq("teacher_id", teacherId)

        if (!error && data && mounted) {
          setRoomsList(data)
        } else if (error) {
          console.error('Error fetching rooms:', error)
        }
      } catch (err) {
        console.error(err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!activeSession?.id) return

    let mounted = true

    const loadLiveData = async () => {
      const [{ data: presenceRows }, { data: checkinRows }] = await Promise.all([
        supabase.from("presence_logs").select("student_id,status").eq("session_id", activeSession.id),
        supabase.from("checkins").select("sentiment").eq("session_id", activeSession.id),
      ])

      if (!mounted) return

      const presenceMap: Record<string, "online" | "offline"> = {}
      presenceRows?.forEach((row: any) => {
        presenceMap[row.student_id] = row.status === "online" ? "online" : "offline"
      })

      const sentimentCounts = { focused: 0, neutral: 0, lost: 0 }
      checkinRows?.forEach((row: any) => {
        if (row.sentiment === "focused") sentimentCounts.focused += 1
        if (row.sentiment === "neutral") sentimentCounts.neutral += 1
        if (row.sentiment === "lost") sentimentCounts.lost += 1
      })

      setPresenceByStudent(presenceMap)
      setSentimentSummary(sentimentCounts)
    }

    void loadLiveData()
    const interval = setInterval(loadLiveData, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [activeSession?.id])

  const handleStartSession = async () => {
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 20 * 1000).toISOString()

    const { data: userData } = await supabase.auth.getUser()

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        room_id: selectedRoom,
        teacher_id: userData.user?.id,
        qr_token: sessionToken,
        qr_expires_at: expiresAt,
        is_active: true,
        session_type: "class",
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    if (!session) return

    setActiveSession(session)
    const qrUrl = `${window.location.origin}/checkin?token=${sessionToken}`
    const qrDataUrl = await generateQR(qrUrl)
    setQrImage(qrDataUrl)
    setSessionActive(true)
    setQrRefreshTime(20)

    const interval = setInterval(async () => {
      const newToken = crypto.randomUUID()
      const newExpiry = new Date(Date.now() + 20000).toISOString()
      await supabase.from('sessions').update({
        qr_token: newToken,
        qr_expires_at: newExpiry
      }).eq('id', session.id)
      const newQr = await generateQR(`${window.location.origin}/checkin?token=${newToken}`)
      setQrImage(newQr)
    }, 20000)

    setQrInterval(interval)
  }

  const handleStopSession = async () => {
    if (qrInterval) clearInterval(qrInterval)
    if (activeSession?.id) {
      await supabase.from('sessions').update({ is_active: false }).eq('id', activeSession.id)
    }
    setActiveSession(null)
    setPresenceByStudent({})
    setSentimentSummary({ focused: 0, neutral: 0, lost: 0 })
    setSessionActive(false)
    setQrImage('')
  }

  const selectedRoomData = effectiveRooms.find((r) => r.id === selectedRoom)
  const liveStudents = liveSessionStudents.map((student) => ({
    ...student,
    presenceStatus: presenceByStudent[student.id] ?? student.presenceStatus,
  }))
  const sentimentSummaryText = `${sentimentSummary.focused} Focused, ${sentimentSummary.neutral} Neutral, ${sentimentSummary.lost} Lost`

  if (sessionActive) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-4 border-b bg-background flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleStopSession}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold">{selectedRoomData?.name || "Session"}</h1>
              <p className="text-sm text-muted-foreground">{duration} minutes</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleStopSession}>Stop Session</Button>
        </div>

        <div className="flex-1 grid lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Scan to Check In</h2>
              <p className="text-muted-foreground">QR refreshes every 20 seconds</p>
            </div>
            
            {sessionActive && qrImage && (
              <img src={qrImage} alt="QR Code" className="w-64 h-64 mx-auto" />
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className={cn("h-4 w-4", qrRefreshTime <= 5 && "text-amber-500 animate-spin")} />
              <span className={cn(qrRefreshTime <= 5 && "text-amber-500 font-medium")}>
                Refreshing in {qrRefreshTime}s
              </span>
            </div>
          </div>

          <div className="p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Live Students</h2>
              <Badge variant="outline" className="text-green-600">
                {liveStudents.filter(s => s.presenceStatus === "online").length} / {liveStudents.length} Present
              </Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Sentiment summary: {sentimentSummaryText}</p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {liveStudents.map((student) => (
                <Card key={student.id} className={cn(
                  "transition-colors",
                  student.presenceStatus === "offline" && "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <PresenceDot status={student.presenceStatus} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.checkinTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Start Session</h1>
          <p className="text-muted-foreground">Configure and launch an attendance session</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Choose a room and set the duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-select">Select Room</Label>
              <div>
                <select
                  id="room-select"
                  value={selectedRoom}
                  onChange={(e) => { const v = e.target.value; console.debug('Select room change ->', v); setSelectedRoom(v) }}
                  className="border-input rounded-md px-3 py-2 text-sm w-full bg-transparent"
                >
                  <option value="">Choose a room</option>
                  {effectiveRooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name} ({room.subject})</option>
                  ))}
                </select>
                {selectedRoom ? (
                  <p className="text-xs text-muted-foreground mt-1">Selected: {selectedRoomData?.name || selectedRoom} ({selectedRoom})</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Options</CardTitle>
            <CardDescription>Configure how students check in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Scan className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Label>Face Verification</Label>
                  <p className="text-sm text-muted-foreground">Require face match for check-in</p>
                </div>
              </div>
              <Switch checked={faceVerification} onCheckedChange={setFaceVerification} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <Label>GPS Check</Label>
                  <p className="text-sm text-muted-foreground">Verify student location</p>
                </div>
              </div>
              <Switch checked={gpsCheck} onCheckedChange={setGpsCheck} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Smile className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <Label>Sentiment Pulse</Label>
                  <p className="text-sm text-muted-foreground">Ask students how they feel</p>
                </div>
              </div>
              <Switch checked={sentimentPulse} onCheckedChange={setSentimentPulse} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Eye className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <Label>Active Presence Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track ongoing presence during session</p>
                </div>
              </div>
              <Switch checked={presenceTracking} onCheckedChange={setPresenceTracking} />
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-12 text-lg" 
          disabled={!selectedRoom}
          onClick={handleStartSession}
        >
          Start Session
        </Button>
      </div>
    </div>
  )
}
