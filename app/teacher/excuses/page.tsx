"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"

type ExcuseRow = {
  id: string
  student_id: string
  session_id: string
  reason_category: string
  description: string
  status: string
  created_at?: string
}

export default function TeacherExcusesPage() {
  const [excuses, setExcuses] = useState<ExcuseRow[]>([])
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})
  const [sessionNames, setSessionNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadExcuses = async () => {
    setLoading(true)
    const teacher = await getUser()
    if (!teacher) {
      setLoading(false)
      return
    }

    const { data: roomsData } = await supabase.from("rooms").select("id, name, subject").eq("teacher_id", teacher.id)
    const roomIds = (roomsData || []).map((room: any) => room.id)

    const { data: sessionsData } = roomIds.length
      ? await supabase.from("sessions").select("id, room_id").in("room_id", roomIds)
      : { data: [] as any[] }

    const sessionIds = (sessionsData || []).map((session: any) => session.id)

    const [{ data: excuseData }, { data: usersData }] = await Promise.all([
      sessionIds.length
        ? supabase.from("excuses").select("id, student_id, session_id, reason_category, description, status, created_at").eq("status", "pending").in("session_id", sessionIds).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("users").select("id, name"),
    ])

    const studentMap: Record<string, string> = {}
    ;(usersData || []).forEach((user: any) => {
      studentMap[user.id] = user.name || user.email || user.id
    })

    const sessionMap: Record<string, string> = {}
    ;(sessionsData || []).forEach((session: any) => {
      const room = (roomsData || []).find((item: any) => item.id === session.room_id)
      sessionMap[session.id] = room ? `${room.name} • ${room.subject}` : session.id
    })

    setStudentNames(studentMap)
    setSessionNames(sessionMap)
    setExcuses(excuseData || [])
    setLoading(false)
  }

  useEffect(() => {
    void loadExcuses()
  }, [])

  const pendingCount = useMemo(() => excuses.length, [excuses])

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("excuses").update({ status }).eq("id", id)
    if (error) {
      console.error(error)
      return
    }

    setExcuses((current) => current.filter((item) => item.id !== id))
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
          <h1 className="text-2xl font-bold text-foreground">Excuses</h1>
          <p className="text-muted-foreground">Review pending excuse requests from your sessions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Excuses</CardTitle>
          <CardDescription>{pendingCount} request{pendingCount === 1 ? "" : "s"} waiting for review</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading excuses...</p>
          ) : excuses.length > 0 ? (
            <div className="space-y-4">
              {excuses.map((excuse) => (
                <div key={excuse.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{studentNames[excuse.student_id] || `Student ${excuse.student_id.slice(0, 8)}`}</p>
                          <Badge variant="outline">{excuse.reason_category}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{excuse.description}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{sessionNames[excuse.session_id] || excuse.session_id}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatus(excuse.id, "approved")}> 
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateStatus(excuse.id, "rejected")}> 
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Check className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <p>No pending excuses right now</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}