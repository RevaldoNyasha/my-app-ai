import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { ProjectAnalysisCard } from '@/components/research/ProjectAnalysisCard'

interface AnalysisPageProps {
  projectId?: string
}

export function AnalysisPage({ projectId }: AnalysisPageProps) {
  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project analysis' : 'Cross-project analysis'}
        title="Qualitative Analysis"
        description="Themes are generated from your coded excerpts. Review, rename, merge or remove them — the researcher stays in control."
      />

      {projectId ? <ProjectAnalysisCard projectId={projectId} /> : null}
    </PageContainer>
  )
}
