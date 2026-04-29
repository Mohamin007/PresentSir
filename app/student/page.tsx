"use client"

import Link from "next/link"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { studentTimetable, notifications } from "@/lib/data"

const currentAttendance = 85
const safeSkips = 3

const todaysClasses = studentTimetable.filter(t => t.day === "Monday")
const pendingNotifications = notifications.filter(n => !n.read)

export default function StudentDashboard() {
  const circumference = 2 * Math.PI * 45
  const progress = (currentAttendance / 100) * circumference

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Alex</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Your Attendance</CardTitle>
            <CardDescription>Current semester performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{currentAttendance}%</span>
                <span className="text-sm text-muted-foreground">Overall</span>
              </div>
            </div>

            <div className="w-full p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Safe to Skip</span>
                <span className="text-2xl font-bold text-green-700">{safeSkips}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">more classes while maintaining 75%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <CardDescription>Monday, March 15</CardDescription>
              </div>
              <Link href="/student/timetable">
                <Button variant="outline" size="sm">View Full Timetable</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysClasses.map((cls) => (
                <div key={cls.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cls.subject}</p>
                    <p className="text-sm text-muted-foreground">{cls.teacher} - {cls.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{cls.time}</p>
                    <Badge variant="outline" className="text-xs">{cls.roomId}</Badge>
                  </div>
                </div>
              ))}
              {todaysClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts from your teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingNotifications.length > 0 ? (
                pendingNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="p-2 rounded-full bg-primary/10">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Ready to check in?</h3>
              <p className="text-muted-foreground">Scan the QR code in your classroom to mark attendance</p>
            </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/student/checkin">
                  <Button size="lg" className="w-full sm:w-auto">Check In Now</Button>
                </Link>
                <Link href="/student/attendance-calculator">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Attendance Calculator</Button>
                </Link>
                <Link href="/student/excuse">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Submit Excuse</Button>
                </Link>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
