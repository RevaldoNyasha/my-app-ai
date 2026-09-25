import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer, SectionHeading } from '@/components/layout/PageContainer'
import { useProjectContext } from '@/hooks/useProjectContext'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/research/DataTable'
import {
  AnalysisIcon,
  ArrowRightIcon,
  ChatIcon,
  DatabaseIcon,
  ReportIcon,
  SparkleIcon,
} from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/format'
import { useAuth } from '@/auth/AuthContext'
import { listConversations, listReports, listThemes } from '@/services/researchService'
import { listDocuments } from '@/services/documentService'
import type {
  Conversation,
  ResearchDocument,
  ResearchReport,
  ResearchTheme,
} from '@/types/research'

export function ProjectOverview() {
  const { project } = useProjectContext()
  const { isAuthenticated } = useAuth()
  const [themes, setThemes] = useState<ResearchTheme[]>([])
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      listThemes(project.id),
      listDocuments(project.id).catch(() => []),
      listReports(project.id),
      listConversations(project.id),
    ]).then(([themesResult, documentsResult, reportsResult, conversationsResult]) => {
      if (cancelled) return
      setThemes(themesResult)
      setDocuments(documentsResult)
      setReports(reportsResult)
      setConversations(conversationsResult)
    })

    return () => {
      cancelled = true
    }
  }, [project.id, isAuthenticated])

  const quickActions = [
    {
      to: `/projects/${project.id}/chat`,
      label: 'Ask the research assistant',
      description: 'Question this project’s data and trace answers to evidence.',
      icon: ChatIcon,
    },
    {
      to: `/projects/${project.id}/data`,
      label: 'Manage research data',
      description: 'Upload transcripts, recordings and datasets.',
      icon: DatabaseIcon,
    },
    {
      to: `/projects/${project.id}/analysis`,
      label: 'Review themes and codes',
      description: 'Inspect AI-generated themes and their supporting excerpts.',
      icon: AnalysisIcon,
    },
    {
      to: `/projects/${project.id}/reports`,
      label: 'Generate reports',
      description: 'Export thematic analyses and evidence summaries.',
      icon: ReportIcon,
    },
  ]

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
            <h2 className="font-serif text-[1.1rem] font-semibold tracking-tight text-ink-900">
              About this project
            </h2>
            <p className="mt-2 text-[0.88rem] leading-7 text-ink-600">
              {project.description || 'New research project. Upload data to begin analysis.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.themes.map((theme) => (
                <Badge key={theme} tone="brand">
                  {theme}
                </Badge>
              ))}
            </div>

            <Link
              to={`/projects/${project.id}/chat`}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-ink-100 px-4 text-[0.84rem] font-medium text-ink-800 transition-colors hover:bg-ink-200"
            >
              <SparkleIcon className="size-4" />
              Start new analysis
            </Link>
          </section>

          <section>
            <SectionHeading
              title="Themes in this project"
              action={
                <Link
                  to={`/projects/${project.id}/analysis`}
                  className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-brand-600 hover:text-brand-700"
                >
                  Open analysis
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              }
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="rounded-2xl border border-ink-200 bg-surface px-4 py-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.86rem] font-semibold text-ink-900">
                      {theme.name}
                    </p>
                    <span className="shrink-0 text-[0.7rem] tabular-nums text-ink-400">
                      {Math.round(theme.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[0.74rem] text-ink-500">
                    {theme.excerptCount} excerpts · {theme.participantCount} participants
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${Math.round(theme.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              title="Recent data"
              action={
                <Link
                  to={`/projects/${project.id}/data`}
                  className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-brand-600 hover:text-brand-700"
                >
                  All data
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              }
            />
            <DataTable documents={documents.slice(0, 4)} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-200 bg-surface p-5">
            <h2 className="text-[0.92rem] font-semibold tracking-tight text-ink-900">
              Data snapshot
            </h2>
            <dl className="mt-3 space-y-2.5">
              {[
                { label: 'Documents', value: project.documentCount },
                { label: 'Interviews', value: project.interviewCount },
                { label: 'Focus groups', value: project.focusGroupCount },
                { label: 'Participants', value: project.participantCount },
                { label: 'Reports', value: reports.length },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[0.84rem]">
                  <dt className="text-ink-500">{item.label}</dt>
                  <dd className="font-semibold tabular-nums text-ink-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <SectionHeading title="Quick actions" />
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <action.icon className="mt-0.5 size-4 shrink-0 text-ink-300" />
                  <span className="min-w-0">
                    <span className="block text-[0.84rem] font-medium text-ink-800">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-[0.74rem] leading-5 text-ink-500">
                      {action.description}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {conversations.length > 0 ? (
            <section>
              <SectionHeading title="Conversations" />
              <div className="space-y-1.5">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    to={`/projects/${project.id}/chat?conversation=${conversation.id}`}
                    className="flex items-center gap-3 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 transition-colors hover:border-brand-300"
                  >
                    <ChatIcon className="size-4 shrink-0 text-ink-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.82rem] font-medium text-ink-800">
                        {conversation.title}
                      </span>
                      <span className="text-[0.7rem] text-ink-400">
                        {formatRelativeTime(conversation.updatedAt)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
