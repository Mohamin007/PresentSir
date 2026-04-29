"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  Settings,
  ArrowRight,
  DoorOpen,
  PlayCircle,
  BarChart3,
  UsersRound,
  Video,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SchoolDashboardShell } from "@/components/school-dashboard-shell"
import { CompanyDashboardShell } from "@/components/company-dashboard-shell"
import { EventsDashboardShell } from "@/components/events-dashboard-shell"

type OrgType = "school" | "university" | "company" | "events"
type UserRole = string

interface MenuItem {
  label: string
  description: string
  icon: React.ReactNode
  href: string
}

const getFallbackMenuItems = (orgType: OrgType, userRole: UserRole): MenuItem[] => {
  const iconClass = "h-5 w-5"

  if (orgType === "university") {
    if (userRole === "student") {
      return [
        { label: "Dashboard", description: "Overview and analytics", icon: <LayoutDashboard className={iconClass} />, href: "/student" },
        { label: "My Attendance", description: "View attendance records", icon: <BarChart3 className={iconClass} />, href: "/student/attendance" },
        { label: "Timetable", description: "View your schedule", icon: <ClipboardList className={iconClass} />, href: "/student/timetable" },
        { label: "Campus Events", description: "Read campus notices", icon: <FileText className={iconClass} />, href: "/student/campus-events" },
        { label: "Submit Excuse", description: "Send an excuse request", icon: <FileText className={iconClass} />, href: "/student/excuse" },
      ]
    }

    if (userRole === "teacher") {
      return [
        { label: "Dashboard", description: "Overview and analytics", icon: <LayoutDashboard className={iconClass} />, href: "/teacher" },
    import {
      LayoutDashboard,
      BookOpen,
      Users,
      ClipboardList,
      FileText,
      Settings,
      ArrowRight,
      DoorOpen,
      PlayCircle,
      BarChart3,
      UsersRound,
      Video,
      LogOut,
    } from "lucide-react"
        { label: "My Rooms", description: "Manage lecture rooms", icon: <DoorOpen className={iconClass} />, href: "/teacher/rooms" },
        { label: "Sessions", description: "Manage classes", icon: <PlayCircle className={iconClass} />, href: "/teacher/sessions" },
        { label: "Students", description: "View all students", icon: <Users className={iconClass} />, href: "/teacher/students" },
        { label: "Analytics", description: "View attendance stats", icon: <BarChart3 className={iconClass} />, href: "/teacher/analytics" },
      ]
    }
    import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
    import { OrgAwareSidebar } from "@/components/org-aware-sidebar"
    import { Separator } from "@/components/ui/separator"
    import { NotificationsPopover } from "@/components/notifications-popover"

    return [
      { label: "Dashboard", description: "Overview and analytics", icon: <LayoutDashboard className={iconClass} />, href: "/admin" },
      { label: "Departments", description: "Manage departments", icon: <Users className={iconClass} />, href: "/admin/departments" },
      { label: "Teachers", description: "Manage teaching staff", icon: <BookOpen className={iconClass} />, href: "/admin/teachers" },
      { label: "Reports", description: "Generate reports", icon: <FileText className={iconClass} />, href: "/admin/reports" },
      { label: "Settings", description: "Manage preferences", icon: <Settings className={iconClass} />, href: "/admin/settings" },
    ]
  }

  if (orgType === "company") {
    if (userRole === "manager") {
      return [
        { label: "Dashboard", description: "Overview and analytics", icon: <LayoutDashboard className={iconClass} />, href: "/company/dashboard" },
        { label: "My Teams", description: "Manage teams", icon: <UsersRound className={iconClass} />, href: "/company/teams" },
        { label: "Meetings", description: "Track meetings", icon: <Video className={iconClass} />, href: "/company/meetings" },
        { label: "Employees", description: "View team members", icon: <Users className={iconClass} />, href: "/company/employees" },
        { label: "Reports", description: "Generate reports", icon: <FileText className={iconClass} />, href: "/company/reports" },
        { label: "Settings", description: "Manage preferences", icon: <Settings className={iconClass} />, href: "/company/settings" },
      ]
    }

    return [
      { label: "Dashboard", description: "Overview and analytics", icon: <LayoutDashboard className={iconClass} />, href: "/company/employee/dashboard" },
      { label: "My Meetings", description: "View scheduled meetings", icon: <Video className={iconClass} />, href: "/company/employee/meetings" },
      { label: "Check-in", description: "Check in to meetings", icon: <BarChart3 className={iconClass} />, href: "/company/employee/checkin" },
      { label: "My Schedule", description: "View your schedule", icon: <ClipboardList className={iconClass} />, href: "/company/employee/schedule" },
      { label: "Settings", description: "Manage preferences", icon: <Settings className={iconClass} />, href: "/company/employee/settings" },
    ]
  }

  return []
}

function GenericDashboard({ orgType, userRole, onLogout }: { orgType: OrgType; userRole: UserRole; onLogout: () => void }) {
  const items = getFallbackMenuItems(orgType, userRole)
  const orgLabel = orgType === "university" ? "University" : orgType === "company" ? "Company" : "School"
  const orgEmoji = orgType === "university" ? "🎓" : orgType === "company" ? "🏢" : "🏫"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{orgEmoji}</div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground capitalize">{orgLabel} • {userRole}</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">Welcome back! Here are your quick actions and navigation options.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-primary group-hover:scale-110 transition-transform">{item.icon}</div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
      const sidebarRole = userRole === "admin" || userRole === "teacher" || userRole === "student" ? userRole : undefined
            </Link>
          ))}
        <SidebarProvider defaultOpen={true}>
          <OrgAwareSidebar role={sidebarRole} user={{ name: "PresentSir User", email: "user@example.com" }} />
          <SidebarInset>
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3 min-w-0">
                    <SidebarTrigger className="-ml-2 shrink-0" />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="min-w-0">
                      <h1 className="text-xl font-semibold text-foreground truncate">Dashboard</h1>
                      <p className="text-sm text-muted-foreground truncate capitalize">{orgLabel} • {userRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <NotificationsPopover role={sidebarRole ?? "student"} />
                    <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </header>

              <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-12 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-4xl">{orgEmoji}</div>
                        <div>
                          <p className="text-3xl font-bold text-foreground">Dashboard</p>
                          <p className="text-muted-foreground capitalize">{orgLabel} • {userRole}</p>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground">Welcome back! Here are your quick actions and navigation options.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-primary group-hover:scale-110 transition-transform">{item.icon}</div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  <Card className="mt-12 bg-muted/50 border-0">
                    <CardHeader>
                      <CardTitle>Organization Details</CardTitle>
                      <CardDescription>Read from localStorage for the current login session</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      <Badge variant="secondary">{orgLabel}</Badge>
                      <Badge variant="outline" className="capitalize">{userRole}</Badge>
                    </CardContent>
                  </Card>
                </div>
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (orgType === "school") {
    return <SchoolDashboardShell />
  }

  if (orgType === "events") {
    return <EventsDashboardShell userRole={userRole} />
  }

  if (orgType === "company") {
    return <CompanyDashboardShell userRole={userRole} />
  }

  return <GenericDashboard orgType={orgType} userRole={userRole} onLogout={handleLogout} />
}