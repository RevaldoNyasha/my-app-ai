import { useEffect, useState } from 'react'
import { PageContainer, PageHeading, SectionHeading } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CardIcon, CheckIcon, DownloadIcon, SparkleIcon } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
import { BILLING_INTERVALS, formatCount, formatPrice, planLimitsSummary } from '@/lib/billing'
import { formatDate } from '@/lib/format'
import { getSubscription, listBillingPlans, listInvoices } from '@/services/billingService'
import type {
  BillingInterval,
  BillingPlan,
  Invoice,
  Subscription,
  SubscriptionStatus,
  SubscriptionUsage,
} from '@/types/billing'

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment due',
  cancelled: 'Cancelled',
}

const STATUS_TONES: Record<SubscriptionStatus, 'success' | 'brand' | 'warning' | 'neutral'> = {
  active: 'success',
  trialing: 'brand',
  past_due: 'warning',
  cancelled: 'neutral',
}

const INVOICE_TONES: Record<Invoice['status'], 'success' | 'warning' | 'neutral'> = {
  paid: 'success',
  open: 'warning',
  refunded: 'neutral',
}

function formatUsageValue(value: number, unit: string): string {
  return unit ? `${value} ${unit}` : formatCount(value)
}

function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

function UsageBar({ usage }: { usage: SubscriptionUsage }) {
  const isUnlimited = usage.limit === -1

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.82rem] font-medium text-ink-800">{usage.label}</p>
        <p className="text-[0.76rem] tabular-nums text-ink-500">
          {formatUsageValue(usage.used, usage.unit)}
          <span className="text-ink-400">
            {' / '}
            {isUnlimited ? 'Unlimited' : formatUsageValue(usage.limit, usage.unit)}
          </span>
        </p>
      </div>
      {isUnlimited ? null : (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${usagePercent(usage.used, usage.limit)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function PlanCard({
  plan,
  interval,
  isCurrent,
  onChoose,
}: {
  plan: BillingPlan
  interval: BillingInterval
  isCurrent: boolean
  onChoose: () => void
}) {
  const price = formatPrice(plan, interval)

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl border bg-surface p-5',
        plan.highlight ? 'border-brand-400 shadow-panel' : 'border-ink-200',
      ].join(' ')}
    >
      {plan.highlight ? (
        <Badge tone="brand" className="absolute -top-2.5 left-5">
          Most popular
        </Badge>
      ) : null}

      <div className="flex items-center gap-2">
        <p className="text-[0.92rem] font-semibold text-ink-900">{plan.name}</p>
        {isCurrent ? <Badge tone="outline">Current</Badge> : null}
      </div>
      <p className="mt-1 text-[0.76rem] leading-5 text-ink-500">{plan.tagline}</p>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-serif text-2xl font-semibold tracking-tight text-ink-900">
          {price.amount}
        </span>
        {price.amount.startsWith('$') ? (
          <span className="text-[0.76rem] text-ink-500">/ month</span>
        ) : null}
      </p>
      <p className="mt-1 min-h-[1.1rem] text-[0.7rem] text-ink-400">{price.note ?? ''}</p>

      <p className="mt-4 text-[0.72rem] font-medium text-ink-600">{planLimitsSummary(plan)}</p>

      <ul className="mt-3 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[0.78rem] leading-5 text-ink-600">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-ink-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isCurrent ? 'outline' : plan.highlight ? 'primary' : 'secondary'}
        size="sm"
        className="mt-5 w-full"
        disabled={isCurrent}
        onClick={onChoose}
      >
        {isCurrent ? 'Current plan' : plan.monthlyPrice === null ? 'Contact sales' : `Choose ${plan.name}`}
      </Button>
    </div>
  )
}

