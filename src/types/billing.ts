/**
 * Billing and subscription models.
 *
 * Like `src/types/research.ts`, these interfaces are shaped like the payloads
 * the future backend will return so the mock service layer can be swapped for
 * HTTP calls without redesigning the UI.
 */

export type BillingInterval = 'monthly' | 'annual'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled'

export interface BillingPlan {
  id: string
  name: string
  tagline: string
  /** Price per month when billed monthly. `null` means "contact sales". */
  monthlyPrice: number | null
  /** Effective price per month when billed annually. `null` means "contact sales". */
  annualPrice: number | null
  /** `-1` means unlimited. */
  limits: {
    documents: number
    queries: number
    seats: number
  }
  features: string[]
  /** Marks the plan recommended to most researchers. */
  highlight?: boolean
}

export interface SubscriptionUsage {
  label: string
  used: number
  /** `-1` means unlimited. */
  limit: number
  /** Display unit, e.g. "GB". Empty for plain counts. */
  unit: string
}

export interface PaymentMethod {
  brand: string
  last4: string
  /** Expiry in MM/YY form. */
  expiry: string
}

export interface Subscription {
  planId: string
  status: SubscriptionStatus
  interval: BillingInterval
  /** ISO date the current period ends and the plan renews. */
  renewsAt: string
  paymentMethod: PaymentMethod
  usage: SubscriptionUsage[]
}

export interface Invoice {
  id: string
  number: string
  issuedAt: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'refunded'
  description: string
}
