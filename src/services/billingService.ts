import { billingPlans, invoices, subscription } from '@/data/mockBilling'
import type { BillingPlan, Invoice, Subscription } from '@/types/billing'

/**
 * Mock billing service.
 *
 * Mirrors the shape of `researchService.ts`: every function returns a Promise
 * so the UI is unchanged when these become FastAPI calls.
 */

const simulateLatency = (ms = 240) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const clone = <T,>(value: T): T => structuredClone(value)

export async function getSubscription(): Promise<Subscription> {
  await simulateLatency(200)
  return clone(subscription)
}

export async function listBillingPlans(): Promise<BillingPlan[]> {
  await simulateLatency(160)
  return clone(billingPlans)
}

export async function listInvoices(): Promise<Invoice[]> {
  await simulateLatency(200)
  return clone(invoices)
}
