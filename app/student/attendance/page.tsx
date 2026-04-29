"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { studentAttendanceBySubject, studentAttendanceCalendar } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AttendancePage() {
  const [minRequired, setMinRequired] = useState(75)

  const totalAttended = studentAttendanceBySubject.reduce((acc, s) => acc + s.attended, 0)
  const totalClasses = studentAttendanceBySubject.reduce((acc, s) => acc + s.total, 0)
  const overallPercentage = Math.round((totalAttended / totalClasses) * 100)

  const classesCanSkip = Math.floor((totalAttended - (minRequired / 100) * totalClasses) / (1 - minRequired / 100))
  const safeSkips = Math.max(0, classesCanSkip)

  const mustAttend = minRequired > overallPercentage ? Math.ceil(((minRequired / 100) * totalClasses - totalAttended) / (1 - minRequired / 100)) : 0

  const projectedFinal = Math.round((totalAttended / (totalClasses + 10)) * 100)

  const calendarWeeks: typeof studentAttendanceCalendar[][] = []
  for (let i = 0; i < studentAttendanceCalendar.length; i += 5) {
    calendarWeeks.push(studentAttendanceCalendar.slice(i, i + 5))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance across all subjects</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Breakdown</CardTitle>
              <CardDescription>Your attendance by subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentAttendanceBySubject.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="text-sm text-muted-foreground">
                      {subject.attended}/{subject.total} classes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          subject.percentage >= 80 ? "bg-green-500" : subject.percentage >= 70 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-medium w-12 text-right",
                      subject.percentage >= 80 ? "text-green-600" : subject.percentage >= 70 ? "text-amber-600" : "text-red-600"
                    )}>
                      {subject.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>Your attendance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-5 gap-2 mb-2">
                  {week.map((day, dayIdx) => (
                    <div 
                      key={dayIdx}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                        day.status === "present" 
                          ? "bg-green-500 text-white" 
                          : "bg-red-500 text-white"
                      )}
                    >
                      {new Date(day.date).getDate()}
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-muted-foreground">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-muted-foreground">Absent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{overallPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">{totalAttended} of {totalClasses} classes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Strategy</CardTitle>
              <CardDescription>Plan your attendance wisely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-required">Minimum Required (%)</Label>
                <Input 
                  id="min-required"
                  type="number"
                  value={minRequired}
                  onChange={(e) => setMinRequired(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-700">Safe to Skip</span>
                  <Badge className="bg-green-500">{safeSkips} classes</Badge>
                </div>

                {mustAttend > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-sm font-medium text-red-700">Must Attend</span>
                    <Badge variant="destructive">{mustAttend} classes</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Projected End-of-Semester</span>
                  <Badge variant="secondary">{projectedFinal}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
