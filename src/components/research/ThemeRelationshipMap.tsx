import { useMemo } from 'react'
import type { ResearchTheme, ThemeRelationship } from '@/types/research'

interface ThemeRelationshipMapProps {
  themes: ResearchTheme[]
  relationships: ThemeRelationship[]
  hubLabel?: string
}

const WIDTH = 680
const HEIGHT = 380
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 }
const RADIUS = 128

export function ThemeRelationshipMap({
  themes,
  relationships,
  hubLabel = 'Healthcare Access',
}: ThemeRelationshipMapProps) {
  const nodes = useMemo(
    () =>
      themes.map((theme, index) => {
        const angle = (index / themes.length) * Math.PI * 2 - Math.PI / 2
        return {
          theme,
          x: CENTER.x + Math.cos(angle) * RADIUS,
          y: CENTER.y + Math.sin(angle) * RADIUS,
        }
      }),
    [themes],
  )

  const nodeById = new Map(nodes.map((node) => [node.theme.id, node]))

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-surface p-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Theme relationship map"
      >
        {nodes.map((node) => (
          <line
            key={`hub-${node.theme.id}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={node.x}
            y2={node.y}
            stroke="var(--color-ink-200)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {relationships.map((relationship) => {
          const source = nodeById.get(relationship.sourceThemeId)
          const target = nodeById.get(relationship.targetThemeId)
          if (!source || !target) return null

          return (
            <line
              key={relationship.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="var(--color-brand-300)"
              strokeWidth={1 + relationship.strength * 5}
              strokeLinecap="round"
              opacity={0.5 + relationship.strength * 0.4}
            />
          )
        })}

        <circle cx={CENTER.x} cy={CENTER.y} r={44} fill="var(--color-brand-600)" />
        <text
          x={CENTER.x}
          y={CENTER.y - 4}
          textAnchor="middle"
          className="fill-white text-[11px] font-semibold"
        >
          Healthcare
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 11}
          textAnchor="middle"
          className="fill-white/80 text-[11px]"
        >
          {hubLabel.split(' ').slice(-1)[0]}
        </text>

        {nodes.map((node) => (
          <g key={node.theme.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={10 + node.theme.confidence * 8}
              fill="var(--color-surface)"
              stroke="var(--color-brand-400)"
              strokeWidth={2}
            />
            <circle cx={node.x} cy={node.y} r={4} fill="var(--color-brand-600)" />
            <text
              x={node.x}
              y={node.y + (node.y < CENTER.y ? -26 : 32)}
              textAnchor="middle"
              className="fill-ink-700 text-[11px] font-medium"
            >
              {node.theme.name}
            </text>
            <text
              x={node.x}
              y={node.y + (node.y < CENTER.y ? -14 : 44)}
              textAnchor="middle"
              className="fill-ink-400 text-[9.5px]"
            >
              {node.theme.excerptCount} excerpts
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-4 border-t border-ink-100 px-3 py-2.5">
        <span className="flex items-center gap-2 text-[0.72rem] text-ink-500">
          <span className="h-1 w-6 rounded-full bg-brand-300" />
          Line thickness shows co-occurrence strength
        </span>
        <span className="flex items-center gap-2 text-[0.72rem] text-ink-500">
          <span className="size-2.5 rounded-full border-2 border-brand-400 bg-surface" />
          Node size shows theme confidence
        </span>
      </div>
    </div>
  )
}
