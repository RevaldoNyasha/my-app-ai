import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer, PageHeading, SectionHeading } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ArrowRightIcon,
  CardIcon,
  CheckIcon,
  GlobeIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from '@/components/ui/icons'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { initials } from '@/lib/format'
import type { ThemePreference } from '@/context/theme'

const LANGUAGES = [
  { code: 'en', label: 'English', status: 'Supported' },
  { code: 'sn', label: 'Shona', status: 'Planned' },
  { code: 'nd', label: 'Ndebele', status: 'Planned' },
]

export function Settings() {
  const [autoTranscribe, setAutoTranscribe] = useState(true)
  const [autoTranslate, setAutoTranslate] = useState(false)
  const [showEvidence, setShowEvidence] = useState(true)
  const { preference, resolved, setPreference } = useTheme()
  const { comingSoon } = useToast()

  const themeOptions: { value: ThemePreference; label: string; description: string; icon: typeof SunIcon }[] = [
    { value: 'light', label: 'Light', description: 'Bright workspace', icon: SunIcon },
    { value: 'dark', label: 'Dark', description: 'Low-light workspace', icon: MoonIcon },
    { value: 'system', label: 'System', description: 'Match your device', icon: MonitorIcon },
  ]

  const toggles = [
    {
      label: 'Automatically transcribe uploads',
      description: 'Send audio and video data for transcription as soon as it is uploaded.',
      checked: autoTranscribe,
      onChange: setAutoTranscribe,
    },
    {
      label: 'Translate transcripts to English',
      description: 'Keep original text alongside an English working translation.',
      checked: autoTranslate,
      onChange: setAutoTranslate,
    },
    {
      label: 'Always show evidence citations',
      description: 'Attach source excerpts to every assistant answer.',
      checked: showEvidence,
      onChange: setShowEvidence,
    },
  ]

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Account"
        title="Settings"
        description="Manage your researcher profile, analysis defaults and language preferences."
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading title="Appearance" />
          <p className="mb-3 text-[0.78rem] text-ink-500">
            Currently using the <span className="font-medium text-ink-700">{resolved}</span> theme.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const isActive = preference === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreference(option.value)}
                  aria-pressed={isActive}
                  className={[
                    'flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                    isActive
                      ? 'border-brand-400 bg-brand-50/70'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50',
                  ].join(' ')}
                >
                  <option.icon
                    className={[
                      'size-4 shrink-0',
                      isActive ? 'text-brand-600' : 'text-ink-400',
                    ].join(' ')}
                  />
                  <span className="min-w-0">
                    <span className="block text-[0.84rem] font-medium text-ink-800">
                      {option.label}
                    </span>
                    <span className="block text-[0.72rem] text-ink-500">{option.description}</span>
                  </span>
                  {isActive ? <CheckIcon className="ml-auto size-4 text-brand-600" /> : null}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading title="Researcher profile" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-full bg-ink-800 text-sm font-semibold text-white dark:bg-ink-100 dark:text-ink-800">
                {initials('Dr. T. Moyo')}
              </div>
              <div>
                <p className="text-[0.92rem] font-semibold text-ink-900">Dr. T. Moyo</p>
                <p className="flex items-center gap-1.5 text-[0.78rem] text-ink-500">
                  <UserIcon className="size-3.5" />
                  Lead Researcher · Healthcare Access Study
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => comingSoon('Profile editing')}>
              Edit profile
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading title="Plan & billing" />
          <Link
            to="/subscription"
            className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 bg-canvas px-3.5 py-3 transition-colors hover:border-ink-300 hover:bg-ink-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CardIcon className="size-4 shrink-0 text-ink-400" />
              <span className="min-w-0">
                <span className="block text-[0.86rem] font-medium text-ink-800">Subscription</span>
                <span className="block text-[0.76rem] text-ink-500">
                  Review your plan, monthly usage and invoices.
                </span>
              </span>
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-ink-400" />
          </Link>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading title="Analysis defaults" />
          <div className="divide-y divide-ink-100">
            {toggles.map((toggle) => (
              <div
                key={toggle.label}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-[0.86rem] font-medium text-ink-800">{toggle.label}</p>
                  <p className="mt-0.5 text-[0.76rem] leading-5 text-ink-500">
                    {toggle.description}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggle.checked}
                  aria-label={toggle.label}
                  onClick={() => toggle.onChange(!toggle.checked)}
                  className={[
                    'relative mt-0.5 h-5.5 w-10 shrink-0 rounded-full transition-colors',
                    toggle.checked ? 'bg-brand-600' : 'bg-ink-200',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 flex size-4.5 items-center justify-center rounded-full bg-white shadow-sm transition-transform',
                      toggle.checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
                    ].join(' ')}
                  >
                    {toggle.checked ? (
                      <CheckIcon className="size-3 text-brand-700" />
                    ) : null}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading title="Research languages" />
          <p className="mb-3 flex items-center gap-1.5 text-[0.78rem] text-ink-500">
            <GlobeIcon className="size-3.5" />
            ResearchMind is designed for African research contexts.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {LANGUAGES.map((language) => (
              <div
                key={language.code}
                className="flex items-center justify-between rounded-xl border border-ink-100 bg-canvas px-3.5 py-3"
              >
                <span className="text-[0.84rem] font-medium text-ink-800">{language.label}</span>
                <Badge tone={language.status === 'Supported' ? 'success' : 'outline'}>
                  {language.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-ink-200 bg-surface/60 p-5">
          <p className="text-[0.8rem] leading-6 text-ink-500">
            This is a frontend prototype. Accounts, data storage and AI processing are not yet
            connected — all data shown is mock data held in the browser.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}
