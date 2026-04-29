// Placeholder data for PresentSir

export const departments = [
  { id: "1", name: "Computer Science", code: "CS", teacherCount: 8, studentCount: 245, avgAttendance: 87 },
  { id: "2", name: "Electrical Engineering", code: "EE", teacherCount: 6, studentCount: 180, avgAttendance: 82 },
  { id: "3", name: "Mechanical Engineering", code: "ME", teacherCount: 7, studentCount: 210, avgAttendance: 85 },
  { id: "4", name: "Civil Engineering", code: "CE", teacherCount: 5, studentCount: 156, avgAttendance: 88 },
  { id: "5", name: "Business Administration", code: "BA", teacherCount: 9, studentCount: 320, avgAttendance: 79 },
]

export const teachers = [
  { id: "1", name: "Dr. Sarah Mitchell", email: "sarah.mitchell@university.edu", department: "Computer Science", departmentId: "1", roomCount: 3, status: "active" as const, inviteCode: "TCH-SM2K" },
  { id: "2", name: "Prof. James Chen", email: "james.chen@university.edu", department: "Computer Science", departmentId: "1", roomCount: 2, status: "active" as const, inviteCode: "TCH-JC4X" },
  { id: "3", name: "Dr. Emily Rodriguez", email: "emily.r@university.edu", department: "Electrical Engineering", departmentId: "2", roomCount: 4, status: "active" as const, inviteCode: "TCH-ER7N" },
  { id: "4", name: "Prof. Michael Brown", email: "m.brown@university.edu", department: "Mechanical Engineering", departmentId: "3", roomCount: 2, status: "inactive" as const, inviteCode: "TCH-MB3P" },
  { id: "5", name: "Dr. Lisa Wang", email: "lisa.wang@university.edu", department: "Business Administration", departmentId: "5", roomCount: 5, status: "active" as const, inviteCode: "TCH-LW9Q" },
]

export const rooms = [
  { id: "1", roomId: "ROOM-4X7K", name: "Introduction to Programming", subject: "CS101", description: "Fundamentals of programming using Python", teacherId: "1", studentCount: 45, totalSessions: 24 },
  { id: "2", roomId: "ROOM-8M2P", name: "Data Structures", subject: "CS201", description: "Advanced data structures and algorithms", teacherId: "1", studentCount: 38, totalSessions: 22 },
  { id: "3", roomId: "ROOM-3N5L", name: "Web Development", subject: "CS301", description: "Full-stack web development with React and Node.js", teacherId: "1", studentCount: 42, totalSessions: 20 },
  { id: "4", roomId: "ROOM-9K4R", name: "Database Systems", subject: "CS202", description: "Relational and NoSQL databases", teacherId: "2", studentCount: 35, totalSessions: 18 },
  { id: "5", roomId: "ROOM-2H6T", name: "Circuit Analysis", subject: "EE101", description: "Basic electrical circuit analysis", teacherId: "3", studentCount: 52, totalSessions: 26 },
]

