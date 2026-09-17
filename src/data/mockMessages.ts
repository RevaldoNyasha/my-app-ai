import type { ChatMessage, Evidence } from '@/types/research'

export interface MockResponse {
  content: string
  evidence?: Evidence[]
}

export const seededMessages: ChatMessage[] = [
  {
    id: 'msg-01',
    role: 'user',
    content: 'What are the major barriers affecting access to healthcare among young people?',
    createdAt: '2026-09-17T09:02:00.000Z',
    projectId: 'healthcare-access',
  },
  {
    id: 'msg-02',
    role: 'assistant',
    content: `## Major Barriers to Healthcare Access

Based on the interviews and focus groups in **Healthcare Access Study**, three recurring barriers emerged across 24 documents.

### 1. Cost of Healthcare

Participants frequently mentioned consultation fees, medication costs and transport expenses as the first thing that determines whether they seek care at all.

### 2. Distance to Healthcare Facilities

Participants from rural communities described long travel distances and limited transport options, often deciding against a visit when no reliable transport was available.

### 3. Waiting Times

Several participants described long waiting periods at public healthcare facilities, with repeated visits required before being seen.

### What this suggests

Cost and distance are not independent — they compound. Participants who travel furthest also spend the most on transport, which strengthens the relationship between **Financial Barriers** and **Geographic Access**.`,
    createdAt: '2026-09-17T09:02:24.000Z',
    projectId: 'healthcare-access',
    evidence: [
      {
        id: 'ev-01',
        source: 'Interview 03',
        participant: 'P03',
        timestamp: '04:32',
        quote:
          "Sometimes I don't go to the clinic because I don't have enough money for transport.",
        theme: 'Healthcare Access',
        code: 'Financial Barriers',
        language: 'Shona',
        relevance: 0.96,
      },
      {
        id: 'ev-02',
        source: 'Focus Group 02',
        participant: 'P07',
        timestamp: '08:41',
        quote: 'The clinic is very far from where we live.',
        theme: 'Geographic Access',
        code: 'Distance to clinic',
        language: 'Ndebele',
        relevance: 0.93,
      },
      {
        id: 'ev-03',
        source: 'Interview 08',
        participant: 'P11',
        timestamp: '12:07',
        quote:
          'I arrived at six in the morning and I was only seen after midday. I had already missed my class.',
        theme: 'Waiting times',
        code: 'Queue length',
        language: 'English',
        relevance: 0.88,
      },
    ],
  },
]

