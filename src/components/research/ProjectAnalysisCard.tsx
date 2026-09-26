import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { SparkleIcon } from '@/components/ui/icons'
import { ApiError } from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'
import { getAnalysis, requestAnalysis } from '@/services/analysisService'
import type { ProjectAnalysis } from '@/types/research'

const POLL_INTERVAL_MS = 2500

/**
 * The AI analysis of all of a project's processed documents: major themes,
 * common findings, differences, patterns, observations and conclusions.
 * Generation runs in the background; this card starts it and polls for progress.
 */
export function ProjectAnalysisCard({ projectId }: { projectId: string }) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAnalysis(projectId)
      .then((result) => {
        if (!cancelled) setAnalysis(result)
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof ApiError ? caught.message : 'Could not load')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const isRunning = analysis?.status === 'processing'
  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      getAnalysis(projectId)
        .then((result) => result && setAnalysis(result))
        .catch(() => undefined)
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isRunning, projectId])

  const start = useCallback(async () => {
    setError(null)
    try {
      setAnalysis(await requestAnalysis(projectId))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not start the analysis')
    }
  }, [projectId])

  return (
    <section className="mb-8 rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-ink-900">
            <SparkleIcon className="size-4 text-brand-600" />
            Project analysis
          </h2>
          <p className="mt-1 max-w-2xl text-[0.8rem] leading-6 text-ink-500">
            Major themes, common findings, differences and patterns across every processed
            document in this project, written by the local AI model.
          </p>
        </div>
        <Button onClick={() => void start()} disabled={isLoading || isRunning}>
          <SparkleIcon className="size-4" />
          {isRunning ? 'Analysing…' : analysis ? 'Re-run analysis' : 'Analyse project'}
        </Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <p className="text-[0.84rem] text-ink-500">Loading…</p>
        ) : error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[0.8rem] text-red-700">
            {error}
          </p>
        ) : !analysis ? (
          <p className="text-[0.84rem] leading-6 text-ink-600">
            No analysis yet. Run one once your documents show as <em>Processed</em> on the Data
            tab. It reads each document, then compares them; allow about 10–20 seconds per
            document.
          </p>
        ) : analysis.status === 'processing' ? (
          <div className="flex items-center gap-3 text-[0.84rem] text-ink-600">
            <span
              className="size-2 shrink-0 rounded-full bg-amber-500"
              style={{ animation: 'pulse-dot 1.4s ease-in-out infinite' }}
            />
            {analysis.progress ?? 'Analysing…'}
          </div>
        ) : analysis.status === 'failed' ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[0.8rem] text-red-700">
            {analysis.error ?? 'The analysis failed.'}
          </p>
        ) : (
          <>
            <div className="text-[0.86rem] leading-7 text-ink-700">
              <Markdown content={analysis.content ?? ''} />
            </div>
            <p className="mt-5 border-t border-ink-100 pt-3 text-[0.72rem] leading-5 text-ink-400">
              Based on {analysis.documents.length}{' '}
              {analysis.documents.length === 1 ? 'document' : 'documents'}:{' '}
              {analysis.documents.map((document) => document.name).join(', ')}
              {analysis.completedAt ? ` · ${formatRelativeTime(analysis.completedAt)}` : ''}
              {analysis.model ? ` · ${analysis.model}` : ''}. Re-run after adding documents. AI
              analysis can contain mistakes; check important points against the sources.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
