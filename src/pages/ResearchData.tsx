import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/research/DataTable'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FilterIcon, SearchIcon, UploadIcon } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/auth/AuthContext'
import { listDocuments, listProjects, uploadDocuments } from '@/services/researchService'
import type { ResearchDocument, ResearchProject } from '@/types/research'

const ACCEPTED_EXTENSIONS = ['PDF', 'DOCX', 'CSV', 'MP3', 'WAV', 'MP4']
const TYPE_FILTERS = ['All', 'Interview', 'Focus Group', 'Survey', 'Research Notes'] as const

interface ResearchDataPageProps {
  projectId?: string
}

export function ResearchDataPage({ projectId }: ResearchDataPageProps) {
  const { showToast } = useToast()
  const { isAuthenticated, usageCount, recordUsage, openLogin } = useAuth()
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('All')
  const [extensionFilter, setExtensionFilter] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedNames, setUploadedNames] = useState<string[]>([])
  const [documentToDelete, setDocumentToDelete] = useState<ResearchDocument | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([listDocuments(projectId), listProjects()]).then(
      ([documentsResult, projectsResult]) => {
        if (cancelled) return
        setDocuments(documentsResult)
        setProjects(projectsResult)
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [projectId, isAuthenticated])

  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return documents.filter((document) => {
      const matchesQuery =
        !normalized ||
        document.name.toLowerCase().includes(normalized) ||
        document.type.toLowerCase().includes(normalized)
      const matchesType = typeFilter === 'All' || document.type === typeFilter
      const matchesExtension = !extensionFilter || document.extension === extensionFilter
      return matchesQuery && matchesType && matchesExtension
    })
  }, [documents, query, typeFilter, extensionFilter])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    if (!isAuthenticated && usageCount >= 1) {
      openLogin()
      return
    }
    recordUsage()

    setIsUploading(true)
    const targetProject = projectId ?? projects[0]?.id ?? 'healthcare-access'
    const created = await uploadDocuments(
      targetProject,
      files.map((file) => ({ name: file.name, size: file.size })),
    )

    setDocuments((previous) => [...created, ...previous])
    setUploadedNames(created.map((document) => document.name))
    setIsUploading(false)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void handleFiles(Array.from(event.dataTransfer.files))
  }

  const confirmDelete = () => {
    if (!documentToDelete) return
    setDocuments((previous) => previous.filter((document) => document.id !== documentToDelete.id))
    setDocumentToDelete(null)
    showToast({ title: 'File deleted', description: `${documentToDelete.name} was removed.` })
  }

  const handleRetry = (document: ResearchDocument) => {
    setDocuments((previous) =>
      previous.map((item) => (item.id === document.id ? { ...item, status: 'processing' } : item)),
    )
    showToast({ title: 'Retrying processing', description: `${document.name} is being processed again.` })
    window.setTimeout(() => {
      setDocuments((previous) =>
        previous.map((item) => (item.id === document.id ? { ...item, status: 'processed' } : item)),
      )
      showToast({ title: 'Processing complete', description: `${document.name} was processed successfully.` })
    }, 2200)
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow={projectId ? 'Project data' : 'All research data'}
        title="Research Data"
        description="Upload and manage the transcripts, recordings, documents and datasets that ResearchMind analyses."
        actions={
          <Button onClick={() => setIsUploadOpen(true)}>
            <UploadIcon className="size-4" />
            Upload Data
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2.5">
        <div className="relative min-w-[14rem] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files, participants or type..."
            aria-label="Search research data"
            className="h-10 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
          />
        </div>

        <div className="flex h-10 items-center gap-1.5 rounded-xl border border-ink-200 bg-surface px-2">
          <FilterIcon className="size-4 text-ink-400" />
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={[
                'rounded-lg px-2.5 py-1 text-[0.76rem] font-medium transition-colors',
                typeFilter === filter
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
              ].join(' ')}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.78rem] text-ink-500">
          {isLoading ? 'Loading…' : `${filtered.length} of ${documents.length} files`}
        </p>
        <div className="flex items-center gap-1.5">
          {ACCEPTED_EXTENSIONS.map((extension) => (
            <button
              key={extension}
              type="button"
              onClick={() =>
                setExtensionFilter((current) => (current === extension ? null : extension))
              }
              aria-pressed={extensionFilter === extension}
              className={[
                'rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium tracking-wide transition-colors',
                extensionFilter === extension
                  ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300'
                  : 'border-ink-200 text-ink-600 hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700',
              ].join(' ')}
            >
              {extension}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        documents={filtered}
        showProjectColumn={!projectId}
        projectNames={projectNames}
        onDelete={(document) => setDocumentToDelete(document)}
        onRetry={handleRetry}
      />

      <Modal
        open={documentToDelete !== null}
        onClose={() => setDocumentToDelete(null)}
        title="Delete file?"
        description={
          documentToDelete
            ? `${documentToDelete.name} will be permanently removed from your research data. This cannot be undone.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDocumentToDelete(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-[0.85rem] leading-6 text-ink-600">
          Any analysis or evidence that references this file will keep working with the data that
          remains in your project.
        </p>
      </Modal>

      <Modal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload research data"
        description="Supported formats: PDF, DOCX, CSV, MP3, WAV and MP4."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setIsUploadOpen(false)}>Done</Button>
          </>
        }
      >
        <label
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            isDragging
              ? 'border-brand-400 bg-brand-50/60'
              : 'border-ink-200 bg-canvas hover:border-brand-300 hover:bg-brand-50/40',
          ].join(' ')}
        >
          <UploadIcon className="size-5 text-ink-300" />
          <span className="mt-3 text-[0.88rem] font-medium text-ink-800">
            {isUploading ? 'Uploading…' : 'Drop files here or click to browse'}
          </span>
          <span className="mt-1 text-[0.76rem] text-ink-500">
            Transcripts, audio, video, documents and survey data
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.mp3,.wav,.mp4"
            className="hidden"
            onChange={(event) => {
              void handleFiles(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </label>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ACCEPTED_EXTENSIONS.map((extension) => (
            <div
              key={extension}
              className="rounded-xl border border-ink-100 bg-surface py-2 text-center text-[0.68rem] font-semibold text-ink-500"
            >
              {extension}
            </div>
          ))}
        </div>

        {uploadedNames.length > 0 ? (
          <div className="mt-4 rounded-xl border border-ink-100 bg-canvas px-3 py-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-400">
              Queued in this session
            </p>
            <ul className="mt-2 space-y-1">
              {uploadedNames.map((name) => (
                <li key={name} className="flex items-center gap-2 text-[0.78rem] text-ink-700">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.72rem] text-ink-400">
              Prototype only — files are not stored, transcribed or processed.
            </p>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
