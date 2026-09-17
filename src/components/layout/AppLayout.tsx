import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const COLLAPSE_KEY = 'researchmind.sidebar.collapsed'

export function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)

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
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          collapsed={collapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet context={{ isDesktop }} />
        </main>
      </div>
    </div>
  )
}
