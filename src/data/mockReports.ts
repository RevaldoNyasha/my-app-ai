import type { ResearchReport } from '@/types/research'

export const reports: ResearchReport[] = [
  {
    id: 'report-healthcare-thematic',
    projectId: 'healthcare-access',
    title: 'Healthcare Access Thematic Analysis',
    summary:
      'A thematic analysis of 24 documents examining the barriers that shape healthcare access among young people.',
    createdAt: '2026-09-17T08:00:00.000Z',
    sections: [
      'Executive Summary',
      'Methodology',
      'Major Themes',
      'Participant Comparison',
      'Evidence',
      'Conclusions',
    ],
    status: 'final',
  },
  {
    id: 'report-financial-barriers',
    projectId: 'healthcare-access',
    title: 'Financial Barriers Evidence Report',
    summary:
      'An evidence-focused report on cost, transport and medication expenses with linked source excerpts.',
    createdAt: '2026-09-15T10:30:00.000Z',
    sections: ['Summary', 'Evidence', 'Supporting Sources', 'Limitations'],
    status: 'draft',
  },
  {
    id: 'report-rural-urban',
    projectId: 'healthcare-access',
    title: 'Rural and Urban Participant Comparison',
    summary:
      'A comparison of care-seeking experiences between rural and urban participants.',
    createdAt: '2026-09-12T14:15:00.000Z',
    sections: ['Executive Summary', 'Participant Comparison', 'Evidence', 'Conclusions'],
    status: 'final',
  },
  {
    id: 'report-youth-mental-health',
    projectId: 'youth-mental-health',
    title: 'Youth Mental Health Scoping Report',
    summary:
      'Early thematic findings on stigma, peer support and service availability among young people.',
    createdAt: '2026-09-14T09:00:00.000Z',
    sections: ['Executive Summary', 'Methodology', 'Emerging Themes', 'Next Steps'],
    status: 'draft',
  },
  {
    id: 'report-rural-education',
    projectId: 'rural-education',
    title: 'Rural Education Retention Analysis',
    summary:
      'A multi-site analysis of schooling experiences, resourcing and learner retention.',
    createdAt: '2026-09-08T11:45:00.000Z',
    sections: ['Executive Summary', 'Methodology', 'Major Themes', 'Evidence', 'Conclusions'],
    status: 'final',
  },
]
