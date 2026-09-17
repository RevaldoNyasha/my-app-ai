import { useOutletContext } from 'react-router-dom'
import type { Evidence, ResearchProject } from '@/types/research'

export interface ProjectOutletContext {
  project: ResearchProject
  openEvidence: (evidence: Evidence) => void
}

/** Access the active research project from a nested project route. */
export function useProjectContext(): ProjectOutletContext {
  return useOutletContext<ProjectOutletContext>()
}
