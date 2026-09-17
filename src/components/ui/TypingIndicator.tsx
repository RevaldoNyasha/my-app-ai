export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5" aria-label="ResearchMind is analysing">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-brand-500"
            style={{
              animation: 'pulse-dot 1.3s ease-in-out infinite',
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-ink-500">Analysing your research data…</span>
    </div>
  )
}
