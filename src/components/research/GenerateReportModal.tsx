import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SparkleIcon } from '@/components/ui/icons'
import { ApiError } from '@/lib/api'
import { listDocuments } from '@/services/documentService'
import { createReport } from '@/services/reportService'
import type { ReportTemplate, ResearchDocument, ResearchReport } from '@/types/research'

interface GenerateReportModalProps {
  open: boolean
  projectId: string
  templates: ReportTemplate[]
  onClose: () => void
  onCreated: (report: ResearchReport) => void
}

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-surface px-3 text-[0.84rem] text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400'

/** Pick a template, a title and the documents, then start generating. */
export function GenerateReportModal({
  open,
  projectId,
  templates,
  onClose,
  onCreated,
}: GenerateReportModalProps) {
  const [type, setType] = useState(templates[0]?.type ?? 'thematic_analysis')
  const [title, setTitle] = useState('')
  const [customSections, setCustomSections] = useState('')
  const [documents, setDocuments] = useState<ResearchDocument[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const template = templates.find((item) => item.type === type) ?? templates[0]
  const headings = useMemo(
    () =>
      customSections
        .split('\n')
        .map((line) => line.replace(/^#+\s*/, '').trim())
        .filter(Boolean),
    [customSections],
  )

  // Fresh form each time it opens; every processed document is included by default.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(null)
    setDocuments(null)
    listDocuments(projectId)
      .then((result) => {
        if (cancelled) return
        const processed = result.filter((document) => document.status === 'processed')
        setDocuments(processed)
        setSelected(new Set(processed.map((document) => document.id)))
      })
      .catch(() => {
        if (!cancelled) setDocuments([])
      })
    return () => {
      cancelled = true
    }
  }, [open, projectId])

  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const canSubmit =
    !!template &&
    !submitting &&
    selected.size > 0 &&
    (!template.customSections || headings.length > 0)

  const submit = async () => {
    if (!template || !canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const allSelected = documents !== null && selected.size === documents.length
      const report = await createReport(projectId, {
        type: template.type,
        title: title.trim() || undefined,
        sections: template.customSections ? headings : undefined,
        documentIds: allSelected ? undefined : [...selected],
      })
      onCreated(report)
      setTitle('')
      setCustomSections('')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not start the report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      title="Generate a report"
      description="The report is written from this project's processed documents."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            <SparkleIcon className="size-4" />
            {submitting ? 'Starting…' : 'Generate'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-[0.78rem] font-medium text-ink-700">Report type</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((item) => {
              const active = item.type === type
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  aria-pressed={active}
                  className={[
                    'rounded-xl border px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
                  ].join(' ')}
                >
                  <span className="block text-[0.82rem] font-semibold text-ink-900">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[0.72rem] leading-5 text-ink-500">
                    {item.description}
                  </span>
                </button>
              )
            })}
          </div>
          {template && !template.customSections ? (
            <p className="mt-2 text-[0.72rem] leading-5 text-ink-500">
              <span className="font-medium text-ink-600">Sections:</span>{' '}
              {template.sections.join(' · ')}
            </p>
          ) : null}
        </fieldset>

        {template?.customSections ? (
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
              Section headings <span className="font-normal text-ink-400">(one per line)</span>
            </span>
            <textarea
              value={customSections}
              onChange={(event) => setCustomSections(event.target.value)}
              rows={4}
              placeholder={'Background\nKey findings\nRecommendations'}
              className={`${inputClass} py-2 leading-6`}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-[0.78rem] font-medium text-ink-700">
            Title <span className="font-normal text-ink-400">(optional)</span>
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder={template ? `Project name — ${template.label}` : ''}
            className={`${inputClass} h-10`}
          />
        </label>

        <fieldset>
          <legend className="mb-1.5 text-[0.78rem] font-medium text-ink-700">
            Documents{' '}
            {documents && documents.length > 0 ? (
              <span className="font-normal text-ink-400">
                ({selected.size} of {documents.length})
              </span>
            ) : null}
          </legend>
          {documents === null ? (
            <p className="text-[0.78rem] text-ink-400">Loading documents…</p>
          ) : documents.length === 0 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[0.78rem] text-amber-800">
              No processed documents yet. Upload files on the Data tab and wait until they show
              as Processed.
            </p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-ink-100 p-2">
              {documents.map((document) => (
                <label
                  key={document.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-[0.8rem] text-ink-700 hover:bg-ink-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(document.id)}
                    onChange={() => toggle(document.id)}
                    className="accent-brand-600"
                  />
                  <span className="truncate">{document.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[0.78rem] text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
