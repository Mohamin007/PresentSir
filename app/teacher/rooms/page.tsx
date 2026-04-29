"use client"

import { useState } from "react"
import { Plus, Copy, Check, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { rooms } from "@/lib/data"

export default function RoomsPage() {
  const [open, setOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyRoomId = (roomId: string, id: string) => {
    navigator.clipboard.writeText(roomId)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Rooms</h1>
          <p className="text-muted-foreground">Manage your class rooms</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Create a room for your class. Students will join using the Room ID.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input id="room-name" placeholder="e.g. Introduction to Programming" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-subject">Subject Code</Label>
                <Input id="room-subject" placeholder="e.g. CS101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-desc">Description</Label>
                <Textarea id="room-desc" placeholder="Brief description of the course..." rows={3} />
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    A unique Room ID will be generated for students to join.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">ROOM-XXXX</code>
                    <span className="text-xs text-muted-foreground">(Generated on save)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Create Room</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DoorOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{room.name}</CardTitle>
                  <CardDescription>{room.subject}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{room.studentCount}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{room.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Room ID</span>
                <button
                  onClick={() => copyRoomId(room.roomId, room.id)}
                  className="flex items-center gap-1.5 text-sm font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                >
                  {room.roomId}
                  {copiedId === room.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
