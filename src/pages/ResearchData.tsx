import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { PageContainer, PageHeading } from '@/components/layout/PageContainer'
import { DataTable } from '@/components/research/DataTable'
import { SummaryModal } from '@/components/research/SummaryModal'
import { TranscriptModal } from '@/components/research/TranscriptModal'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SearchIcon, UploadIcon } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'
import { documentFormat, parseTimestamp } from '@/lib/format'
import {
  deleteDocument,
  listDocuments,
  reprocessDocument,
  uploadDocuments,
} from '@/services/documentService'
import { listProjects } from '@/services/projectService'
import type { ProjectOutletContext } from '@/hooks/useProjectContext'
import type { ResearchDocument, ResearchProject } from '@/types/research'

// Must match the backend's accepted extensions (app/utils/file_validation.py).
const ACCEPTED_EXTENSIONS = [
  'PDF',
  'DOCX',
  'TXT',
  'CSV',
  'MP3',
  'WAV',
  'M4A',
  'OGG',
  'FLAC',
  'WMA',
  'MP4',
  'MOV',
  'WEBM',
]
const POLL_INTERVAL_MS = 3000

/** Lowercase letters and digits only, so "Focus Group 02" finds "FocusGroup_02.mp3". */
const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

interface ResearchDataPageProps {
  projectId?: string
}

interface UploadResult {
  key: string
  name: string
  /** Error message when the server rejected the file. */
  error?: string
}

