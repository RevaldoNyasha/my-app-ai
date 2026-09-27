import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '@/components/landing/MarketingLayout'

const LAST_UPDATED = '27 September 2026'

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <p>
        ResearchMind AI helps researchers analyse qualitative data such as interviews, focus groups,
        surveys and field notes. Research data is often sensitive, so we collect as little as we
        need, use it only to provide the service, and give you control over it. This policy explains
        what we collect, why, and the choices you have.
      </p>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Information we collect',
    body: (
      <ul>
        <li>
          <strong>Account information</strong> — your name, email address, institution and sign-in
          details.
        </li>
        <li>
          <strong>Research data</strong> — the files you upload, the transcripts and translations we
          produce, and the themes, codes, conversations and reports in your projects.
        </li>
        <li>
          <strong>Billing information</strong> — your plan and invoices. Card details are handled by
          our payment provider and are not stored on our servers.
        </li>
        <li>
          <strong>Usage information</strong> — basic technical data such as device, browser and
          feature usage, used to keep the service reliable and secure.
        </li>
      </ul>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your information',
    body: (
      <ul>
        <li>To transcribe, translate and analyse the research data in your projects.</li>
        <li>To run your account, process payments and provide support.</li>
        <li>To keep the service secure and to fix problems.</li>
        <li>To tell you about important changes to the service or this policy.</li>
      </ul>
    ),
  },
  {
    id: 'ai-processing',
    title: 'Your research data and AI',
    body: (
      <p>
        Your research data is used only to produce results for your own projects. We do not use it
        to train shared AI models, and we do not sell it. Where we rely on third-party AI providers
        to process data, they act on our instructions and are not permitted to use your data for
        their own purposes.
      </p>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing',
    body: (
      <p>
        We share information only with service providers who help us run ResearchMind (such as
        hosting, AI processing and payments), with collaborators you invite to your projects, or
        where the law requires it. We never sell personal or research data.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security and retention',
    body: (
      <p>
        Data is encrypted in transit and access is restricted to the people who need it. We keep
        your data for as long as your account is active. When you delete a project or close your
        account, the associated research data is deleted from our systems within a reasonable
        period, except where we must keep records by law.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <p>
        You can access, correct, export or delete your information at any time. Depending on where
        you live — including under Zimbabwe’s Cyber and Data Protection Act, South Africa’s POPIA or
        the GDPR — you may have further rights, such as objecting to certain processing. Contact us
        to exercise any of these rights.
      </p>
    ),
  },
  {
    id: 'participants',
    title: 'Research participants',
    body: (
      <p>
        As a researcher, you are responsible for obtaining informed consent from your participants
        and for meeting your institution’s ethics requirements. We recommend removing names and other
        identifying details from data before uploading it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as the service develops. When we make significant changes we will
        let you know by email or in the app before they take effect.
      </p>
    ),
  },
]

export function PrivacyPage() {
  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Privacy"
        title="Privacy policy"
        description={`How ResearchMind AI collects, uses and protects your information. Last updated ${LAST_UPDATED}.`}
      />

      <section className="relative" aria-label="Policy">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                On this page
              </p>
              <ul className="mt-4 space-y-2 border-l border-white/[0.07]">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent pl-4 text-[0.84rem] text-slate-400 transition-colors hover:border-white/60 hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="max-w-3xl space-y-12">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold tracking-tight text-white">{section.title}</h2>
                <div className="mt-4 text-[0.92rem] leading-7 text-slate-400 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                  {section.body}
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-[0.9rem] leading-7 text-slate-400">
              Questions about this policy or your data?{' '}
              <Link to="/contact" className="font-medium text-white underline underline-offset-4 hover:text-slate-300">
                Contact our team
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