export function SubscriptionPage() {
  const { comingSoon } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    Promise.all([getSubscription(), listBillingPlans(), listInvoices()]).then(
      ([subscriptionResult, planResults, invoiceResults]) => {
        if (cancelled) return
        setSubscription(subscriptionResult)
        setPlans(planResults)
        setInvoices(invoiceResults)
        setSelectedInterval(subscriptionResult.interval)
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  const currentPlan = plans.find((plan) => plan.id === subscription?.planId)

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Account"
        title="Subscription"
        description="Manage your ResearchMind plan, monitor usage against your monthly limits and download past invoices."
        actions={
          <Button variant="outline" onClick={() => comingSoon('The billing portal')}>
            <CardIcon className="size-4" />
            Manage billing
          </Button>
        }
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading
            title="Current plan"
            action={
              subscription ? (
                <Badge tone={STATUS_TONES[subscription.status]}>
                  {STATUS_LABELS[subscription.status]}
                </Badge>
              ) : undefined
            }
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="font-serif text-xl font-semibold tracking-tight text-ink-900">
                {isLoading ? '—' : currentPlan?.name ?? 'No plan'}
              </p>
              <p className="mt-1 text-[0.8rem] leading-6 text-ink-500">
                {subscription ? (
                  <>
                    Renews on <span className="font-medium text-ink-700">{formatDate(subscription.renewsAt)}</span>
                    {' · '}
                    {subscription.interval === 'annual' ? 'billed annually' : 'billed monthly'}
                  </>
                ) : (
                  'Loading billing details…'
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => comingSoon('Updating your payment method')}
              >
                Update payment method
              </Button>
              <Button variant="ghost" size="sm" onClick={() => comingSoon('Plan cancellation')}>
                Cancel plan
              </Button>
            </div>
          </div>

          {subscription ? (
            <dl className="mt-5 grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                  Payment method
                </dt>
                <dd className="mt-1 text-[0.84rem] text-ink-700">
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </dd>
                <dd className="text-[0.74rem] text-ink-500">
                  Expires {subscription.paymentMethod.expiry}
                </dd>
              </div>
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                  Billing cycle
                </dt>
                <dd className="mt-1 text-[0.84rem] text-ink-700">
                  {subscription.interval === 'annual' ? 'Annual' : 'Monthly'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-ink-400">
                  Next invoice
                </dt>
                <dd className="mt-1 text-[0.84rem] text-ink-700">
                  {formatDate(subscription.renewsAt)}
                </dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading
            title="Usage this cycle"
            action={
              <span className="text-[0.76rem] text-ink-500">
                Resets {subscription ? formatDate(subscription.renewsAt) : '—'}
              </span>
            }
          />

          {isLoading ? (
            <p className="text-[0.8rem] text-ink-500">Loading…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {subscription?.usage.map((usage) => (
                <UsageBar key={usage.label} usage={usage} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            title="Change plan"
            action={
              <div className="inline-flex rounded-xl border border-ink-200 bg-surface p-0.5">
                {BILLING_INTERVALS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedInterval(option.value)}
                    aria-pressed={selectedInterval === option.value}
                    className={[
                      'rounded-[0.6rem] px-3 py-1.5 text-[0.78rem] font-medium transition-colors',
                      selectedInterval === option.value
                        ? 'bg-ink-800 text-white dark:bg-ink-100 dark:text-ink-900'
                        : 'text-ink-600 hover:text-ink-900',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          />
          <p className="-mt-1 mb-4 text-[0.76rem] text-ink-500">
            Prices in USD. Annual billing saves two months on paid plans.
          </p>

          {isLoading ? (
            <p className="text-[0.8rem] text-ink-500">Loading plans…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  interval={selectedInterval}
                  isCurrent={plan.id === subscription?.planId}
                  onChoose={() =>
                    comingSoon(
                      plan.monthlyPrice === null
                        ? 'Contacting the sales team'
                        : `Switching to the ${plan.name} plan`,
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-ink-200 bg-surface p-5 sm:p-6">
          <SectionHeading
            title="Billing history"
            action={
              <span className="text-[0.76rem] text-ink-500">
                {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
              </span>
            }
          />

          {isLoading ? (
            <p className="text-[0.8rem] text-ink-500">Loading…</p>
          ) : invoices.length === 0 ? (
            <p className="text-[0.8rem] text-ink-500">No invoices yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.82rem] font-medium text-ink-800">
                      {invoice.description}
                    </p>
                    <p className="mt-0.5 text-[0.74rem] text-ink-500">
                      {invoice.number} · {formatDate(invoice.issuedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={INVOICE_TONES[invoice.status]}>{invoice.status}</Badge>
                    <span className="text-[0.82rem] font-medium tabular-nums text-ink-800">
                      ${invoice.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Download ${invoice.number}`}
                      onClick={() => comingSoon('Invoice downloads')}
                    >
                      <DownloadIcon className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-ink-200 bg-surface/60 p-5">
          <p className="flex items-start gap-2 text-[0.8rem] leading-6 text-ink-500">
            <SparkleIcon className="mt-1 size-3.5 shrink-0 text-ink-300" />
            This is a frontend prototype. No payment is collected and plan changes are not applied —
            all billing data shown is mock data held in the browser.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}
