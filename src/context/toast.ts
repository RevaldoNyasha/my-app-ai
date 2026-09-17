import { createContext } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
}

export interface ToastOptions {
  title: string
  description?: string
}

export interface ToastContextValue {
  showToast: (options: ToastOptions, duration?: number) => void
  /** Feedback for prototype features that are not wired up yet. */
  comingSoon: (feature: string) => void
  dismissToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
