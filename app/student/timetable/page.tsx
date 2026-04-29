"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { studentTimetable } from "@/lib/data"
import { cn } from "@/lib/utils"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = ["09:00", "11:00", "14:00", "16:00"]

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState<typeof studentTimetable[0] | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const getClassForSlot = (day: string, time: string) => {
    return studentTimetable.find(c => c.day === day && c.time.startsWith(time))
  }

  const saveNote = () => {
    if (selectedClass) {
      setNotes(prev => ({ ...prev, [selectedClass.id]: notes[selectedClass.id] || "" }))
      setSelectedClass(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground">Your weekly class schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="text-sm font-medium text-muted-foreground p-2">Time</div>
                {days.map((day) => (
                  <div key={day} className="text-sm font-medium text-center p-2">
                    {day}
                  </div>
                ))}
              </div>

              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="text-sm text-muted-foreground p-2 flex items-center">
                    {time}
                  </div>
                  {days.map((day) => {
                    const cls = getClassForSlot(day, time)
                    return (
                      <div key={`${day}-${time}`} className="min-h-24">
                        {cls ? (
                          <button
                            onClick={() => setSelectedClass(cls)}
                            className={cn(
                              "w-full h-full p-3 rounded-lg border text-left transition-colors hover:border-primary/50",
                              "bg-primary/5 border-primary/20"
                            )}
                          >
                            <p className="font-medium text-sm truncate">{cls.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">{cls.teacher}</p>
                            <p className="text-xs text-muted-foreground">{cls.room}</p>
                            {notes[cls.id] && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Has notes
                              </Badge>
                            )}
                          </button>
                        ) : (
                          <div className="w-full h-full rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedClass?.subject}</DialogTitle>
            <DialogDescription>
              {selectedClass?.day}, {selectedClass?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Teacher</p>
                <p className="font-medium">{selectedClass?.teacher}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room</p>
                <p className="font-medium">{selectedClass?.room}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Room ID</p>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedClass?.roomId}</code>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Personal Notes</p>
              <Input
                placeholder="Add notes for this class..."
                value={notes[selectedClass?.id || ""] || ""}
                onChange={(e) => setNotes(prev => ({ ...prev, [selectedClass?.id || ""]: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClass(null)}>Cancel</Button>
            <Button onClick={saveNote}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
