import { useState } from 'react'
import type { FormEvent } from 'react'
import { MarketingLayout, PageHero, Reveal } from '@/components/landing/MarketingLayout'
import { UsersIcon } from '@/components/landing/icons'
import { ArrowRightIcon, CardIcon, HelpIcon } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'

const TOPICS = [
  {
    value: 'sales',
    title: 'Institution plans',
    description: 'Pricing for universities, NGOs and research councils.',
    icon: CardIcon,
  },
  {
    value: 'support',
    title: 'Product support',
    description: 'Help with your account, projects or analysis.',
    icon: HelpIcon,
  },
  {
    value: 'partnerships',
    title: 'Research partnerships',
    description: 'Collaborate with us on a study or programme.',
    icon: UsersIcon,
  },
] as const

type Topic = (typeof TOPICS)[number]['value']

const inputClass =
  'mt-2 w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-[0.9rem] text-white placeholder:text-slate-500 transition-colors focus:border-white/30 focus:bg-white/[0.05] focus:outline-none'

const labelClass = 'block text-[0.82rem] font-medium text-slate-300'

export function ContactPage() {
  const { comingSoon } = useToast()
  const [topic, setTopic] = useState<Topic>('sales')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    comingSoon('Sending messages from the contact form')
  }

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about"
        highlight="your research."
        description="Questions about plans, support or partnerships? Send us a message and the right person will get back to you."
      />

      <section className="relative" aria-label="Contact form">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-24 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-3">
            {TOPICS.map((item, index) => (
              <Reveal key={item.value} delay={index * 0.07}>
                <button
                  type="button"
                  onClick={() => setTopic(item.value)}
                  aria-pressed={topic === item.value}
                  className={[
                    'flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors duration-300',
                    topic === item.value
                      ? 'border-white/30'
                      : 'border-white/[0.07] hover:border-white/15',
                  ].join(' ')}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center text-white">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-[0.95rem] font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-[0.84rem] leading-5 text-slate-400">{item.description}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Full name
                  <input required name="name" autoComplete="name" className={inputClass} placeholder="Tendai Moyo" />
                </label>
                <label className={labelClass}>
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@university.ac.zw"
                  />
                </label>
                <label className={labelClass}>
                  Organisation
                  <input name="organisation" autoComplete="organization" className={inputClass} placeholder="University or NGO" />
                </label>
                <label className={labelClass}>
                  Topic
                  <select
                    name="topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value as Topic)}
                    className={`${inputClass} [&>option]:bg-[#0a0b0b]`}
                  >
                    {TOPICS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Message
                  <textarea
                    required
                    name="message"
                    rows={6}
                    className={`${inputClass} resize-y`}
                    placeholder="Tell us about your study, team size or question…"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.78rem] text-slate-500">We usually reply within two working days.</p>
                <button
                  type="submit"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[0.92rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:border-white/40"
                >
                  Send message
                  <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  )
}
