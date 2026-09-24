import { useEffect, useMemo, useState } from 'react'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { ProjectCard } from '@/components/research/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { FolderIcon, PlusIcon, SearchIcon } from '@/components/ui/icons'
import { listProjects } from '@/services/researchService'
import { useAuth } from '@/auth/AuthContext'
import type { ResearchProject } from '@/types/research'

export function Projects() {
  const { isAuthenticated, openLogin } = useAuth()
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  useEffect(() => {
    let cancelled = false
    listProjects().then((result) => {
      if (!cancelled) {
        setProjects(result)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(normalized) ||
        project.description.toLowerCase().includes(normalized),
    )
  }, [projects, query])

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      openLogin()
      return
    }
    setIsCreateOpen(true)
  }

  const handleCreate = () => {
    const name = draftName.trim()
    if (!name) return

    setProjects((previous) => [
      {
        id: `project-${Date.now()}`,
        name,
        description:
          draftDescription.trim() || 'New research project. Upload data to begin analysis.',
        documentCount: 0,
        participantCount: 0,
        interviewCount: 0,
        focusGroupCount: 0,
        themes: [],
        codes: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...previous,
    ])

    setDraftName('')
    setDraftDescription('')
    setIsCreateOpen(false)
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Workspace"
        title="Research Projects"
        description="Each project keeps its data, conversations, themes and reports together so the assistant always answers in the right context."
      />

      {isAuthenticated ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search research projects..."
              aria-label="Search research projects"
              className="h-10 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
            />
          </div>
          <span className="text-[0.78rem] text-ink-500">
            {isLoading ? 'Loading…' : `${filtered.length} projects`}
          </span>
        </div>
      ) : null}

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<FolderIcon className="size-5" />}
          title="No research projects found"
          description="Create a new research project to get started."
          action={
            <Button onClick={handleCreateClick}>
              <PlusIcon className="size-4" />
              Create Research Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create research project"
        description="Projects group your data, conversations and reports."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!draftName.trim()}>
              Create project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Project name
            </span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="e.g. Maternal Healthcare Study"
              className="h-10 w-full rounded-xl border border-ink-200 bg-surface px-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Description
            </span>
            <textarea
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              rows={3}
              placeholder="What is this research about?"
              className="w-full resize-none rounded-xl border border-ink-200 bg-surface px-3 py-2.5 text-[0.86rem] leading-6 text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
            />
          </label>

          <p className="rounded-xl bg-canvas px-3 py-2.5 text-[0.74rem] leading-5 text-ink-500">
            This is a prototype — projects are stored locally and reset when you reload the page.
          </p>
        </div>
      </Modal>
    </PageContainer>
  )
}
