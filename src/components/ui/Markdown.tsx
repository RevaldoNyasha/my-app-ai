import type { ReactNode } from 'react'

/**
 * A deliberately small markdown renderer for assistant responses.
 * Supports: `## h2`, `### h3`, `- bullets`, `1. ordered`, **bold**, and
 * blank-line separated paragraphs — enough for structured research answers
 * without pulling in a markdown dependency.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={`${keyPrefix}-t-${index}`}>{part}</span>
  })
}

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function parse(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      continue
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      continue
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed)
    if (bullet) {
      const last = blocks[blocks.length - 1]
      if (last && last.type === 'ul') {
        last.items.push(bullet[1])
      } else {
        blocks.push({ type: 'ul', items: [bullet[1]] })
      }
      continue
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(trimmed)
    if (ordered) {
      const last = blocks[blocks.length - 1]
      if (last && last.type === 'ol') {
        last.items.push(ordered[1])
      } else {
        blocks.push({ type: 'ol', items: [ordered[1]] })
      }
      continue
    }

    blocks.push({ type: 'p', text: trimmed })
  }

  return blocks
}

export function Markdown({ content }: { content: string }) {
  const blocks = parse(content)

  return (
    <div className="space-y-1">
      {blocks.map((block, index) => {
        const key = `block-${index}`

        if (block.type === 'h2') {
          return (
            <h2
              key={key}
              className="font-serif text-xl font-semibold tracking-tight text-ink-900 mt-6 mb-2 first:mt-0"
            >
              {renderInline(block.text, key)}
            </h2>
          )
        }

        if (block.type === 'h3') {
          return (
            <h3
              key={key}
              className="text-[0.95rem] font-semibold text-ink-900 mt-5 mb-1.5"
            >
              {renderInline(block.text, key)}
            </h3>
          )
        }

        if (block.type === 'ul') {
          return (
            <ul key={key} className="my-3 space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${key}-${itemIndex}`}
                  className="relative pl-5 text-[0.94rem] leading-7 text-ink-700"
                >
                  <span className="absolute left-0 top-[0.82rem] size-1.5 rounded-full bg-brand-300" />
                  {renderInline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ol') {
          return (
            <ol key={key} className="my-3 space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${key}-${itemIndex}`}
                  className="relative pl-6 text-[0.94rem] leading-7 text-ink-700"
                >
                  <span className="absolute left-0 top-0 text-[0.8rem] font-semibold text-brand-600 tabular-nums">
                    {itemIndex + 1}.
                  </span>
                  {renderInline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={key} className="text-[0.94rem] leading-7 text-ink-700 my-3 first:mt-0">
            {renderInline(block.text, key)}
          </p>
        )
      })}
    </div>
  )
}
