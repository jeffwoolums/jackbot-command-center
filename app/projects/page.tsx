import DashboardShell from '@/components/layout/DashboardShell'
import EnhancedKanbanBoard from '@/components/dashboard/EnhancedKanbanBoard'

export default function ProjectsPage() {
  return (
    <DashboardShell
      title="Projects"
      description="The existing Kanban board stays intact and now lives under the main command shell for faster navigation."
    >
      <EnhancedKanbanBoard />
    </DashboardShell>
  )
}
