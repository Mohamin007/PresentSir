import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { OrgAwareSidebar } from "@/components/org-aware-sidebar"
import { Separator } from "@/components/ui/separator"
import { NotificationsPopover } from "@/components/notifications-popover"

export default function UniversityAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <OrgAwareSidebar role="admin" />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          <NotificationsPopover role="admin" />
        </header>
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}