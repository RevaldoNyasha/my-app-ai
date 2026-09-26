import type { ReactNode } from 'react'

/**
 * A deliberately small markdown renderer for assistant responses.
 * Supports: `#`–`####` headings, `- bullets` (also `*`, `+`, indented),
 * `1. ordered`, **bold** / __bold__, *italic* / _italic_, `code`, and
 * blank-line separated paragraphs — enough for structured research answers
 * without pulling in a markdown dependency.
 */

// Bold before italic, so `**x**` is never read as two italics. Italic markers
// must hug the text (`*x*`, not `a * b`), and `_` only counts at word edges
// (so `file_name_2` stays as written).
const INLINE =
  /(\*\*(?:[^*\n]|\*(?!\*))+?\*\*|__[^_\n]+?__|`[^`\n]+`|\*(?![\s*])[^*\n]*?[^\s*]\*|\*[^\s*]\*|(?<![\w])_(?![\s_])[^_\n]*?[^\s_]_(?![\w]))/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (/^(\*\*|__).+\1$/.test(part)) {
      return (
        <strong key={key} className="font-semibold text-ink-900">
          {renderInline(part.slice(2, -2), key)}
        </strong>
      )
    }
    if (/^`.+`$/.test(part)) {
      return (
        <code key={key} className="rounded bg-ink-100 px-1 py-0.5 text-[0.85em] text-ink-800">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (/^([*_]).+\1$/.test(part)) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    return <span key={key}>{part}</span>
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

    const heading = /^(#{1,6})\s+(.*?)\s*#*$/.exec(trimmed)
    if (heading) {
      // Answers are short: `#`/`##` read as section titles, anything deeper as sub-headings.
      blocks.push({ type: heading[1].length <= 2 ? 'h2' : 'h3', text: heading[2] })
      continue
    }

    if (/^([-*_])(\s*\1){2,}$/.test(trimmed)) {
      continue // a horizontal rule (`---`): the block spacing already separates sections
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(trimmed)
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