export const students = [
  { id: "1", name: "Alex Johnson", email: "alex@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "1", roomName: "Introduction to Programming", attendance: 95, lastSeen: "Today, 9:15 AM", riskLevel: "low" as const },
  { id: "2", name: "Sarah Chen", email: "sarah@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "1", roomName: "Introduction to Programming", attendance: 87, lastSeen: "Today, 9:12 AM", riskLevel: "low" as const },
  { id: "3", name: "Mike Williams", email: "mike@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "1", roomName: "Introduction to Programming", attendance: 72, lastSeen: "Yesterday", riskLevel: "medium" as const },
  { id: "4", name: "Emma Davis", email: "emma@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "2", roomName: "Data Structures", attendance: 68, lastSeen: "2 days ago", riskLevel: "high" as const },
  { id: "5", name: "James Wilson", email: "james@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "2", roomName: "Data Structures", attendance: 91, lastSeen: "Today, 11:00 AM", riskLevel: "low" as const },
  { id: "6", name: "Lisa Anderson", email: "lisa@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "3", roomName: "Web Development", attendance: 65, lastSeen: "3 days ago", riskLevel: "high" as const },
  { id: "7", name: "David Brown", email: "david@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "3", roomName: "Web Development", attendance: 88, lastSeen: "Today, 2:30 PM", riskLevel: "low" as const },
  { id: "8", name: "Jennifer Taylor", email: "jennifer@university.edu", avatar: "/placeholder.svg?height=40&width=40", roomId: "4", roomName: "Database Systems", attendance: 78, lastSeen: "Yesterday", riskLevel: "medium" as const },
]

export const sessions = [
  { id: "1", roomId: "1", roomName: "Introduction to Programming", room: "Room 101", duration: "90 min", date: "2024-03-15", time: "09:00", studentsPresent: 42, totalStudents: 45, isActive: true },
  { id: "2", roomId: "2", roomName: "Data Structures", room: "Room 205", duration: "75 min", date: "2024-03-15", time: "11:00", studentsPresent: 35, totalStudents: 38, isActive: false },
  { id: "3", roomId: "3", roomName: "Web Development", room: "Lab 3", duration: "120 min", date: "2024-03-14", time: "14:00", studentsPresent: 38, totalStudents: 42, isActive: false },
  { id: "4", roomId: "4", roomName: "Database Systems", room: "Room 302", duration: "90 min", date: "2024-03-14", time: "10:00", studentsPresent: 31, totalStudents: 35, isActive: false },
]

export const liveSessionStudents = [
  { id: "1", name: "Alex Johnson", checkinTime: "9:02 AM", presenceStatus: "online" as const, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Sarah Chen", checkinTime: "9:05 AM", presenceStatus: "online" as const, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Mike Williams", checkinTime: "9:12 AM", presenceStatus: "away" as const, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "James Wilson", checkinTime: "9:08 AM", presenceStatus: "online" as const, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "7", name: "David Brown", checkinTime: "9:15 AM", presenceStatus: "online" as const, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "9", name: "Rachel Green", checkinTime: "9:03 AM", presenceStatus: "offline" as const, avatar: "/placeholder.svg?height=40&width=40" },
]

export const flaggedCheckins = [
  { id: "1", studentName: "Mike Williams", studentId: "3", profilePhoto: "/placeholder.svg?height=80&width=80", checkinPhoto: "/placeholder.svg?height=80&width=80", session: "Introduction to Programming", time: "09:15", similarity: 72 },
  { id: "2", studentName: "Unknown Student", studentId: null, profilePhoto: "/placeholder.svg?height=80&width=80", checkinPhoto: "/placeholder.svg?height=80&width=80", session: "Introduction to Programming", time: "09:22", similarity: 45 },
  { id: "3", studentName: "Lisa Anderson", studentId: "6", profilePhoto: "/placeholder.svg?height=80&width=80", checkinPhoto: "/placeholder.svg?height=80&width=80", session: "Web Development", time: "14:05", similarity: 68 },
]

export const atRiskStudents = [
  { id: "4", name: "Emma Davis", attendance: 68, missedClasses: 8, trend: "down" as const },
  { id: "6", name: "Lisa Anderson", attendance: 65, missedClasses: 9, trend: "down" as const },
  { id: "3", name: "Mike Williams", attendance: 72, missedClasses: 7, trend: "stable" as const },
  { id: "8", name: "Jennifer Taylor", attendance: 78, missedClasses: 5, trend: "up" as const },
]

export const excuseRequests = [
  { id: "1", studentName: "Emma Davis", studentId: "4", date: "2024-03-14", session: "Web Development", sessionId: "3", reason: "Medical", description: "Doctor appointment - note attached", status: "pending" as const, attachmentUrl: "#" },
  { id: "2", studentName: "Mike Williams", studentId: "3", date: "2024-03-13", session: "Database Systems", sessionId: "4", reason: "Personal", description: "Family emergency", status: "pending" as const, attachmentUrl: null },
  { id: "3", studentName: "Lisa Anderson", studentId: "6", date: "2024-03-12", session: "Introduction to Programming", sessionId: "1", reason: "Travel", description: "University sports competition", status: "approved" as const, attachmentUrl: "#" },
  { id: "4", studentName: "Jennifer Taylor", studentId: "8", date: "2024-03-11", session: "Data Structures", sessionId: "2", reason: "Medical", description: "Flu symptoms", status: "rejected" as const, attachmentUrl: "#" },
]

export const attendanceTrends = [
  { date: "Week 1", attendance: 92 },
  { date: "Week 2", attendance: 88 },
  { date: "Week 3", attendance: 91 },
  { date: "Week 4", attendance: 85 },
  { date: "Week 5", attendance: 89 },
  { date: "Week 6", attendance: 87 },
  { date: "Week 7", attendance: 84 },
  { date: "Week 8", attendance: 86 },
]

export const sentimentTrends = [
  { session: "Session 1", focused: 65, neutral: 25, lost: 10 },
  { session: "Session 2", focused: 58, neutral: 30, lost: 12 },
  { session: "Session 3", focused: 70, neutral: 22, lost: 8 },
  { session: "Session 4", focused: 55, neutral: 32, lost: 13 },
  { session: "Session 5", focused: 62, neutral: 28, lost: 10 },
  { session: "Session 6", focused: 68, neutral: 24, lost: 8 },
]

export const heatmapData = [
  { day: "Monday", hour: "9:00", value: 95 },
  { day: "Monday", hour: "11:00", value: 88 },
  { day: "Monday", hour: "14:00", value: 82 },
  { day: "Monday", hour: "16:00", value: 75 },
  { day: "Tuesday", hour: "9:00", value: 90 },
  { day: "Tuesday", hour: "11:00", value: 92 },
  { day: "Tuesday", hour: "14:00", value: 78 },
  { day: "Tuesday", hour: "16:00", value: 70 },
  { day: "Wednesday", hour: "9:00", value: 88 },
  { day: "Wednesday", hour: "11:00", value: 85 },
  { day: "Wednesday", hour: "14:00", value: 80 },
  { day: "Wednesday", hour: "16:00", value: 72 },
  { day: "Thursday", hour: "9:00", value: 93 },
  { day: "Thursday", hour: "11:00", value: 91 },
  { day: "Thursday", hour: "14:00", value: 84 },
  { day: "Thursday", hour: "16:00", value: 76 },
  { day: "Friday", hour: "9:00", value: 85 },
  { day: "Friday", hour: "11:00", value: 80 },
  { day: "Friday", hour: "14:00", value: 68 },
  { day: "Friday", hour: "16:00", value: 55 },
]

export const departmentHeatmap = [
  { department: "Computer Science", week1: 89, week2: 87, week3: 91, week4: 85 },
  { department: "Electrical Engineering", week1: 82, week2: 84, week3: 80, week4: 83 },
  { department: "Mechanical Engineering", week1: 86, week2: 85, week3: 88, week4: 84 },
  { department: "Civil Engineering", week1: 90, week2: 88, week3: 87, week4: 89 },
  { department: "Business Administration", week1: 78, week2: 80, week3: 76, week4: 81 },
]

export const recentActivity = [
  { id: "1", type: "session_started", message: "Dr. Sarah Mitchell started a session in Introduction to Programming", time: "2 minutes ago" },
  { id: "2", type: "student_flagged", message: "Flagged check-in detected for Mike Williams", time: "5 minutes ago" },
  { id: "3", type: "excuse_submitted", message: "Emma Davis submitted an excuse request", time: "15 minutes ago" },
  { id: "4", type: "session_ended", message: "Prof. James Chen ended Database Systems session", time: "1 hour ago" },
  { id: "5", type: "teacher_added", message: "New teacher Dr. Emily Rodriguez added to Electrical Engineering", time: "2 hours ago" },
]

export const studentTimetable = [
  { id: "1", day: "Monday", time: "09:00 - 10:30", subject: "Introduction to Programming", teacher: "Dr. Sarah Mitchell", room: "Room 101", roomId: "ROOM-4X7K" },
  { id: "2", day: "Monday", time: "11:00 - 12:30", subject: "Data Structures", teacher: "Dr. Sarah Mitchell", room: "Room 205", roomId: "ROOM-8M2P" },
  { id: "3", day: "Tuesday", time: "09:00 - 10:30", subject: "Web Development", teacher: "Dr. Sarah Mitchell", room: "Lab 3", roomId: "ROOM-3N5L" },
  { id: "4", day: "Tuesday", time: "14:00 - 15:30", subject: "Database Systems", teacher: "Prof. James Chen", room: "Room 302", roomId: "ROOM-9K4R" },
  { id: "5", day: "Wednesday", time: "09:00 - 10:30", subject: "Introduction to Programming", teacher: "Dr. Sarah Mitchell", room: "Room 101", roomId: "ROOM-4X7K" },
  { id: "6", day: "Thursday", time: "11:00 - 12:30", subject: "Data Structures", teacher: "Dr. Sarah Mitchell", room: "Room 205", roomId: "ROOM-8M2P" },
  { id: "7", day: "Friday", time: "09:00 - 10:30", subject: "Web Development", teacher: "Dr. Sarah Mitchell", room: "Lab 3", roomId: "ROOM-3N5L" },
]

export const studentAttendanceBySubject = [
  { subject: "Introduction to Programming", attended: 22, total: 24, percentage: 92 },
  { subject: "Data Structures", attended: 18, total: 22, percentage: 82 },
  { subject: "Web Development", attended: 17, total: 20, percentage: 85 },
  { subject: "Database Systems", attended: 14, total: 18, percentage: 78 },
]

export const studentAttendanceCalendar = [
  { date: "2024-03-01", status: "present" as const },
  { date: "2024-03-04", status: "present" as const },
  { date: "2024-03-05", status: "absent" as const },
  { date: "2024-03-06", status: "present" as const },
  { date: "2024-03-07", status: "present" as const },
  { date: "2024-03-08", status: "present" as const },
  { date: "2024-03-11", status: "present" as const },
  { date: "2024-03-12", status: "absent" as const },
  { date: "2024-03-13", status: "present" as const },
  { date: "2024-03-14", status: "present" as const },
  { date: "2024-03-15", status: "present" as const },
]

export const notifications = [
  { id: "1", title: "Session Starting Soon", message: "Introduction to Programming starts in 15 minutes", time: "Just now", read: false },
  { id: "2", title: "Attendance Warning", message: "Your attendance in Data Structures dropped below 85%", time: "1 hour ago", read: false },
  { id: "3", title: "Excuse Approved", message: "Your excuse for March 12th has been approved", time: "2 hours ago", read: true },
  { id: "4", title: "New Session Created", message: "A new session has been scheduled for tomorrow", time: "Yesterday", read: true },
]

export const aiInsights = {
  summary: "Overall class attendance has remained stable at 87% this semester. Friday afternoon sessions consistently show the lowest attendance rates, dropping to 55-68%. Students Emma Davis and Lisa Anderson are at high risk of failing due to attendance, having missed over 30% of classes. Consider sending automated reminders before Friday sessions and scheduling one-on-one meetings with at-risk students.",
  recommendations: [
    "Schedule important assessments on Tuesday mornings for maximum attendance",
    "Consider moving Friday 4pm sessions to earlier time slots",
    "Implement early intervention for students below 75% attendance",
    "Send personalized check-in messages to at-risk students"
  ]
}

export const adminAiInsights = {
  summary: "Organisation-wide attendance this month averaged 84.2%, down 2.1% from last month. The Business Administration department shows the lowest attendance at 79%, while Civil Engineering leads at 88%. Notably, Monday morning sessions across all departments have the highest attendance rates. 12 teachers have active sessions currently, with a total of 847 students checked in today.",
  trends: [
    "Business Administration department needs attention - 3 consecutive weeks of declining attendance",
    "Computer Science shows strong engagement with 87% average and improving trend",
    "Friday afternoon sessions universally underperform across all departments",
    "New teacher onboarding in Electrical Engineering showing positive early results"
  ]
}
