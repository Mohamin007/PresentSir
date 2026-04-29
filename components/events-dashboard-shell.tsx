"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { LayoutDashboard, CalendarDays, Users, QrCode, FileText, Settings, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { NotificationsPopover } from "@/components/notifications-popover"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

type OrganizerSection = "dashboard" | "events" | "registrations" | "checkin" | "reports" | "settings"
type AttendeeSection = "discover" | "registrations" | "settings"

interface EventItem { id: string; name: string; description?: string; date: string; time: string; location: string; capacity: number; registrationCount: number; status: "Upcoming" | "Ongoing" | "Completed"; code: string }
interface Registrant { id: string; eventId: string; name: string; email: string; time: string; status: "Confirmed" | "Pending" | "Cancelled"; }

function generateQrSvgDataUrl(seed: string) {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  const size = 260
  const cells = 21
  const cell = Math.floor(size / cells)
  let svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` + "<rect width='100%' height='100%' fill='#fff'/>"
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      s = (s * 1664525 + 1013904223) >>> 0
      const bit = (s >>> 16) & 1
      if (bit) {
        const rx = x * cell
        const ry = y * cell
        svg += `<rect x='${rx}' y='${ry}' width='${cell}' height='${cell}' fill='#0f172a'/>`
      }
    }
  }
  svg += `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function EventsDashboardShell({ userRole }: { userRole: string }) {
  const isOrganizer = userRole === "organizer"

  const [organizerSection, setOrganizerSection] = useState<OrganizerSection>("dashboard")
  const [attendeeSection, setAttendeeSection] = useState<AttendeeSection>("discover")

  const [events, setEvents] = useState<EventItem[]>([
    { id: "ev1", name: "Tech Summit 2026", date: "2026-06-10", time: "09:30", location: "Convention Hall A", capacity: 200, registrationCount: 34, status: "Upcoming", code: "TS-2026" },
    { id: "ev2", name: "Design Meetup", date: "2026-05-15", time: "17:00", location: "Room B", capacity: 80, registrationCount: 12, status: "Upcoming", code: "DM-0526" },
  ])

  const [registrants, setRegistrants] = useState<Registrant[]>([
    { id: "r1", eventId: "ev1", name: "Asha Verma", email: "asha@example.com", time: "2026-04-20T10:05:00", status: "Confirmed" },
    { id: "r2", eventId: "ev1", name: "Raj Kapoor", email: "raj@example.com", time: "2026-04-21T12:12:00", status: "Confirmed" },
  ])

  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({ name: "", description: "", date: "", time: "", location: "", capacity: 100, paid: false })

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [qrEventId, setQrEventId] = useState<string | null>(null)
  const [checkedIn, setCheckedIn] = useState<Record<string, number>>({})
  const [liveFeed, setLiveFeed] = useState<{ id: string; text: string; time: string }[]>([])

  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<EventItem | null>(null)
  const [myRegistrations, setMyRegistrations] = useState<Registrant[]>([])

  const buildEventSummaryPrompt = () => {
    return `You are an AI event analyst for a conferences dashboard.

Summarize the event attendance data below in a short paragraph and then give 3 suggestions for future events.
Focus on turnout, engagement, no-shows, and registration patterns.

Events: ${JSON.stringify(events)}
Registrants: ${JSON.stringify(registrants)}
Check-ins: ${JSON.stringify(checkedIn)}
Live feed: ${JSON.stringify(liveFeed)}

Keep the response concise and practical.`
  }

  useEffect(() => {
    // initialize checkedIn counters
    const map: Record<string, number> = {}
    for (const e of events) map[e.id] = 0
    setCheckedIn(map)
  }, [])

  const createEvent = () => {
    if (!eventForm.name || !eventForm.date) return
    const id = crypto.randomUUID()
    const newEvent: EventItem = { id, name: eventForm.name, description: eventForm.description, date: eventForm.date, time: eventForm.time, location: eventForm.location, capacity: eventForm.capacity, registrationCount: 0, status: "Upcoming", code: eventForm.name.split(" ").map(s => s[0]).join("").toUpperCase() + "-" + id.slice(0,4) }
    setEvents((c) => [newEvent, ...c])
    setEventForm({ name: "", description: "", date: "", time: "", location: "", capacity: 100, paid: false })
    setEventDialogOpen(false)
    setOrganizerSection("events")
  }

  const openEventQr = (eventId: string) => {
    const src = generateQrSvgDataUrl(eventId)
    setQrSrc(src)
    setQrEventId(eventId)
    setQrDialogOpen(true)
  }

  const simulateCheckin = (eventId: string) => {
    setCheckedIn((c) => ({ ...c, [eventId]: (c[eventId] || 0) + 1 }))
    const who = `Guest ${Math.floor(Math.random() * 900) + 100}`
    setLiveFeed((f) => [{ id: crypto.randomUUID(), text: `${who} checked in`, time: new Date().toLocaleTimeString() }, ...f].slice(0, 20))
  }

  const exportRegistrationsCsv = (eventId: string) => {
    const rows = registrants.filter(r => r.eventId === eventId)
    const csv = ["Name,Email,Registration Time,Status", ...rows.map(r => `${r.name},${r.email},${r.time},${r.status}`)].join("\n")
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const registerForEvent = (event: EventItem, name: string, email: string) => {
    const reg: Registrant = { id: crypto.randomUUID(), eventId: event.id, name, email, time: new Date().toISOString(), status: "Confirmed" }
    setRegistrants((r) => [reg, ...r])
    setMyRegistrations((m) => [reg, ...m])
    setEvents((es) => es.map(ev => ev.id === event.id ? { ...ev, registrationCount: ev.registrationCount + 1 } : ev))
    setSelectedEventForRegistration(null)
  }

  const OrganizerNav = (
    <nav className="space-y-2 p-3">
      <button onClick={() => setOrganizerSection("dashboard")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Dashboard</button>
      <button onClick={() => setOrganizerSection("events")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "events" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>My Events</button>
      <button onClick={() => setOrganizerSection("registrations")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "registrations" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Registrations</button>
      <button onClick={() => setOrganizerSection("checkin")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "checkin" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Check-in</button>
      <button onClick={() => setOrganizerSection("reports")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "reports" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Reports</button>
      <button onClick={() => setOrganizerSection("settings")} className={cn("w-full text-left rounded px-3 py-2", organizerSection === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Settings</button>
    </nav>
  )

  const AttendeeNav = (
    <nav className="space-y-2 p-3">
      <button onClick={() => setAttendeeSection("discover")} className={cn("w-full text-left rounded px-3 py-2", attendeeSection === "discover" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Discover Events</button>
      <button onClick={() => setAttendeeSection("registrations")} className={cn("w-full text-left rounded px-3 py-2", attendeeSection === "registrations" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>My Registrations</button>
      <button onClick={() => setAttendeeSection("settings")} className={cn("w-full text-left rounded px-3 py-2", attendeeSection === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Settings</button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="border-b border-sidebar-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary"><CalendarDays className="h-5 w-5 text-sidebar-primary-foreground" /></div>
              <div>
                <p className="text-lg font-semibold">PresentSir</p>
                <div className="mt-1 inline-flex rounded-full bg-fuchsia-500/10 px-2.5 py-1 text-xs font-medium text-fuchsia-200">Events</div>
              </div>
            </div>
          </div>
          <div className="flex-1 px-3 py-4">{isOrganizer ? OrganizerNav : AttendeeNav}</div>
          <div className="border-t border-sidebar-border p-4"><Card className="p-2"><CardContent className="text-sm">Upcoming public events: {events.length}</CardContent></Card></div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div><p className="text-sm text-muted-foreground">Events Dashboard</p><h1 className="text-xl font-semibold text-foreground">{isOrganizer ? organizerSection : attendeeSection}</h1></div>
              <div className="flex items-center gap-2"><Badge variant="secondary">Events</Badge><Badge variant="outline">{isOrganizer ? "Organizer" : "Attendee"}</Badge><NotificationsPopover role="events" /></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {isOrganizer ? (
              <>
                {organizerSection === "dashboard" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card><CardHeader><CardTitle>Total Events</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{events.length}</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>Total Registrations</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{registrants.length}</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>Check-ins Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{Object.values(checkedIn).reduce((s, v) => s + v, 0)}</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{events.filter(e => e.status === "Upcoming").length}</div></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent><ul className="space-y-2">{liveFeed.map(f => <li key={f.id} className="flex items-center justify-between"><div>{f.text}</div><div className="text-xs text-muted-foreground">{f.time}</div></li>)}</ul></CardContent></Card>
                  </>
                )}

                {organizerSection === "events" && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">My Events</h2><Button onClick={() => setEventDialogOpen(true)}>Create Event</Button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{events.map(ev => <Card key={ev.id}><CardContent><div className="flex items-start justify-between"><div><h3 className="font-semibold">{ev.name}</h3><div className="text-sm text-muted-foreground">{ev.date} • {ev.time} • {ev.location}</div><div className="text-sm text-muted-foreground">{ev.registrationCount}/{ev.capacity} registered</div></div><div className="flex flex-col gap-2"><Badge>{ev.status}</Badge><Button size="sm" onClick={() => openEventQr(ev.id)}>QR</Button></div></div></CardContent></Card>)}</div>
                  </div>
                )}

                {organizerSection === "registrations" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Registrations</h2>
                    <Table><TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{registrants.map(r => <TableRow key={r.id}><TableCell>{events.find(e => e.id === r.eventId)?.name}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell><TableCell>{new Date(r.time).toLocaleString()}</TableCell><TableCell>{r.status}</TableCell></TableRow>)}</TableBody></Table>
                    <div className="mt-4"><h3 className="font-medium">Export</h3>{events.map(ev => <div key={ev.id} className="flex items-center gap-2 mt-2"><div className="flex-1 text-sm">{ev.name}</div><Button size="sm" onClick={() => exportRegistrationsCsv(ev.id)}><Download className="h-4 w-4" /> Export CSV</Button></div>)}</div>
                  </div>
                )}

                {organizerSection === "checkin" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Check-in</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {events.map(ev => (
                        <Card key={ev.id}><CardContent className="flex items-center justify-between"><div><div className="font-semibold">{ev.name}</div><div className="text-sm text-muted-foreground">{ev.date} • {ev.time}</div></div><div className="flex flex-col items-end gap-2"><div className="text-sm">{(checkedIn[ev.id]||0)} / {ev.registrationCount}</div><div className="flex gap-2"><Button size="sm" onClick={() => openEventQr(ev.id)}>Show QR</Button><Button size="sm" onClick={() => simulateCheckin(ev.id)}>Simulate</Button></div></div></CardContent></Card>
                      ))}
                    </div>
                    <div className="mt-6"><h3 className="text-sm font-medium">Live Feed</h3><ul className="space-y-2 mt-2">{liveFeed.map(f => <li key={f.id} className="flex items-center justify-between"><div>{f.text}</div><div className="text-xs text-muted-foreground">{f.time}</div></li>)}</ul></div>
                  </div>
                )}

                {organizerSection === "reports" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Reports</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{events.map(ev => <Card key={ev.id}><CardHeader><CardTitle>{ev.name}</CardTitle></CardHeader><CardContent><div className="text-sm">Registered: {ev.registrationCount} • Checked in: {checkedIn[ev.id]||0} • No-show: {Math.max(0, ev.registrationCount - (checkedIn[ev.id]||0))}</div></CardContent></Card>)}</div>
                    <div className="mt-6">
                      <AIInsightsPanel
                        title="AI Event Summary"
                        description="Analyze turnout, engagement, and future event suggestions"
                        buttonLabel="Generate Event Summary"
                        buildPrompt={buildEventSummaryPrompt}
                      />
                    </div>
                  </div>
                )}

                {organizerSection === "settings" && (<Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent>Event settings placeholder</CardContent></Card>)}
              </>
            ) : (
              <>
                {attendeeSection === "discover" && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Discover Events</h2><div className="flex gap-2"><Input placeholder="Search events..." /></div></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{events.map(ev => <Card key={ev.id}><CardContent><div className="flex items-start justify-between"><div><h3 className="font-semibold">{ev.name}</h3><div className="text-sm text-muted-foreground">{ev.date} • {ev.time} • {ev.location}</div><div className="text-sm text-muted-foreground">Organizer: You</div></div><div className="flex flex-col gap-2"><div className="text-sm">{ev.capacity - ev.registrationCount} spots</div><Button size="sm" onClick={() => setSelectedEventForRegistration(ev)}>Register</Button></div></div></CardContent></Card>)}</div>
                    {selectedEventForRegistration && (<div className="fixed inset-0 flex items-center justify-center"><div className="bg-background p-6 rounded shadow-lg w-full max-w-md"><h3 className="font-semibold">Register for {selectedEventForRegistration.name}</h3><div className="space-y-2 mt-3"><Input placeholder="Your name" id="reg-name" /><Input placeholder="Your email" id="reg-email" /></div><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setSelectedEventForRegistration(null)}>Cancel</Button><Button onClick={() => { const name = (document.getElementById('reg-name') as HTMLInputElement).value || 'Guest'; const email = (document.getElementById('reg-email') as HTMLInputElement).value || 'guest@example.com'; registerForEvent(selectedEventForRegistration, name, email) }}>Confirm</Button></div></div></div>)}
                  </div>
                )}

                {attendeeSection === "registrations" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">My Registrations</h2>
                    <div className="space-y-3">{myRegistrations.map(r => { const ev = events.find(e => e.id === r.eventId)!; return (<Card key={r.id}><CardContent className="flex items-center justify-between"><div><div className="font-semibold">{ev.name}</div><div className="text-sm text-muted-foreground">{ev.date} • {ev.location}</div></div><div><div className="text-sm">{r.status}</div><div className="mt-2"><img src={generateQrSvgDataUrl(r.id)} alt="QR" className="w-24 h-24 bg-white p-1" /></div></div></CardContent></Card>) })}</div>
                  </div>
                )}

                {attendeeSection === "settings" && (<Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent>Profile settings placeholder</CardContent></Card>)}
              </>
            )}
          </main>
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}><DialogContent><DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Event Name</Label><Input value={eventForm.name} onChange={(e) => setEventForm(s => ({ ...s, name: e.target.value }))} /></div><div><Label>Date</Label><Input type="date" value={eventForm.date} onChange={(e) => setEventForm(s => ({ ...s, date: e.target.value }))} /></div><div><Label>Time</Label><Input type="time" value={eventForm.time} onChange={(e) => setEventForm(s => ({ ...s, time: e.target.value }))} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button><Button onClick={createEvent}>Create</Button></div></div></DialogContent></Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}><DialogContent><DialogHeader><DialogTitle>Event QR</DialogTitle></DialogHeader><div className="flex flex-col items-center gap-4">{qrSrc ? <img src={qrSrc} alt="QR" className="w-52 h-52 bg-white p-2" /> : <div className="h-52 w-52 bg-muted/30" />}<div className="text-sm text-muted-foreground">{events.find(e => e.id === qrEventId)?.name}</div><div className="flex gap-2"><Button onClick={() => { if (qrEventId) simulateCheckin(qrEventId) }}>Simulate Check-in</Button></div></div></DialogContent></Dialog>

    </div>
  )
}

export default EventsDashboardShell