export const mockResponses: Record<string, MockResponse> = {
  'healthcare barriers': {
    content: `## Major Barriers to Healthcare Access

Based on the interviews in this project, three recurrent barriers emerged.

### 1. Cost of Healthcare

Participants frequently mentioned consultation fees, medication costs and transport expenses.

### 2. Distance to Healthcare Facilities

Participants from rural communities described long travel distances and limited transport options.

### 3. Waiting Times

Several participants described long waiting periods at public healthcare facilities.`,
    evidence: [
      {
        id: 'mock-ev-cost',
        source: 'Interview 03',
        participant: 'P03',
        timestamp: '04:32',
        quote:
          "Sometimes I don't go to the clinic because I don't have enough money for transport.",
        theme: 'Financial Barriers',
        code: 'Transport costs',
        language: 'Shona',
        relevance: 0.96,
      },
      {
        id: 'mock-ev-distance',
        source: 'Focus Group 02',
        participant: 'P07',
        timestamp: '08:41',
        quote: 'The clinic is very far from where we live.',
        theme: 'Geographic Access',
        code: 'Distance to clinic',
        language: 'Ndebele',
        relevance: 0.92,
      },
    ],
  },

  'compare participants': {
    content: `## Urban and Rural Participant Comparison

Comparing 9 urban participants with 11 rural participants revealed overlapping concerns but different priorities.

### Where participants agree

Both groups placed **cost** at the centre of their decisions, and both mentioned waiting times as a source of frustration.

### Where they differ

- **Rural participants** spoke about distance and transport as a daily constraint, and often described planning a visit around available transport.
- **Urban participants** spoke more about queue length, staff availability and being turned away after a long wait.

### Interpretation

Distance appears to act as a threshold for rural participants, while urban participants are more affected by the organisation of services once they arrive.`,
    evidence: [
      {
        id: 'mock-ev-rural',
        source: 'Interview 12',
        participant: 'P04',
        timestamp: '17:20',
        quote:
          'If there is no bus that day, then I am not going. It is that simple for us here.',
        theme: 'Geographic Access',
        code: 'Rural access',
        language: 'English',
        relevance: 0.94,
      },
      {
        id: 'mock-ev-urban',
        source: 'Interview 05',
        participant: 'P02',
        timestamp: '09:15',
        quote:
          'The clinic is close, but you can still spend the whole morning waiting to be helped.',
        theme: 'Waiting times',
        code: 'Queue length',
        language: 'English',
        relevance: 0.9,
      },
    ],
  },

  evidence: {
    content: `## Evidence for Cost as a Barrier

I searched across interviews, focus groups and the survey dataset for excerpts linking cost to access. Cost appears in three forms: transport, consultation and medication.

### Strength of the signal

Cost-related language appears in **19 of 24 documents** and across **14 participants**, which makes it the most consistently supported theme in the project.

### Interpretation

Cost does not only stop people from paying for care — it also shapes whether it is worth travelling at all.`,
    evidence: [
      {
        id: 'mock-ev-1',
        source: 'Interview 03',
        participant: 'P03',
        timestamp: '04:32',
        quote:
          "Sometimes I don't go to the clinic because I don't have enough money for transport.",
        theme: 'Financial Barriers',
        code: 'Transport costs',
        language: 'Shona',
        relevance: 0.97,
      },
      {
        id: 'mock-ev-2',
        source: 'Interview 07',
        participant: 'P06',
        timestamp: '22:11',
        quote:
          'They told me the medicine was not there and I had to buy it at the pharmacy. It was too much for me.',
        theme: 'Financial Barriers',
        code: 'Medication costs',
        language: 'English',
        relevance: 0.93,
      },
      {
        id: 'mock-ev-3',
        source: 'Focus Group 01',
        participant: 'P09',
        timestamp: '31:04',
        quote:
          'We pay to be seen, and then we pay again for the tablets. By the end of the month there is nothing left.',
        theme: 'Financial Barriers',
        code: 'Consultation fees',
        language: 'English',
        relevance: 0.91,
      },
    ],
  },

  themes: {
    content: `## Recurring Themes Across the Interviews

I reviewed the coded excerpts in this project and grouped them into five themes.

### 1. Financial Barriers

32 supporting excerpts from 14 participants. Dominated by transport costs and consultation fees.

### 2. Geographic Access

27 excerpts from 12 participants, concentrated among rural participants.

### 3. Healthcare Quality

21 excerpts from 11 participants, covering staff availability and medication stock-outs.

### 4. Cultural Beliefs

18 excerpts from 9 participants, including traditional healing and family influence.

### 5. Waiting Times

19 excerpts from 10 participants, mostly describing queue length and repeat visits.

### Suggested next step

Two themes — **Financial Barriers** and **Geographic Access** — co-occur strongly and may be worth analysing together.`,
    evidence: [
      {
        id: 'mock-ev-theme-1',
        source: 'Interview 03',
        participant: 'P03',
        timestamp: '04:32',
        quote:
          "Sometimes I don't go to the clinic because I don't have enough money for transport.",
        theme: 'Financial Barriers',
        code: 'Transport costs',
        language: 'Shona',
        relevance: 0.95,
      },
      {
        id: 'mock-ev-theme-2',
        source: 'Interview 10',
        participant: 'P05',
        timestamp: '14:58',
        quote:
          'My grandmother said I should go to the traditional healer first before the clinic.',
        theme: 'Cultural Beliefs',
        code: 'Traditional healing',
        language: 'English',
        relevance: 0.87,
      },
    ],
  },

  methodology: {
    content: `## Suggested Methodology Summary

This project currently holds **24 documents**: 18 interviews, 3 focus groups and survey data from 142 respondents.

### Approach in the analysis so far

1. Transcripts were segmented into speaker turns and coded inductively.
2. Codes were grouped into candidate themes and reviewed for coherence.
3. Evidence was retained for each theme so every claim can be traced back to a source.

### Note for the report

You may want to state the languages of the original data — **Shona** and **Ndebele** transcripts were analysed in translation, which should be acknowledged in the methodology section.`,
    evidence: [
      {
        id: 'mock-ev-method-1',
        source: 'Focus Group 01',
        participant: 'P08',
        timestamp: '02:18',
        quote: 'Can we speak in our own language? It is easier for me to explain properly.',
        theme: 'Healthcare Access',
        code: 'Language and translation',
        language: 'English',
        relevance: 0.84,
      },
    ],
  },
}
