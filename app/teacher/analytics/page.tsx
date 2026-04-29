"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { attendanceTrends, heatmapData, atRiskStudents, sentimentTrends, rooms } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const hours = ["9:00", "11:00", "14:00", "16:00"]

function getHeatmapColor(value: number) {
  if (value >= 90) return "bg-green-500"
  if (value >= 80) return "bg-green-400"
  if (value >= 70) return "bg-amber-400"
  if (value >= 60) return "bg-orange-400"
  return "bg-red-400"
}

export default function AnalyticsPage() {
  const buildPrompt = useMemo(() => {
    return () => `You are an attendance analytics assistant for a university teacher.

Summarize the following data in one short paragraph and then give 3 actionable recommendations.
Focus on attendance patterns, at-risk students, and times/rooms that need attention.

Attendance trend data: ${JSON.stringify(attendanceTrends)}
Heatmap data: ${JSON.stringify(heatmapData)}
At-risk students: ${JSON.stringify(atRiskStudents)}
Sentiment trends: ${JSON.stringify(sentimentTrends)}
Rooms: ${JSON.stringify(rooms)}

Keep the tone practical and concise.`
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Insights and attendance patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Weekly attendance rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis domain={[70, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day/Time Heatmap</CardTitle>
            <CardDescription>Attendance by day and time slot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                <div />
                {days.map((day) => (
                  <div key={day} className="text-xs text-center text-muted-foreground font-medium">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-6 gap-2">
                  <div className="text-xs text-muted-foreground font-medium flex items-center">{hour}</div>
                  {days.map((day) => {
                    const dataPoint = heatmapData.find(d => d.day === day && d.hour === hour)
                    const value = dataPoint?.value || 0
                    return (
                      <div 
                        key={`${day}-${hour}`}
                        className={cn("aspect-square rounded-md flex items-center justify-center text-xs font-medium text-white", getHeatmapColor(value))}
                      >
                        {value}%
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Over Time</CardTitle>
            <CardDescription>Student engagement during sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="session" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="focused" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="lost" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-muted-foreground">Focused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-muted-foreground">Neutral</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-muted-foreground">Lost</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AIInsightsPanel
          title="AI Insights"
          description="Automated analysis and recommendations"
          buttonLabel="Generate AI Insights"
          buildPrompt={buildPrompt}
          className="lg:col-span-2"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
          <CardDescription>Students requiring attendance intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Missed Classes</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atRiskStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.attendance}%</TableCell>
                  <TableCell>{student.missedClasses}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={student.trend === "down" ? "destructive" : student.trend === "up" ? "default" : "secondary"}
                      className={student.trend === "up" ? "bg-green-500" : ""}
                    >
                      {student.trend === "down" ? "Declining" : student.trend === "up" ? "Improving" : "Stable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.attendance < 70 ? "destructive" : "secondary"}>
                      {student.attendance < 70 ? "High" : "Medium"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