export function ResearchDataPage({ projectId }: ResearchDataPageProps) {
  const { showToast } = useToast()
  const { isAuthenticated, openLogin } = useAuth()
  // Present when rendered inside a project; used to refresh its header counters.
  const projectContext = useOutletContext<ProjectOutletContext | undefined>()
  const refreshProject = projectContext?.refreshProject
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [extensionFilter, setExtensionFilter] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [documentToDelete, setDocumentToDelete] = useState<ResearchDocument | null>(null)
  const [summaryDocument, setSummaryDocument] = useState<ResearchDocument | null>(null)
  const [transcriptDocument, setTranscriptDocument] = useState<ResearchDocument | null>(null)
  const [transcriptFocus, setTranscriptFocus] = useState<number | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      listDocuments(projectId).catch((error: unknown) => {
        showToast({
          title: 'Could not load research data',
          description: error instanceof ApiError ? error.message : undefined,
        })
        return []
      }),
      listProjects().catch(() => []),
    ]).then(([documentsResult, projectsResult]) => {
      if (cancelled) return
      setDocuments(documentsResult)
      setProjects(projectsResult)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [projectId, isAuthenticated, showToast])

  // Arriving from a quote's "Open source": show that file, and for a recording open its
  // transcript at the quoted moment. The link is consumed so a refresh doesn't repeat it.
  useEffect(() => {
    if (isLoading) return
    const documentId = searchParams.get('document')
    const search = searchParams.get('q')
    if (!documentId && !search) return

    setSearchParams({}, { replace: true })
    setExtensionFilter(null)

    if (!documentId) {
      setQuery(search ?? '')
      return
    }
    const target = documents.find((document) => document.id === documentId)
    if (!target) {
      showToast({ title: 'Source file not found', description: 'It may have been deleted.' })
      return
    }
    setQuery(target.name)
    const format = documentFormat(target)
    if ((format === 'Audio' || format === 'Video') && target.status === 'processed') {
      setTranscriptFocus(parseTimestamp(searchParams.get('t')))
      setTranscriptDocument(target)
    }
  }, [isLoading, documents, searchParams, setSearchParams, showToast])

  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const compacted = compact(normalized)
    return documents.filter((document) => {
      const matchesQuery =
        !normalized ||
        document.name.toLowerCase().includes(normalized) ||
        (compacted !== '' && compact(document.name).includes(compacted)) ||
        documentFormat(document).toLowerCase().includes(normalized)
      const matchesExtension = !extensionFilter || document.extension === extensionFilter
      return matchesQuery && matchesExtension
    })
  }, [documents, query, extensionFilter])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || isUploading) return

    if (!isAuthenticated) {
      openLogin()
      return
    }
    if (!projectId) {
      showToast({ title: 'Open a project to upload data' })
      return
    }

    setIsUploading(true)
    // One request per file, so each file gets its own accept/reject reason.
    const settled = await Promise.allSettled(
      files.map((file) => uploadDocuments(projectId, [file])),
    )

    const created: ResearchDocument[] = []
    const results: UploadResult[] = settled.map((outcome, index) => {
      const key = `${Date.now()}-${index}`
      if (outcome.status === 'fulfilled') {
        created.push(...outcome.value)
        return { key, name: files[index].name }
      }
      const reason = outcome.reason
      return {
        key,
        name: files[index].name,
        error: reason instanceof ApiError ? reason.message : 'Upload failed',
      }
    })

    if (created.length > 0) {
      setDocuments((previous) => [...created, ...previous])
      projectContext?.refreshProject()
    }
    setUploadResults((previous) => [...results, ...previous])
    setIsUploading(false)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void handleFiles(Array.from(event.dataTransfer.files))
  }

  const closeDelete = () => {
    if (!isDeleting) setDocumentToDelete(null)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return
    const target = documentToDelete
    setIsDeleting(true)
    try {
      await deleteDocument(target.projectId, target.id)
      setDocuments((previous) => previous.filter((document) => document.id !== target.id))
      projectContext?.refreshProject()
      showToast({ title: 'File deleted', description: `${target.name} was removed.` })
    } catch (error) {
      showToast({
        title: 'Could not delete file',
        description: error instanceof ApiError ? error.message : undefined,
      })
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  const handleRetry = async (document: ResearchDocument) => {
    try {
      const updated = await reprocessDocument(document.projectId, document.id)
      setDocuments((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
      showToast({
        title: 'Retrying processing',
        description: `${document.name} is being processed again.`,
      })
    } catch (error) {
      showToast({
        title: 'Could not retry',
        description: error instanceof ApiError ? error.message : undefined,
      })
    }
  }

  // Refresh while anything is being processed or transcribed (progress shows live).
  const isAwaitingProcessing = documents.some((document) => document.status === 'processing')

  const documentsRef = useRef(documents)
  useEffect(() => {
    documentsRef.current = documents
  }, [documents])

  useEffect(() => {
    if (!isAwaitingProcessing || !projectId) return
    const timer = window.setInterval(() => {
      listDocuments(projectId)
        .then((latest) => {
          // Announce documents that just finished, then take the server's list.
          for (const document of latest) {
            const before = documentsRef.current.find((item) => item.id === document.id)
            if (before?.status !== 'processing' || document.status === 'processing') continue
            showToast(
              document.status === 'processed'
                ? { title: 'Processing complete', description: `${document.name} is ready.` }
                : {
                    title: 'Processing failed',
                    description: `${document.name}: ${document.processingError ?? 'unknown error'}`,
                  },
            )
          }
          setDocuments(latest)
          refreshProject?.()
        })
        .catch(() => undefined)
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isAwaitingProcessing, projectId, showToast, refreshProject])

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
            placeholder="Search files or type..."
            aria-label="Search research data"
            className="h-10 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-[0.86rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400"
          />
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
        onSummary={setSummaryDocument}
        onTranscript={setTranscriptDocument}
      />

      <SummaryModal document={summaryDocument} onClose={() => setSummaryDocument(null)} />
      <TranscriptModal
        document={transcriptDocument}
        focusAt={transcriptFocus}
        onClose={() => {
          setTranscriptDocument(null)
          setTranscriptFocus(null)
        }}
      />

      <Modal
        open={documentToDelete !== null}
        onClose={closeDelete}
        title="Delete file?"
        description={
          documentToDelete
            ? `${documentToDelete.name} will be permanently removed from your research data. This cannot be undone.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={() => void confirmDelete()} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
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
        description={`Supported formats: ${ACCEPTED_EXTENSIONS.slice(0, -1).join(', ')} and ${ACCEPTED_EXTENSIONS.at(-1)}.`}
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
            accept={ACCEPTED_EXTENSIONS.map((extension) => `.${extension.toLowerCase()}`).join(',')}
            className="hidden"
            onChange={(event) => {
              void handleFiles(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </label>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {ACCEPTED_EXTENSIONS.map((extension) => (
            <div
              key={extension}
              className="rounded-xl border border-ink-100 bg-surface py-2 text-center text-[0.68rem] font-semibold text-ink-500"
            >
              {extension}
            </div>
          ))}
        </div>

        {uploadResults.length > 0 ? (
          <div className="mt-4 rounded-xl border border-ink-100 bg-canvas px-3 py-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-400">
              Uploaded in this session
            </p>
            <ul className="mt-2 space-y-1.5">
              {uploadResults.map((result) => (
                <li key={result.key} className="flex items-start gap-2 text-[0.78rem]">
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      result.error ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-ink-700">{result.name}</span>
                    <span
                      className={`block text-[0.72rem] ${result.error ? 'text-red-600' : 'text-ink-400'}`}
                    >
                      {result.error ?? 'Stored — queued for processing'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
