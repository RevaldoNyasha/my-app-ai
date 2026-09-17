import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer, SectionHeading } from '@/components/layout/PageContainer'
import { ProjectCard } from '@/components/research/ProjectCard'
import { ArrowRightIcon, ChatIcon, SparkleIcon } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/format'
import { getDashboardStats, listConversations, listProjects } from '@/services/researchService'
import type { Conversation, DashboardStats, ResearchProject } from '@/types/research'

const EMPTY_STATS: DashboardStats = { projects: 0, documents: 0, themes: 0, excerpts: 0 }

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([getDashboardStats(), listProjects(), listConversations()]).then(
      ([statsResult, projectsResult, conversationsResult]) => {
        if (cancelled) return
        setStats(statsResult)
        setProjects(projectsResult)
        setConversations(conversationsResult)
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  const statCards = [
    { label: 'Research Projects', value: stats.projects },
    { label: 'Research Documents', value: stats.documents },
    { label: 'Themes Identified', value: stats.themes },
    { label: 'Evidence Excerpts', value: stats.excerpts },
  ]

  return (
    <PageContainer>
      <section className="relative overflow-hidden rounded-2xl border border-ink-200 bg-surface p-6 sm:p-8">
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brand-600">
            <SparkleIcon className="size-3.5" />
            ResearchMind AI
          </p>
          <h1 className="mt-3 font-serif text-[1.75rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2rem]">
            Welcome back
          </h1>
          <p className="mt-2 text-[0.92rem] leading-7 text-ink-500">
            Continue analysing your research. Ask questions, discover themes, compare participants
            and trace every finding back to its evidence.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              to="/projects/healthcare-access/chat"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <SparkleIcon className="size-4" />
              Start New Analysis
            </Link>
            <Link
              to="/projects"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-200 px-5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              Browse research projects
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-ink-200 bg-surface px-4 py-4 sm:px-5"
          >
            <p className="font-serif text-[1.75rem] font-semibold tabular-nums leading-none tracking-tight text-ink-900">
              {isLoading ? '—' : card.value}
            </p>
            <p className="mt-2 text-[0.76rem] leading-5 text-ink-500">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <SectionHeading
          title="Recent Research"
          action={
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-brand-600 hover:text-brand-700"
            >
              View all
              <ArrowRightIcon className="size-3.5" />
            </Link>
          }
        />
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading
          title="Recent Analysis"
          action={
            <Link
              to="/projects/healthcare-access/chat?new=1"
              className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-brand-600 hover:text-brand-700"
            >
              New conversation
              <ArrowRightIcon className="size-3.5" />
            </Link>
          }
        />
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-surface">
          {conversations.map((conversation) => {
            const project = projects.find((item) => item.id === conversation.projectId)

            return (
              <Link
                key={conversation.id}
                to={`/projects/${conversation.projectId}/chat?conversation=${conversation.id}`}
                className="flex items-center gap-3.5 border-b border-ink-100/80 px-4 py-3.5 transition-colors last:border-0 hover:bg-canvas/60"
              >
                <ChatIcon className="size-4 shrink-0 text-ink-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-medium text-ink-800">
                    {conversation.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.76rem] text-ink-500">
                    {project?.name} · {conversation.preview}
                  </span>
                </span>
                <span className="shrink-0 text-[0.72rem] text-ink-400">
                  {formatRelativeTime(conversation.updatedAt)}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-[1.05rem] font-semibold tracking-tight text-ink-900">
              Your AI research assistant
            </h2>
            <p className="mt-1 max-w-xl text-[0.84rem] leading-6 text-ink-500">
              Analyse interviews, discover themes, compare participants, and find evidence across
              your research.
            </p>
          </div>
          <Link
            to="/projects/healthcare-access/chat"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <SparkleIcon className="size-4" />
            Ask ResearchMind
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}
