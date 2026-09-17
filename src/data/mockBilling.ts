import type { BillingPlan, Invoice, Subscription } from '@/types/billing'

export const billingPlans: BillingPlan[] = [
  {
    id: 'student',
    name: 'Student',
    tagline: 'For coursework and pilot studies.',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: { documents: 25, queries: 200, seats: 1 },
    features: [
      '25 documents per month',
      '200 AI research queries',
      'Thematic analysis and coding',
      'Evidence-linked chat answers',
    ],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    tagline: 'For individual researchers running active studies.',
    monthlyPrice: 19,
    annualPrice: 15,
    limits: { documents: 250, queries: 2000, seats: 1 },
    features: [
      '250 documents per month',
      '2,000 AI research queries',
      'Multilingual transcription and translation',
      'Export to PDF and DOCX',
      'Priority email support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For research groups sharing a data corpus.',
    monthlyPrice: 49,
    annualPrice: 39,
    limits: { documents: 1000, queries: 10000, seats: 5 },
    features: [
      '1,000 documents per month',
      '10,000 AI research queries',
      '5 researcher seats with shared projects',
      'Theme review and approval workflow',
      'Consolidated team billing',
    ],
    highlight: true,
  },
  {
    id: 'institution',
    name: 'Institution',
    tagline: 'For universities, NGOs and research councils.',
    monthlyPrice: null,
    annualPrice: null,
    limits: { documents: -1, queries: -1, seats: -1 },
    features: [
      'Unlimited documents and queries',
      'Unlimited seats with SSO',
      'Data residency and audit logs',
      'Onboarding and methodology support',
      'Dedicated account manager',
    ],
  },
]

export const subscription: Subscription = {
  planId: 'researcher',
  status: 'active',
  interval: 'monthly',
  renewsAt: '2026-10-12T00:00:00.000Z',
  paymentMethod: {
    brand: 'Visa',
    last4: '4242',
    expiry: '04/29',
  },
  usage: [
    { label: 'Documents processed', used: 168, limit: 250, unit: '' },
    { label: 'AI research queries', used: 1240, limit: 2000, unit: '' },
    { label: 'Storage used', used: 12.4, limit: 25, unit: 'GB' },
    { label: 'Researcher seats', used: 1, limit: 1, unit: '' },
  ],
}

export const invoices: Invoice[] = [
  {
    id: 'invoice-2026-09',
    number: 'RM-2026-009',
    issuedAt: '2026-09-12T00:00:00.000Z',
    amount: 19,
    currency: 'USD',
    status: 'paid',
    description: 'Researcher plan · monthly',
  },
  {
    id: 'invoice-2026-08',
    number: 'RM-2026-008',
    issuedAt: '2026-08-12T00:00:00.000Z',
    amount: 19,
    currency: 'USD',
    status: 'paid',
    description: 'Researcher plan · monthly',
  },
  {
    id: 'invoice-2026-07',
    number: 'RM-2026-007',
    issuedAt: '2026-07-12T00:00:00.000Z',
    amount: 19,
    currency: 'USD',
    status: 'paid',
    description: 'Researcher plan · monthly',
  },
  {
    id: 'invoice-2026-06',
    number: 'RM-2026-006',
    issuedAt: '2026-06-12T00:00:00.000Z',
    amount: 19,
    currency: 'USD',
    status: 'paid',
    description: 'Researcher plan · monthly',
  },
]
