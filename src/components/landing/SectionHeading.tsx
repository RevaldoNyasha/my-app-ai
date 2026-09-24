interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'center' | 'left'
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'

  return (
    <div className={alignClass}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-400 sm:text-[1.05rem]">
          {description}
        </p>
      ) : null}
    </div>
  )
}