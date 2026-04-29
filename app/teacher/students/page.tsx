"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { students } from "@/lib/data"
import { cn } from "@/lib/utils"

function getRiskBadge(level: "low" | "medium" | "high") {
  switch (level) {
    case "low":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Low Risk</Badge>
    case "medium":
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Medium</Badge>
    case "high":
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">High Risk</Badge>
  }
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null)

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const attendanceHistory = [
    { date: "Mar 15", session: "Introduction to Programming", status: "present" },
    { date: "Mar 14", session: "Introduction to Programming", status: "present" },
    { date: "Mar 13", session: "Introduction to Programming", status: "absent" },
    { date: "Mar 12", session: "Introduction to Programming", status: "present" },
    { date: "Mar 11", session: "Introduction to Programming", status: "present" },
    { date: "Mar 10", session: "Introduction to Programming", status: "present" },
    { date: "Mar 8", session: "Introduction to Programming", status: "absent" },
    { date: "Mar 7", session: "Introduction to Programming", status: "present" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground">All students across your rooms</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or room..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedStudent?.id === student.id && "bg-muted/50"
                      )}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback className="text-xs">{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.roomName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                student.attendance >= 80 ? "bg-green-500" : student.attendance >= 70 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${student.attendance}%` }}
                            />
                          </div>
                          <span className="text-sm">{student.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.lastSeen}</TableCell>
                      <TableCell>{getRiskBadge(student.riskLevel)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedStudent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                    <AvatarFallback>{selectedStudent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedStudent.name}</CardTitle>
                    <CardDescription>{selectedStudent.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Attendance</span>
                  <span className="text-lg font-bold">{selectedStudent.attendance}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Room</span>
                  <span className="text-sm font-medium">{selectedStudent.roomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  {getRiskBadge(selectedStudent.riskLevel)}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Attendance History</p>
                  <div className="space-y-2">
                    {attendanceHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{entry.date}</span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            entry.status === "present" 
                              ? "text-green-600 border-green-300 bg-green-50" 
                              : "text-red-600 border-red-300 bg-red-50"
                          )}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Select a student to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
