"use client"

import Link from "next/link"
import { Users, Clock, AlertTriangle, Plus, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { rooms, sessions, atRiskStudents, liveSessionStudents } from "@/lib/data"
import { cn } from "@/lib/utils"

const activeSession = sessions.find(s => s.isActive)

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

export default function TeacherDashboard() {
  const todaysSessions = sessions.slice(0, 3)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Mitchell</p>
        </div>
        <Link href="/teacher/sessions/start">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Rooms</p>
                <p className="text-3xl font-bold text-foreground mt-1">{rooms.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <DoorOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Sessions</p>
                <p className="text-3xl font-bold text-foreground mt-1">{todaysSessions.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground mt-1">125</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At-Risk Students</p>
                <p className="text-3xl font-bold text-foreground mt-1">{atRiskStudents.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeSession ? (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  Live Session
                </CardTitle>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <CardDescription>{activeSession.roomName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{activeSession.room}</p>
                  <p className="text-sm text-muted-foreground">{activeSession.time} - {activeSession.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{activeSession.studentsPresent}</p>
                  <p className="text-sm text-muted-foreground">of {activeSession.totalStudents} present</p>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {liveSessionStudents.map((student) => (
                  <div key={student.id} className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="text-xs">{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <PresenceDot status={student.presenceStatus} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Link href="/teacher/sessions/review" className="flex-1">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
                <Button variant="destructive" className="flex-1">End Session</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Session</CardTitle>
              <CardDescription>Start a session to begin tracking attendance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No session is currently running</p>
              <Link href="/teacher/sessions/start">
                <Button>Start a Session</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>At-Risk Students</CardTitle>
            <CardDescription>Students with attendance below 75%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.missedClasses} classes missed</p>
                  </div>
                  <Badge variant={student.attendance < 70 ? "destructive" : "secondary"}>
                    {student.attendance}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Rooms</CardTitle>
              <CardDescription>Quick access to your rooms</CardDescription>
            </div>
            <Link href="/teacher/rooms">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.slice(0, 3).map((room) => (
              <div key={room.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{room.name}</h3>
                  <Badge variant="outline">{room.subject}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{room.studentCount} students</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{room.roomId}</code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
