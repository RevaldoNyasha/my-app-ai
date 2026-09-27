import type { BillingInterval, BillingPlan } from '@/types/billing'

export const BILLING_INTERVALS: { value: BillingInterval; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

export function formatCount(value: number): string {
  return value.toLocaleString('en-GB')
}

export function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : formatCount(value)
}

export function formatSeats(seats: number): string {
  if (seats === -1) return 'Unlimited seats'
  return `${seats} ${seats === 1 ? 'seat' : 'seats'}`
}

export function planLimitsSummary(plan: BillingPlan): string {
  return [
    `${formatLimit(plan.limits.documents)} documents`,
    `${formatLimit(plan.limits.queries)} queries`,
    formatSeats(plan.limits.seats),
  ].join(' · ')
}

export function formatPrice(
  plan: BillingPlan,
  interval: BillingInterval,
): { amount: string; note: string | null } {
  const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice

  if (price === null) {
    return { amount: 'Custom', note: 'Tailored to your institution' }
  }
  if (price === 0) {
    return { amount: 'Free', note: null }
  }

  return {
    amount: `$${price}`,
    note: interval === 'annual' ? 'per month, billed yearly' : null,
  }
}
