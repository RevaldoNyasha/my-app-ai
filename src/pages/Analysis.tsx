import { useEffect, useMemo, useState } from 'react'
import { PageContainer, PageHeading, SectionHeading } from '@/components/layout/PageContainer'
import { ThemeCard } from '@/components/research/ThemeCard'
import { ThemeRelationshipMap } from '@/components/research/ThemeRelationshipMap'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LayersIcon } from '@/components/ui/icons'
import { getProject, listThemeRelationships, listThemes } from '@/services/researchService'
import type { ResearchTheme, ThemeRelationship } from '@/types/research'

interface AnalysisPageProps {
  projectId?: string
}

export function AnalysisPage({ projectId }: AnalysisPageProps) {
  const [themes, setThemes] = useState<ResearchTheme[]>([])
  const [relationships, setRelationships] = useState<ThemeRelationship[]>([])
  const [projectName, setProjectName] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    Promise.all([listThemes(projectId), listThemeRelationships(projectId), getProject(projectId)]).then(
      ([themesResult, relationshipsResult, project]) => {
        if (cancelled) return
        setThemes(themesResult)
        setRelationships(relationshipsResult)
        setProjectName(project?.name)
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [projectId])

  const totals = useMemo(
    () => ({
      codes: themes.reduce((sum, theme) => sum + theme.codes.length, 0),
      excerpts: themes.reduce((sum, theme) => sum + theme.excerptCount, 0),
    }),
    [themes],
  )

  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project analysis' : 'Cross-project analysis'}
        title="Qualitative Analysis"
        description="Themes are generated from your coded excerpts. Review, rename, merge or remove them — the researcher stays in control."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Themes', value: themes.length },
          { label: 'Codes', value: totals.codes },
          { label: 'Supporting excerpts', value: totals.excerpts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink-200 bg-surface px-4 py-3.5"
          >
            <p className="font-serif text-xl font-semibold tabular-nums leading-none text-ink-900">
              {isLoading ? '—' : stat.value}
            </p>
            <p className="mt-1.5 text-[0.74rem] leading-5 text-ink-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <SectionHeading
          title="Theme relationships"
          action={<Badge tone="brand">Co-occurrence</Badge>}
        />
        {themes.length === 0 && !isLoading ? (
          <EmptyState
            icon={<LayersIcon className="size-5" />}
            title="No themes yet"
            description="Once research data is coded, themes and their relationships will appear here."
          />
        ) : (
          <ThemeRelationshipMap
            themes={themes}
            relationships={relationships}
            hubLabel={projectName ?? 'Research'}
          />
        )}
      </section>

      <section className="mt-8">
        <SectionHeading
          title="Themes"
          action={
            <span className="text-[0.76rem] text-ink-500">
              {themes.length} themes · each theme lists its supporting codes
            </span>
          }
        />
        <div className="grid gap-3.5 lg:grid-cols-2">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>
    </PageContainer>
  )
}
