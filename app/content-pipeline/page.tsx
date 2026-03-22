import DashboardShell from '@/components/layout/DashboardShell'
import SectionPlaceholder from '@/components/dashboard/SectionPlaceholder'

export default function ContentPipelinePage() {
  return (
    <DashboardShell
      title="Content Pipeline"
      description="Command surface for content production, publishing, and queue health across the media workflow."
    >
      <SectionPlaceholder
        eyebrow="Content Pipeline"
        title="Pipeline controls are reserved for the next integration pass."
        description="The route is in place so the rest of the command surface can link to it now; real publishing telemetry can drop in without another shell refactor."
      />
    </DashboardShell>
  )
}
