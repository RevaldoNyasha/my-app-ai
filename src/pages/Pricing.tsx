import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero, Reveal } from '@/components/landing/MarketingLayout'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon } from '@/components/ui/icons'
import { BILLING_INTERVALS, formatLimit, formatPrice, formatSeats } from '@/lib/billing'
import { listBillingPlans } from '@/services/billingService'
import type { BillingInterval, BillingPlan } from '@/types/billing'

const COMPARISON_ROWS: { label: string; value: (plan: BillingPlan) => string }[] = [
  { label: 'Documents per month', value: (plan) => formatLimit(plan.limits.documents) },
  { label: 'AI research queries', value: (plan) => formatLimit(plan.limits.queries) },
  { label: 'Researcher seats', value: (plan) => formatSeats(plan.limits.seats).replace(/ seats?$/, '') },
]

const FAQS = [
  {
    question: 'Can I start for free?',
    answer:
      'Yes. The Student plan is free and includes thematic analysis, coding and evidence-linked chat — enough to run coursework or a pilot study end to end.',
  },
  {
    question: 'What counts as a document?',
    answer:
      'Any single source you upload for analysis: an interview transcript, a focus-group recording, a survey export or a field-notes file. Re-analysing a document you already uploaded does not count again.',
  },
  {
    question: 'How does annual billing work?',
    answer:
      'Annual billing is charged once a year and works out to two months free on the Researcher and Team plans. You can switch between monthly and annual billing from your subscription settings.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Any time. Upgrades take effect immediately; downgrades apply at the end of your current billing period so you keep what you have paid for.',
  },
  {
    question: 'Do you offer discounts for African institutions and NGOs?',
    answer:
      'The Institution plan is priced around your organisation. Get in touch and we will put together a quote that reflects your research programme and budget.',
  },
]

function PlanCard({ plan, interval }: { plan: BillingPlan; interval: BillingInterval }) {
  const price = formatPrice(plan, interval)
  const isCustom = plan.monthlyPrice === null
  const isFree = plan.monthlyPrice === 0

  return (
    <div
      className={[
        'relative flex h-full flex-col rounded-2xl border p-6 transition-colors duration-300',
        plan.highlight
          ? 'border-white/25 bg-white/[0.05] shadow-[0_0_48px_-16px_rgba(255,255,255,0.28)]'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
      ].join(' ')}
    >
      {plan.highlight ? (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#060707]">
          Most popular
        </span>
      ) : null}

      <p className="text-[1rem] font-semibold text-white">{plan.name}</p>
      <p className="mt-1.5 min-h-10 text-[0.82rem] leading-5 text-slate-400">{plan.tagline}</p>

      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="text-[2.4rem] font-bold leading-none tracking-tight text-white">
          {price.amount}
        </span>
        {price.amount.startsWith('$') ? (
          <span className="text-[0.84rem] text-slate-400">/ month</span>
        ) : null}
      </p>
      <p className="mt-2 min-h-5 text-[0.76rem] text-slate-500">{price.note ?? ''}</p>

      <Link
        to={isCustom ? '/contact' : '/projects'}
        className={[
          'group mt-6 inline-flex h-10.5 items-center justify-center gap-2 rounded-xl px-4 text-[0.9rem] font-semibold transition-all duration-200',
          plan.highlight
            ? 'border border-white/40 text-white hover:-translate-y-px hover:border-white/60'
            : 'border border-white/[0.12] text-white hover:border-white/25',
        ].join(' ')}
      >
        {isCustom ? 'Contact sales' : isFree ? 'Start for free' : `Choose ${plan.name}`}
        <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>

      <ul className="mt-7 flex-1 space-y-3 border-t border-white/[0.06] pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[0.84rem] leading-5 text-slate-300">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-white/60" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IntervalToggle({
  value,
  onChange,
}: {
  value: BillingInterval
  onChange: (value: BillingInterval) => void
}) {
  return (
    <div className="mt-9 inline-flex items-center gap-1 rounded-xl border border-white/[0.08] p-1">
      {BILLING_INTERVALS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={[
            'inline-flex items-center gap-2 rounded-[0.6rem] border px-4 py-2 text-[0.86rem] font-medium transition-colors',
            value === option.value
              ? 'border-white/30 text-white'
              : 'border-transparent text-slate-400 hover:text-white',
          ].join(' ')}
        >
          {option.label}
          {option.value === 'annual' ? (
            <span
              className={[
                'rounded-full border px-1.5 py-px text-[0.66rem] font-semibold',
                value === 'annual' ? 'border-white/30 text-white' : 'border-white/15 text-slate-300',
              ].join(' ')}
            >
              2 months free
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

export function PricingPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [interval, setBillingInterval] = useState<BillingInterval>('monthly')

  useEffect(() => {
    let cancelled = false
    listBillingPlans().then((result) => {
      if (!cancelled) setPlans(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Pricing"
        title="Simple pricing for"
        highlight="every kind of study."
        description="Start free for coursework and pilots, then scale up as your research grows. Prices in USD."
      >
        <IntervalToggle value={interval} onChange={setBillingInterval} />
      </PageHero>

      <section className="relative" aria-label="Plans">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          {plans.length === 0 ? (
            <p className="py-16 text-center text-[0.88rem] text-slate-500">Loading plans…</p>
          ) : (
            <div className="grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 0.07}>
                  <PlanCard plan={plan} interval={interval} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {plans.length > 0 ? (
        <section className="relative border-t border-white/[0.05]" aria-label="Compare plans">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
            <SectionHeading eyebrow="Compare" title="Plan limits at a glance" />
            <Reveal className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.07]">
              <table className="w-full min-w-[36rem] text-left text-[0.86rem]">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                    <th scope="col" className="px-5 py-4 font-medium text-slate-400">
                      <span className="sr-only">Limit</span>
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} scope="col" className="px-5 py-4 font-semibold text-white">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-white/[0.05] last:border-b-0">
                      <th scope="row" className="px-5 py-4 font-medium text-slate-400">
                        {row.label}
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-5 py-4 tabular-nums text-slate-200">
                          {row.value(plan)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="relative border-t border-white/[0.05]" aria-label="Frequently asked questions">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <SectionHeading eyebrow="FAQ" title="Questions about pricing" />
          <div className="mt-10 space-y-3">
            {FAQS.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.05}>
                <details className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 transition-colors open:border-white/15 open:bg-white/[0.035]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-medium text-white [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDownIcon className="size-4.5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-[0.88rem] leading-6 text-slate-400">{faq.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingLayout>
  )
}
