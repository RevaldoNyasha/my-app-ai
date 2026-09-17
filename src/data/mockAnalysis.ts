import type { ResearchTheme, ThemeRelationship } from '@/types/research'

export const themes: ResearchTheme[] = [
  {
    id: 'theme-financial',
    projectId: 'healthcare-access',
    name: 'Financial Barriers',
    description:
      'Costs associated with consultation fees, medication and transport consistently shape whether and when participants seek care.',
    sourceCount: 19,
    excerptCount: 32,
    participantCount: 14,
    confidence: 0.94,
    codes: [
      { id: 'code-transport-costs', name: 'Transport costs', excerptCount: 12 },
      { id: 'code-consultation-fees', name: 'Consultation fees', excerptCount: 11 },
      { id: 'code-medication-costs', name: 'Medication costs', excerptCount: 9 },
    ],
  },
  {
    id: 'theme-geographic',
    projectId: 'healthcare-access',
    name: 'Geographic Access',
    description:
      'Distance to the nearest facility and limited transport options were described as routine obstacles, particularly in rural communities.',
    sourceCount: 16,
    excerptCount: 27,
    participantCount: 12,
    confidence: 0.9,
    codes: [
      { id: 'code-distance', name: 'Distance to clinic', excerptCount: 15 },
      { id: 'code-rural-access', name: 'Rural access', excerptCount: 8 },
      { id: 'code-clinic-availability', name: 'Clinic availability', excerptCount: 4 },
    ],
  },
  {
    id: 'theme-quality',
    projectId: 'healthcare-access',
    name: 'Healthcare Quality',
    description:
      'Participants differentiated between the availability of care and the quality of the interaction once care was reached.',
    sourceCount: 14,
    excerptCount: 21,
    participantCount: 11,
    confidence: 0.85,
    codes: [
      { id: 'code-staff-availability', name: 'Staff availability', excerptCount: 9 },
      { id: 'code-medication-stock', name: 'Medication stock-outs', excerptCount: 7 },
      { id: 'code-provider-attitude', name: 'Provider attitude', excerptCount: 5 },
    ],
  },
  {
    id: 'theme-cultural',
    projectId: 'healthcare-access',
    name: 'Cultural Beliefs',
    description:
      'Family expectations, traditional healing practices and community norms influence care-seeking behaviour and treatment choices.',
    sourceCount: 11,
    excerptCount: 18,
    participantCount: 9,
    confidence: 0.78,
    codes: [
      { id: 'code-traditional-healing', name: 'Traditional healing', excerptCount: 8 },
      { id: 'code-family-influence', name: 'Family influence', excerptCount: 6 },
      { id: 'code-confidentiality', name: 'Confidentiality concerns', excerptCount: 4 },
    ],
  },
  {
    id: 'theme-waiting',
    projectId: 'healthcare-access',
    name: 'Waiting Times',
    description:
      'Long queues and repeated visits were described as a hidden cost that discouraged participants from returning.',
    sourceCount: 12,
    excerptCount: 19,
    participantCount: 10,
    confidence: 0.82,
    codes: [
      { id: 'code-queue-length', name: 'Queue length', excerptCount: 9 },
      { id: 'code-repeat-visits', name: 'Repeat visits', excerptCount: 7 },
      { id: 'code-appointment-delays', name: 'Appointment delays', excerptCount: 3 },
    ],
  },
]

export const themeRelationships: ThemeRelationship[] = [
  { id: 'rel-1', sourceThemeId: 'theme-financial', targetThemeId: 'theme-geographic', strength: 0.86 },
  { id: 'rel-2', sourceThemeId: 'theme-financial', targetThemeId: 'theme-waiting', strength: 0.54 },
  { id: 'rel-3', sourceThemeId: 'theme-geographic', targetThemeId: 'theme-waiting', strength: 0.47 },
  { id: 'rel-4', sourceThemeId: 'theme-quality', targetThemeId: 'theme-waiting', strength: 0.62 },
  { id: 'rel-5', sourceThemeId: 'theme-cultural', targetThemeId: 'theme-quality', strength: 0.58 },
  { id: 'rel-6', sourceThemeId: 'theme-cultural', targetThemeId: 'theme-financial', strength: 0.35 },
]
