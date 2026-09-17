import { useEffect, useMemo, useState } from 'react'
import { PageContainer, PageHeading, SectionHeading } from '@/components/layout/PageContainer'
import { ThemeCard } from '@/components/research/ThemeCard'
import { ThemeRelationshipMap } from '@/components/research/ThemeRelationshipMap'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnalysisIcon, LayersIcon, SparkleIcon } from '@/components/ui/icons'
import { listThemeRelationships, listThemes } from '@/services/researchService'
import { useToast } from '@/hooks/useToast'
import type { ResearchTheme, ThemeRelationship } from '@/types/research'

interface AnalysisPageProps {
  projectId?: string
}

export function AnalysisPage({ projectId }: AnalysisPageProps) {
  const { comingSoon } = useToast()
  const [themes, setThemes] = useState<ResearchTheme[]>([])
  const [relationships, setRelationships] = useState<ThemeRelationship[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    Promise.all([listThemes(projectId), listThemeRelationships()]).then(
      ([themesResult, relationshipsResult]) => {
        if (cancelled) return
        setThemes(themesResult)
        setRelationships(relationshipsResult)
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
      participants: themes.reduce((sum, theme) => sum + theme.participantCount, 0),
    }),
    [themes],
  )

  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project analysis' : 'Cross-project analysis'}
        title="Qualitative Analysis"
        description="Themes are generated from your coded excerpts. Review, rename, merge or remove them — the researcher stays in control."
        actions={
          <Button variant="outline" onClick={() => comingSoon('Re-running the analysis')}>
            <SparkleIcon className="size-4" />
            Re-run analysis
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Themes', value: themes.length },
          { label: 'Codes', value: totals.codes },
          { label: 'Supporting excerpts', value: totals.excerpts },
          { label: 'Participants represented', value: totals.participants },
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
          <ThemeRelationshipMap themes={themes} relationships={relationships} />
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

      <section className="mt-8 rounded-2xl border border-ink-200 bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AnalysisIcon className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div>
              <h2 className="text-[0.9rem] font-semibold text-ink-900">
                Researcher review workflow
              </h2>
              <p className="mt-0.5 max-w-xl text-[0.8rem] leading-6 text-ink-500">
                AI-generated codes and themes are suggestions. Confirm, edit or discard them before
                they are used in reporting.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => comingSoon('Merging themes')}>
              Merge themes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => comingSoon('Adding codes')}>
              Add code
            </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
