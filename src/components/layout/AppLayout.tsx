import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuth } from '@/auth/AuthContext'

const COLLAPSE_KEY = 'researchmind.sidebar.collapsed'

const PROJECT_DETAIL_RE = /^\/projects\/[^/]+(?:\/.*)?$/

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isProjectDetail = PROJECT_DETAIL_RE.test(location.pathname)

  const toggleSidebar = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous
      localStorage.setItem(COLLAPSE_KEY, String(next))
      return next
    })
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={toggleSidebar}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {isAuthenticated && !isProjectDetail ? (
          <Header
            collapsed={collapsed}
            onToggleSidebar={toggleSidebar}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />
        ) : null}
        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet context={{ isDesktop, openMobileSidebar: () => setMobileOpen(true) }} />
        </main>
      </div>
    </div>
  )
}
