import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProjectLayout } from '@/components/layout/ProjectLayout'

// Each page is downloaded the first time it is opened, so the first visit only
// loads the shell and the page being viewed (not the whole app).
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const PlatformPage = lazy(() => import('@/pages/Platform').then((m) => ({ default: m.PlatformPage })))
const PricingPage = lazy(() => import('@/pages/Pricing').then((m) => ({ default: m.PricingPage })))
const ResourcesPage = lazy(() =>
  import('@/pages/Resources').then((m) => ({ default: m.ResourcesPage })),
)
const PrivacyPage = lazy(() => import('@/pages/Privacy').then((m) => ({ default: m.PrivacyPage })))
const ContactPage = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.ContactPage })))
const Projects = lazy(() => import('@/pages/Projects').then((m) => ({ default: m.Projects })))
const ProjectOverview = lazy(() =>
  import('@/pages/ProjectOverview').then((m) => ({ default: m.ProjectOverview })),
)
const ProjectChat = lazy(() => import('@/pages/ProjectChat').then((m) => ({ default: m.ProjectChat })))
const ResearchDataPage = lazy(() =>
  import('@/pages/ResearchData').then((m) => ({ default: m.ResearchDataPage })),
)
const AnalysisPage = lazy(() => import('@/pages/Analysis').then((m) => ({ default: m.AnalysisPage })))
const ReportsPage = lazy(() => import('@/pages/Reports').then((m) => ({ default: m.ReportsPage })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))
const SubscriptionPage = lazy(() =>
  import('@/pages/Subscription').then((m) => ({ default: m.SubscriptionPage })),
)
const HelpPage = lazy(() => import('@/pages/Help').then((m) => ({ default: m.HelpPage })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))
const OAuthCallback = lazy(() =>
  import('@/pages/OAuthCallback').then((m) => ({ default: m.OAuthCallback })),
)

/** While a page's code downloads, keep the layout and show a quiet placeholder. */
function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center text-[0.8rem] text-ink-400">
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function ProjectDataRoute() {
  const { projectId } = useParams()
  return <ResearchDataPage projectId={projectId} />
}

function ProjectAnalysisRoute() {
  const { projectId } = useParams()
  return <AnalysisPage projectId={projectId} />
}

function ProjectReportsRoute() {
  const { projectId } = useParams()
  return <ReportsPage projectId={projectId} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Page><LandingPage /></Page>} />
          <Route path="platform" element={<Page><PlatformPage /></Page>} />
          <Route path="pricing" element={<Page><PricingPage /></Page>} />
          <Route path="resources" element={<Page><ResourcesPage /></Page>} />
          <Route path="privacy" element={<Page><PrivacyPage /></Page>} />
          <Route path="contact" element={<Page><ContactPage /></Page>} />
          <Route path="auth/callback/:provider" element={<Page><OAuthCallback /></Page>} />
          <Route element={<AppLayout />}>
            <Route path="projects" element={<Page><Projects /></Page>} />
            <Route path="projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<Page><ProjectOverview /></Page>} />
              <Route path="chat" element={<Page><ProjectChat /></Page>} />
              <Route path="data" element={<Page><ProjectDataRoute /></Page>} />
              <Route path="analysis" element={<Page><ProjectAnalysisRoute /></Page>} />
              <Route path="reports" element={<Page><ProjectReportsRoute /></Page>} />
            </Route>
            <Route path="settings" element={<Page><Settings /></Page>} />
            <Route path="subscription" element={<Page><SubscriptionPage /></Page>} />
            <Route path="help" element={<Page><HelpPage /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Route>
        </Routes>
        <LoginModal />
      </AuthProvider>
    </BrowserRouter>
  )
}
