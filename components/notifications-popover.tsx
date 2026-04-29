"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type NotificationRole = "teacher" | "student" | "admin" | "manager" | "employee" | "school" | "events"

const notificationSets: Record<NotificationRole, Array<{ id: string; title: string; message: string; time: string; read: boolean }>> = {
  teacher: [
    { id: "t1", title: "New excuse submitted", message: "Amina Yusuf submitted an excuse for Database Systems.", time: "2m ago", read: false },
    { id: "t2", title: "Session ended", message: "Web Development ended with 42 students attended.", time: "18m ago", read: false },
    { id: "t3", title: "Attendance warning", message: "3 students have been offline for more than 10 minutes.", time: "1h ago", read: true },
  ],
  student: [
    { id: "s1", title: "Excuse approved", message: "Your excuse for March 12 was approved.", time: "5m ago", read: false },
    { id: "s2", title: "New exam notice", message: "Midterm Mathematics has been posted.", time: "30m ago", read: false },
    { id: "s3", title: "Campus event posted", message: "Tech Talk: AI in Education was added to campus events.", time: "2h ago", read: true },
  ],
  admin: [
    { id: "a1", title: "Face enrollment completed", message: "12 student faces were enrolled today.", time: "12m ago", read: false },
    { id: "a2", title: "New excuse queued", message: "4 excuses are awaiting review from faculty.", time: "42m ago", read: false },
  ],
  manager: [
    { id: "m1", title: "Team check-in summary", message: "Engineering has 93% attendance so far today.", time: "8m ago", read: false },
    { id: "m2", title: "Meeting ended", message: "Weekly Standup ended with 11 attendees present.", time: "50m ago", read: true },
  ],
  employee: [
    { id: "e1", title: "Meeting reminder", message: "Product Sync starts in 15 minutes.", time: "3m ago", read: false },
    { id: "e2", title: "Attendance updated", message: "Your check-in for today is marked present.", time: "1h ago", read: true },
  ],
  school: [
    { id: "sc1", title: "Report published", message: "Weekly attendance report is ready for review.", time: "20m ago", read: false },
    { id: "sc2", title: "Exam notice posted", message: "Grade 10 midterm schedule has been updated.", time: "1h ago", read: true },
  ],
  events: [
    { id: "ev1", title: "Event approved", message: "Tech Summit 2026 is now live for registration.", time: "10m ago", read: false },
    { id: "ev2", title: "Registration spike", message: "Design Meetup registrations increased by 18 today.", time: "2h ago", read: true },
  ],
}

export function NotificationsPopover({ role = "student" }: { role?: NotificationRole }) {
  const notifications = notificationSets[role]
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border p-4">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "border-b border-border p-4 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                !notification.read && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                {!notification.read && (
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
                <div className={cn(!notification.read ? "" : "ml-5")}>
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button variant="ghost" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
