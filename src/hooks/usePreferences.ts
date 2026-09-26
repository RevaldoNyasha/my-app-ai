import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '@/auth/AuthContext'
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
} from '@/services/userService'
import type { Preferences } from '@/services/userService'

/**
 * The signed-in user's saved preferences, shared by every component (the
 * Settings page changes them; chat messages read `showEvidence`). Loaded once
 * per sign-in; changes apply at once and are saved in the background.
 */
let current: Preferences = DEFAULT_PREFERENCES
let loadedFor: string | null = null
const listeners = new Set<() => void>()

function publish(next: Preferences) {
  current = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePreferences() {
  const { user } = useAuth()
  const preferences = useSyncExternalStore(subscribe, () => current)

  useEffect(() => {
    if (!user) {
      loadedFor = null
      publish(DEFAULT_PREFERENCES)
      return
    }
    if (loadedFor === user.id) return
    loadedFor = user.id
    getPreferences()
      .then(publish)
      .catch(() => {
        loadedFor = null // try again next time
      })
  }, [user])

  /** Apply `changes` now; on failure put the old values back and rethrow. */
  const update = useCallback(async (changes: Partial<Preferences>) => {
    const previous = current
    publish({ ...current, ...changes })
    try {
      publish(await savePreferences(changes))
    } catch (error) {
      publish(previous)
      throw error
    }
  }, [])

  return { preferences, update }
}
