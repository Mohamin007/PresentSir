"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"
import { LayoutDashboard, UsersRound, Video, Users, FileText, Settings, Plus, CalendarDays, Clock3, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { NotificationsPopover } from "@/components/notifications-popover"

type ManagerSection = "dashboard" | "teams" | "meetings" | "employees" | "reports" | "settings"
type EmployeeSection = "dashboard" | "attendance" | "meetings" | "settings"

interface Team { id: string; name: string; members: number; punctuality: number }
interface Meeting { id: string; name: string; datetime: string; location: string; teamId?: string; attendees: string[] }
interface Employee { id: string; name: string; email: string; teamId?: string; todayStatus?: "Present" | "Absent" | "Late"; punctuality: number; lastSeen: string }

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 100)
  return (
    <div className="flex items-end gap-2 h-28">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full h-20 bg-muted/50 flex items-end rounded overflow-hidden">
            <div className={cn("w-full transition-all", v >= 90 ? "bg-emerald-500" : v >= 80 ? "bg-amber-500" : "bg-red-500")} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">W{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

function generateQrSvgDataUrl(seed: string) {
  let s = 0
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  const size = 200
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

export function CompanyDashboardShell({ userRole }: { userRole: string }) {
  const isManager = userRole === "manager"
  const [managerSection, setManagerSection] = useState<ManagerSection>("dashboard")
  const [employeeSection, setEmployeeSection] = useState<EmployeeSection>("dashboard")

  const [teams, setTeams] = useState<Team[]>([])
  const fallbackTeams: Team[] = [
    { id: "team-alpha", name: "Team Alpha", members: 0, punctuality: 90 },
    { id: "team-bravo", name: "Team Bravo", members: 0, punctuality: 90 },
    { id: "team-charlie", name: "Team Charlie", members: 0, punctuality: 90 },
  ]
  const teamOptions = teams.length > 0 ? teams : fallbackTeams

  const [meetings, setMeetings] = useState<Meeting[]>([])

  const [employees, setEmployees] = useState<Employee[]>([])

  const [activity, setActivity] = useState<{ id: string; text: string; time: string }[]>([])

  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [teamForm, setTeamForm] = useState({ name: "", description: "" })

  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [meetingForm, setMeetingForm] = useState({ name: "", datetime: "", location: "", teamId: "" })

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [qrMeetingName, setQrMeetingName] = useState<string | null>(null)

  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", teamId: "" })
  const [fileError, setFileError] = useState<string | null>(null)

  // Check-in camera state for employee flow
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [currentMeetingForCheckin, setCurrentMeetingForCheckin] = useState<Meeting | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()) }
  }, [])

  const openQrForMeeting = (meeting: Meeting) => {
    const src = generateQrSvgDataUrl(meeting.id)
    setQrSrc(src)
    setQrMeetingName(meeting.name)
    setQrDialogOpen(true)
  }

  const handleCreateTeam = () => {
    if (!teamForm.name) return
    setTeams((c) => [{ id: crypto.randomUUID(), name: teamForm.name, members: 0, punctuality: 90 }, ...c])
    setActivity((a) => [{ id: crypto.randomUUID(), text: `${teamForm.name} team created`, time: "Just now" }, ...a])
    setTeamForm({ name: "", description: "" })
    setTeamDialogOpen(false)
    setManagerSection("teams")
  }

  const handleScheduleMeeting = () => {
    if (!meetingForm.name || !meetingForm.datetime) return
    const newMeeting: Meeting = { id: crypto.randomUUID(), name: meetingForm.name, datetime: meetingForm.datetime, location: meetingForm.location || "Office", teamId: meetingForm.teamId || undefined, attendees: [] }
    setMeetings((m) => [newMeeting, ...m])
    setActivity((a) => [{ id: crypto.randomUUID(), text: `${meetingForm.name} scheduled`, time: "Just now" }, ...a])
    setMeetingForm({ name: "", datetime: "", location: "", teamId: "" })
    setMeetingDialogOpen(false)
    setManagerSection("meetings")
  }

  const handleAddEmployee = () => {
    if (!employeeForm.name || !employeeForm.email) return
    setEmployees((e) => [{ id: crypto.randomUUID(), name: employeeForm.name, email: employeeForm.email, teamId: employeeForm.teamId || undefined, todayStatus: "Absent", punctuality: 90, lastSeen: "Never" }, ...e])
    setEmployeeForm({ name: "", email: "", teamId: "" })
    setEmployeeDialogOpen(false)
    setManagerSection("employees")
  }

  const handleImportEmployees = async (file: File | null) => {
    if (!file) return
    setFileError(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array")
      const imported = parsed.map((it: any) => ({ id: crypto.randomUUID(), name: it.name || "Unnamed", email: it.email || "no@company", teamId: it.teamId, todayStatus: "Absent", punctuality: it.punctuality ?? 80, lastSeen: it.lastSeen ?? "Yesterday" }))
      setEmployees((c) => [...imported, ...c])
      setActivity((a) => [{ id: crypto.randomUUID(), text: `${imported.length} employees imported`, time: "Just now" }, ...a])
    } catch (err) {
      setFileError("Invalid JSON file. Upload an array of employee objects.")
    }
  }

  const startCamera = async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; await videoRef.current?.play() } catch (err) { console.error(err) }
  }

  const stopCamera = () => { if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null } if (videoRef.current) videoRef.current.srcObject = null }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx?.drawImage(videoRef.current, 0, 0)
    const data = canvasRef.current.toDataURL("image/png")
    setCaptured(data)
    stopCamera()
  }

  const confirmCheckin = (meeting: Meeting) => {
    const now = new Date()
    const meetingTime = new Date(meeting.datetime)
    const diff = now.getTime() - meetingTime.getTime()
    const status = Math.abs(diff) <= 5 * 60 * 1000 ? "On Time" : diff > 0 ? "Late" : "Early"
    setActivity((a) => [{ id: crypto.randomUUID(), text: `${meeting.name} - checked in (${status})`, time: "Just now" }, ...a])
    setCaptured(null)
    setCheckinDialogOpen(false)
  }

  const NextMeeting = useMemo(() => meetings.slice().sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0], [meetings])

  const ManagerNav = (
    <nav className="space-y-2 p-3">
      <button onClick={() => setManagerSection("dashboard")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Dashboard</button>
      <button onClick={() => setManagerSection("teams")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "teams" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>My Teams</button>
      <button onClick={() => setManagerSection("meetings")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "meetings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Meetings</button>
      <button onClick={() => setManagerSection("employees")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "employees" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Employees</button>
      <button onClick={() => setManagerSection("reports")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "reports" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Reports</button>
      <button onClick={() => setManagerSection("settings")} className={cn("w-full text-left rounded px-3 py-2", managerSection === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Settings</button>
    </nav>
  )

  const EmployeeNav = (
    <nav className="space-y-2 p-3">
      <button onClick={() => setEmployeeSection("dashboard")} className={cn("w-full text-left rounded px-3 py-2", employeeSection === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Dashboard</button>
      <button onClick={() => setEmployeeSection("attendance")} className={cn("w-full text-left rounded px-3 py-2", employeeSection === "attendance" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>My Attendance</button>
      <button onClick={() => setEmployeeSection("meetings")} className={cn("w-full text-left rounded px-3 py-2", employeeSection === "meetings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>My Meetings</button>
      <button onClick={() => setEmployeeSection("settings")} className={cn("w-full text-left rounded px-3 py-2", employeeSection === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>Settings</button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="border-b border-sidebar-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                <LayoutDashboard className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold">PresentSir</p>
                <div className="mt-1 inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200">Company Mode</div>
              </div>
            </div>
          </div>
          <div className="flex-1 px-3 py-4">{isManager ? ManagerNav : EmployeeNav}</div>
          <div className="border-t border-sidebar-border p-4">
            <Card className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground shadow-none"><CardContent className="p-4">3 meetings today</CardContent></Card>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div><p className="text-sm text-muted-foreground">Company Dashboard</p><h1 className="text-xl font-semibold text-foreground">{isManager ? managerSection : employeeSection}</h1></div>
              <div className="flex items-center gap-2"><Badge variant="secondary">Company</Badge><Badge variant="outline">{isManager ? "Manager" : "Employee"}</Badge><NotificationsPopover role={isManager ? "manager" : "employee"} /></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {isManager ? (
              <>
                {managerSection === "dashboard" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card><CardHeader><CardTitle>Total Employees</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{employees.length}</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>Meetings Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{meetings.length}</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>On Time %</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{Math.round((employees.reduce((s, e) => s + e.punctuality, 0) / employees.length) || 0)}%</div></CardContent></Card>
                      <Card><CardHeader><CardTitle>Late Arrivals</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{employees.filter((e) => e.todayStatus === "Late").length}</div></CardContent></Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="lg:col-span-2"><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent><ul className="space-y-3">{activity.map((a) => <li key={a.id} className="flex items-center justify-between"><div>{a.text}</div><div className="text-xs text-muted-foreground">{a.time}</div></li>)}</ul></CardContent></Card>
                      <Card><CardHeader><CardTitle>Team Snapshot</CardTitle></CardHeader><CardContent>{teams.map((t) => <div key={t.id} className="flex items-center justify-between py-2"><div>{t.name}</div><div>{t.punctuality}%</div></div>)}</CardContent></Card>
                    </div>
                  </>
                )}

                {managerSection === "teams" && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">My Teams</h2><Button onClick={() => setTeamDialogOpen(true)}>Create Team</Button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{teams.map((t) => <Card key={t.id}><CardContent><div className="flex items-center justify-between"><div><h3 className="font-semibold">{t.name}</h3><div className="text-sm text-muted-foreground">{t.members} members</div></div><Badge>{t.punctuality}%</Badge></div></CardContent></Card>)}</div>
                  </div>
                )}

                {managerSection === "meetings" && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Meetings</h2><Button onClick={() => setMeetingDialogOpen(true)}>Schedule Meeting</Button></div>
                    <div className="space-y-3">{meetings.map((m) => <Card key={m.id}><CardContent className="flex items-center justify-between"><div><div className="font-semibold">{m.name}</div><div className="text-sm text-muted-foreground">{new Date(m.datetime).toLocaleString()} • {m.location}</div></div><div className="flex flex-col items-end gap-2"><div className="text-sm">{m.attendees.length} attendees</div><div className="flex gap-2"><Button size="sm" onClick={() => openQrForMeeting(m)}>Generate Check-in QR</Button></div></div></CardContent></Card>)}</div>
                  </div>
                )}

                {managerSection === "employees" && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Employees</h2><div className="flex gap-2"><Button onClick={() => setEmployeeDialogOpen(true)}>Add Manually</Button><label className="cursor-pointer"><input type="file" accept="application/json" className="hidden" onChange={(e) => handleImportEmployees(e.target.files?.[0] ?? null)} /><Button variant="outline">Import JSON</Button></label></div></div>
                    <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Team</TableHead><TableHead>Today</TableHead><TableHead>Punctuality</TableHead><TableHead>Last Seen</TableHead></TableRow></TableHeader><TableBody>{employees.map((emp) => <TableRow key={emp.id}><TableCell>{emp.name}</TableCell><TableCell>{teamOptions.find((t) => t.id === emp.teamId)?.name ?? "—"}</TableCell><TableCell>{emp.todayStatus ?? "—"}</TableCell><TableCell>{emp.punctuality}%</TableCell><TableCell>{emp.lastSeen}</TableCell></TableRow>)}</TableBody></Table>
                    {fileError && <div className="text-sm text-red-500 mt-2">{fileError}</div>}
                  </div>
                )}

                {managerSection === "reports" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Attendance trends</CardTitle></CardHeader><CardContent><MiniBarChart values={[88, 90, 92, 91, 93]} /></CardContent></Card><Card><CardHeader><CardTitle>AI Insight</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">The Engineering team has the highest punctuality this month. 3 employees have been consistently late on Mondays.</p></CardContent></Card></div>
                )}

                {managerSection === "settings" && (<Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent>Company settings placeholder</CardContent></Card>)}
              </>
            ) : (
              <>
                {employeeSection === "dashboard" && (<div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><Card><CardHeader><CardTitle>My Attendance %</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">92%</div></CardContent></Card><Card><CardHeader><CardTitle>Meetings Attended</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">8</div></CardContent></Card><Card><CardHeader><CardTitle>On Time %</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">95%</div></CardContent></Card><Card><CardHeader><CardTitle>Next Meeting</CardTitle></CardHeader><CardContent>{NextMeeting ? (<div><div className="font-semibold">{NextMeeting.name}</div><div className="text-sm text-muted-foreground">{new Date(NextMeeting.datetime).toLocaleString()} • {NextMeeting.location}</div><div className="mt-2"><Button onClick={() => { setCurrentMeetingForCheckin(NextMeeting); setCheckinDialogOpen(true); startCamera(); }}>Open Check-in</Button></div></div>) : <div className="text-sm text-muted-foreground">No upcoming meetings</div>}</CardContent></Card></div><Card><CardHeader><CardTitle>Recent activity</CardTitle></CardHeader><CardContent><ul className="space-y-2">{activity.map((a) => <li key={a.id} className="flex items-center justify-between"><div>{a.text}</div><div className="text-xs text-muted-foreground">{a.time}</div></li>)}</ul></CardContent></Card></div>)}

                {employeeSection === "attendance" && (<div><h2 className="text-lg font-semibold mb-4">My Attendance</h2><div className="grid grid-cols-7 gap-1">{Array.from({ length: 30 }).map((_, i) => { const r = Math.random(); const cls = r > 0.8 ? "bg-red-500" : r > 0.3 ? "bg-emerald-500" : "bg-amber-400"; return <div key={i} className={`${cls} h-6 w-6 rounded`} /> })}</div><div className="mt-4 text-sm text-muted-foreground">Green = Present • Yellow = Late • Red = Absent</div></div>)}

                {employeeSection === "meetings" && (<div><h2 className="text-lg font-semibold mb-4">My Meetings</h2><div className="space-y-3">{meetings.map((m) => (<Card key={m.id}><CardContent className="flex items-center justify-between"><div><div className="font-semibold">{m.name}</div><div className="text-sm text-muted-foreground">{new Date(m.datetime).toLocaleString()}</div></div><div><Badge>Attended</Badge></div></CardContent></Card>))}</div></div>)}

                {employeeSection === "settings" && (<Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent>Profile settings placeholder</CardContent></Card>)}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}><DialogContent><DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Name</Label><Input value={teamForm.name} onChange={(e) => setTeamForm((s) => ({ ...s, name: e.target.value }))} /></div><div><Label>Description</Label><Input value={teamForm.description} onChange={(e) => setTeamForm((s) => ({ ...s, description: e.target.value }))} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateTeam}>Create</Button></div></div></DialogContent></Dialog>

      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}><DialogContent><DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Meeting Name</Label><Input value={meetingForm.name} onChange={(e) => setMeetingForm((s) => ({ ...s, name: e.target.value }))} /></div><div><Label>Date & Time</Label><Input type="datetime-local" value={meetingForm.datetime} onChange={(e) => setMeetingForm((s) => ({ ...s, datetime: e.target.value }))} /></div><div><Label>Location</Label><Input value={meetingForm.location} onChange={(e) => setMeetingForm((s) => ({ ...s, location: e.target.value }))} /></div><div><Label>Team</Label><Select onValueChange={(v) => setMeetingForm((s) => ({ ...s, teamId: v }))}><SelectTrigger><SelectValue>{meetingForm.teamId ? teamOptions.find((t) => t.id === meetingForm.teamId)?.name : "Select team"}</SelectValue></SelectTrigger><SelectContent>{teamOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>Cancel</Button><Button onClick={handleScheduleMeeting}>Schedule</Button></div></div></DialogContent></Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}><DialogContent><DialogHeader><DialogTitle>Check-in QR</DialogTitle></DialogHeader><div className="flex flex-col items-center gap-4">{qrSrc ? <img src={qrSrc} alt="QR" className="w-40 h-40 bg-white p-2" /> : <div className="h-40 w-40 bg-muted/30" />}<div className="text-sm text-muted-foreground">{qrMeetingName}</div><div className="text-xs text-muted-foreground">Employees can scan this QR to open the check-in flow</div></div></DialogContent></Dialog>

      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}><DialogContent><DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Name</Label><Input value={employeeForm.name} onChange={(e) => setEmployeeForm((s) => ({ ...s, name: e.target.value }))} /></div><div><Label>Email</Label><Input value={employeeForm.email} onChange={(e) => setEmployeeForm((s) => ({ ...s, email: e.target.value }))} /></div><div><Label>Team</Label><Select onValueChange={(v) => setEmployeeForm((s) => ({ ...s, teamId: v }))}><SelectTrigger><SelectValue>{employeeForm.teamId ? teamOptions.find((t) => t.id === employeeForm.teamId)?.name : "Select team"}</SelectValue></SelectTrigger><SelectContent>{teamOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>Cancel</Button><Button onClick={handleAddEmployee}>Add</Button></div></div></DialogContent></Dialog>

      <Dialog open={checkinDialogOpen} onOpenChange={(open) => { setCheckinDialogOpen(open); if (!open) stopCamera() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Meeting Check-in</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {!captured ? (
              <div>
                <video ref={videoRef} className="w-full rounded bg-black" playsInline muted />
                <div className="flex gap-2 mt-2 justify-end"><Button variant="outline" onClick={() => { stopCamera(); setCheckinDialogOpen(false) }}>Cancel</Button><Button onClick={capturePhoto}>Capture</Button></div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="space-y-3">
                <img src={captured} alt="capture" className="w-full rounded" />
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setCaptured(null); startCamera() }}>Retake</Button><Button onClick={() => currentMeetingForCheckin && confirmCheckin(currentMeetingForCheckin)}>Confirm Check-in</Button></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CompanyDashboardShell
