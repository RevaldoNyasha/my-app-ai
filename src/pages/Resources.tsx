import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero, Reveal } from '@/components/landing/MarketingLayout'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { ArrowRightIcon, ChevronDownIcon, FolderIcon, LayersIcon, QuoteIcon, TagIcon } from '@/components/ui/icons'

const CONCEPTS = [
  {
    term: 'Project',
    example: 'Youth Access to Education',
    description:
      'One research study. It holds your uploaded data, your conversations with the assistant, and the themes and reports that come out of it.',
    icon: FolderIcon,
  },
  {
    term: 'Theme',
    example: 'Financial barriers',
    description: 'A big idea that keeps coming up across the data. Themes are your findings.',
    icon: LayersIcon,
  },
  {
    term: 'Code',
    example: 'Bus fare · Uniform costs · Lunch money',
    description: 'A smaller, specific idea. Related codes are grouped together into a theme.',
    icon: TagIcon,
  },
  {
    term: 'Evidence',
    example: '“The bus fare is too expensive.” — P04',
    description: 'A word-for-word participant quote that supports a code, so every finding is traceable.',
    icon: QuoteIcon,
  },
]

const GUIDES = [
  {
    tag: 'Getting started',
    title: 'Set up your first project',
    description: 'Name your study, write a clear research question and upload your first transcripts.',
  },
  {
    tag: 'Data',
    title: 'Preparing interview data',
    description: 'Label participants consistently and remove identifying details before you upload.',
  },
  {
    tag: 'Analysis',
    title: 'Reviewing AI-generated themes',
    description: 'How to check, merge and rename themes so they reflect your own analytic judgement.',
  },
  {
    tag: 'Languages',
    title: 'Working across languages',
    description: 'Analyse Shona and Ndebele data alongside English while keeping original quotes intact.',
  },
  {
    tag: 'Reporting',
    title: 'Writing up with evidence',
    description: 'Turn approved themes into a report that cites participant quotes for every claim.',
  },
  {
    tag: 'Ethics',
    title: 'Consent and data protection',
    description: 'Good practice for informed consent, anonymisation and storing sensitive research data.',
  },
]

const FAQS = [
  {
    question: 'Does the AI replace my own analysis?',
    answer:
      'No. ResearchMind suggests codes and themes, but you stay in control — you review, edit and approve everything before it reaches a report.',
  },
  {
    question: 'Which file types can I upload?',
    answer:
      'Text transcripts, documents, survey exports and audio recordings of interviews and focus groups.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'English, Shona and Ndebele today, with more African languages being added. Original-language quotes are always kept alongside translations.',
  },
  {
    question: 'Can I use ResearchMind for my thesis?',
    answer:
      'Yes. The free Student plan is designed for coursework, dissertations and pilot studies. Always check your institution’s rules on using AI tools.',
  },
]

export function ResourcesPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Resources"
        title="Learn how to get the most"
        highlight="out of your research."
        description="Plain-language guides to the ideas behind ResearchMind, and good practice for qualitative research with AI."
      />

      <section className="relative" aria-label="Key concepts">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <SectionHeading
            eyebrow="Key concepts"
            title="The building blocks of your analysis"
            align="left"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONCEPTS.map((concept, index) => (
              <Reveal key={concept.term} delay={index * 0.07}>
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="flex size-10 items-center justify-center text-white">
                    <concept.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-[1rem] font-semibold text-white">{concept.term}</h3>
                  <p className="mt-2 flex-1 text-[0.86rem] leading-6 text-slate-400">
                    {concept.description}
                  </p>
                  <p className="mt-4 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-[0.78rem] italic text-slate-300">
                    {concept.example}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.05]" aria-label="Guides">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="Guides"
            title="Research guides"
            description="Short, practical articles for each stage of a study. More guides are being written."
            align="left"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide, index) => (
              <Reveal key={guide.title} delay={(index % 3) * 0.08}>
                <article className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-[0.7rem] font-medium text-slate-300">
                      {guide.tag}
                    </span>
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">
                      Coming soon
                    </span>
                  </div>
                  <h3 className="mt-5 text-[1rem] font-semibold text-white">{guide.title}</h3>
                  <p className="mt-2 text-[0.86rem] leading-6 text-slate-400">{guide.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.05]" aria-label="Frequently asked questions">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
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

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-8 text-center">
            <p className="text-[1rem] font-semibold text-white">Still have a question?</p>
            <p className="text-[0.86rem] text-slate-400">Our team is happy to help with setup or methodology.</p>
            <Link
              to="/contact"
              className="group mt-2 inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 px-4 text-[0.88rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:border-white/40"
            >
              Contact us
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
