"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
  FileText,
  DoorOpen,
  PlayCircle,
  Clock,
  Camera,
  Calendar,
  CalendarDays,
  FileQuestion,
  School,
  BookOpen,
  ClipboardList,
  UsersRound,
  Video,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Admin navigation (unchanged for backwards compatibility)
const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Departments", href: "/admin/departments", icon: Building2 },
  { title: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { title: "Face Enrollment", href: "/admin/face-enrollment", icon: Camera },
  { title: "Reports", href: "/admin/reports", icon: FileText },
  { title: "Campus Events", href: "/admin/campus-events", icon: CalendarDays },
  { title: "Exams", href: "/dashboard/university/admin/exams", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

// Teacher navigation (unchanged for backwards compatibility)
const teacherNavItems = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { title: "My Rooms", href: "/teacher/rooms", icon: DoorOpen },
  { title: "Sessions", href: "/teacher/sessions", icon: PlayCircle },
  { title: "Excuses", href: "/teacher/excuses", icon: FileText },
  { title: "Students", href: "/teacher/students", icon: Users },
  { title: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
]

// Student navigation (unchanged for backwards compatibility)
const studentNavItems = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "My Attendance", href: "/student/attendance", icon: BarChart3 },
  { title: "Attendance Calculator", href: "/student/attendance-calculator", icon: Clock },
  { title: "Timetable", href: "/student/timetable", icon: Calendar },
  { title: "Campus Events", href: "/student/campus-events", icon: CalendarDays },
  { title: "Exams", href: "/dashboard/university/student/exams", icon: FileText },
  { title: "Submit Excuse", href: "/student/excuse", icon: FileQuestion },
]

// School-specific navigation
const schoolNavItems = [
  { title: "Dashboard", href: "/school/dashboard", icon: LayoutDashboard },
  { title: "My Classes", href: "/school/classes", icon: BookOpen },
  { title: "Students", href: "/school/students", icon: Users },
  { title: "Marks & Exams", href: "/school/marks", icon: ClipboardList },
  { title: "Reports", href: "/school/reports", icon: FileText },
  { title: "Settings", href: "/school/settings", icon: Settings },
]

// University-specific navigation
const universityAdminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Departments", href: "/admin/departments", icon: Building2 },
  { title: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { title: "Face Enrollment", href: "/admin/face-enrollment", icon: Camera },
  { title: "Reports", href: "/admin/reports", icon: FileText },
  { title: "Campus Events", href: "/admin/campus-events", icon: CalendarDays },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

const universityStudentNavItems = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "My Attendance", href: "/student/attendance", icon: BarChart3 },
  { title: "Timetable", href: "/student/timetable", icon: Calendar },
  { title: "Campus Events", href: "/student/campus-events", icon: Calendar },
  { title: "Submit Excuse", href: "/student/excuse", icon: FileQuestion },
]

const universityTeacherNavItems = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { title: "My Rooms", href: "/teacher/rooms", icon: DoorOpen },
  { title: "Sessions", href: "/teacher/sessions", icon: PlayCircle },
  { title: "Excuses", href: "/teacher/excuses", icon: FileText },
  { title: "Students", href: "/teacher/students", icon: Users },
  { title: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
]

// Company-specific navigation
const companyNavItems = [
  { title: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { title: "My Teams", href: "/company/teams", icon: UsersRound },
  { title: "Meetings", href: "/company/meetings", icon: Video },
  { title: "Employees", href: "/company/employees", icon: Users },
  { title: "Reports", href: "/company/reports", icon: FileText },
  { title: "Settings", href: "/company/settings", icon: Settings },
]

type OrgType = "school" | "university" | "company"
type Role = "admin" | "teacher" | "student"

interface AppSidebarProps {
  role?: Role
  orgType?: OrgType
  orgName?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const orgTypeConfig: Record<OrgType, { icon: typeof School; label: string; color: string }> = {
  school: { icon: School, label: "School", color: "bg-orange-500/10 text-orange-600" },
  university: { icon: GraduationCap, label: "University", color: "bg-blue-500/10 text-blue-600" },
  company: { icon: Building2, label: "Company", color: "bg-purple-500/10 text-purple-600" },
}

export function AppSidebar({ role, orgType, orgName, user }: AppSidebarProps) {
  const pathname = usePathname()

  // Determine nav items based on orgType or role
  let navItems
  if (orgType === "school") {
    navItems = schoolNavItems
  } else if (orgType === "university") {
    if (role === "student") {
      navItems = universityStudentNavItems
    } else if (role === "admin") {
      navItems = universityAdminNavItems
    } else {
      navItems = universityTeacherNavItems
    }
  } else if (orgType === "company") {
    navItems = companyNavItems
  } else if (role === "admin") {
    navItems = adminNavItems
  } else if (role === "teacher") {
    navItems = teacherNavItems
  } else {
    navItems = studentNavItems
  }

  const defaultUsers = {
    admin: { name: "Dr. Robert Hayes", email: "r.hayes@university.edu" },
    teacher: { name: "Dr. Sarah Mitchell", email: "sarah.mitchell@university.edu" },
    student: { name: "Alex Johnson", email: "alex@university.edu" },
  }

  const currentUser = user || (role ? defaultUsers[role] : { name: "User", email: "user@example.com" })
  const OrgIcon = orgType ? orgTypeConfig[orgType].icon : GraduationCap

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <OrgIcon className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-lg font-semibold text-sidebar-foreground">PresentSir</span>
            {orgType && orgName ? (
              <span className="block text-xs text-sidebar-muted truncate">{orgName}</span>
            ) : role ? (
              <span className="block text-xs text-sidebar-muted capitalize">{role} Portal</span>
            ) : null}
          </div>
        </Link>
        {orgType && (
          <Badge variant="secondary" className={`mt-3 w-fit text-xs ${orgTypeConfig[orgType].color}`}>
            {orgTypeConfig[orgType].label}
          </Badge>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    className="hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg?height=36&width=36"} alt={currentUser.name} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-sidebar-muted truncate">
              {currentUser.email}
            </p>
          </div>
          <Link
            href="/"
            className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
