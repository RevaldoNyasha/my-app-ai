import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { ProjectCard } from '@/components/research/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { FolderIcon, PlusIcon, SearchIcon } from '@/components/ui/icons'
import { createProject, deleteProject, listProjects } from '@/services/projectService'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import type { ResearchProject } from '@/types/research'

const NAME_MAX_LENGTH = 200

export function Projects() {
  const { isAuthenticated, openLogin } = useAuth()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<ResearchProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Opened from the sidebar's "New Project" button via `/projects?new=1`.
  useEffect(() => {
    if (!searchParams.has('new')) return
    setSearchParams({}, { replace: true })
    if (isAuthenticated) setIsCreateOpen(true)
    else openLogin()
  }, [searchParams, setSearchParams, isAuthenticated, openLogin])

  useEffect(() => {
    let cancelled = false
    listProjects()
      .then((result) => {
        if (!cancelled) setProjects(result)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setProjects([])
        showToast({
          title: 'Could not load projects',
          description: error instanceof ApiError ? error.message : undefined,
        })
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, showToast])

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

  const closeCreate = () => {
    setIsCreateOpen(false)
    setCreateError(null)
  }

  const handleCreate = async (event?: FormEvent) => {
    event?.preventDefault()
    const name = draftName.trim()
    if (!name || isCreating) return

    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await createProject({
        name,
        description: draftDescription.trim() || undefined,
      })
      setProjects((previous) => [created, ...previous])
      setDraftName('')
      setDraftDescription('')
      setIsCreateOpen(false)
      showToast({ title: 'Project created', description: `${created.name} is ready for data.` })
    } catch (error) {
      setCreateError(
        error instanceof ApiError ? error.message : 'Could not create the project. Please try again.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const closeDelete = () => {
    if (!isDeleting) setProjectToDelete(null)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return
    const target = projectToDelete
    setIsDeleting(true)
    try {
      await deleteProject(target.id)
      setProjects((previous) => previous.filter((project) => project.id !== target.id))
      showToast({ title: 'Project deleted', description: `${target.name} was removed.` })
    } catch (error) {
      showToast({
        title: 'Could not delete project',
        description: error instanceof ApiError ? error.message : undefined,
      })
    } finally {
      setIsDeleting(false)
      setProjectToDelete(null)
    }
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
            <ProjectCard key={project.id} project={project} onDelete={setProjectToDelete} />
          ))}
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onClose={closeCreate}
        title="Create research project"
        description="Projects group your data, conversations and reports."
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={!draftName.trim() || isCreating}>
              {isCreating ? 'Creating…' : 'Create project'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(event) => void handleCreate(event)}>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Project name
            </span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={NAME_MAX_LENGTH}
              autoFocus
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

          {createError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[0.76rem] text-red-700">
              {createError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={projectToDelete !== null}
        onClose={closeDelete}
        title="Delete project?"
        description={
          projectToDelete
            ? `${projectToDelete.name} will be permanently deleted. This cannot be undone.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
              className="bg-red-600! text-white! hover:bg-red-700!"
            >
              {isDeleting ? 'Deleting…' : 'Delete project'}
            </Button>
          </>
        }
      >
        {projectToDelete ? (
          <p className="text-[0.85rem] leading-6 text-ink-600">
            All {projectToDelete.documentCount} uploaded{' '}
            {projectToDelete.documentCount === 1 ? 'file' : 'files'} in this project will be deleted
            along with it.
          </p>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
