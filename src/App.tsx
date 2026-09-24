import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProjectLayout } from '@/components/layout/ProjectLayout'
import { LandingPage } from '@/pages/LandingPage'
import { Projects } from '@/pages/Projects'
import { ProjectOverview } from '@/pages/ProjectOverview'
import { ProjectChat } from '@/pages/ProjectChat'
import { ResearchDataPage } from '@/pages/ResearchData'
import { AnalysisPage } from '@/pages/Analysis'
import { ReportsPage } from '@/pages/Reports'
import { Settings } from '@/pages/Settings'
import { SubscriptionPage } from '@/pages/Subscription'
import { NotFound } from '@/pages/NotFound'

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
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<ProjectOverview />} />
              <Route path="chat" element={<ProjectChat />} />
              <Route path="data" element={<ProjectDataRoute />} />
              <Route path="analysis" element={<ProjectAnalysisRoute />} />
              <Route path="reports" element={<ProjectReportsRoute />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <LoginModal />
      </AuthProvider>
    </BrowserRouter>
  )
}
