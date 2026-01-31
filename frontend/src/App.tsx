import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'

import { LandingPage } from '@/pages/LandingPage'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Patients } from '@/pages/Patients'
import { Triage } from '@/pages/Triage'
import { Queue } from '@/pages/Queue'
import { AiAudit } from '@/pages/AiAudit'
import { Admin } from '@/pages/Admin'
import { Reports } from '@/pages/Reports'
import { DoctorConsultation } from '@/pages/DoctorConsultation'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="triage" element={<Triage />} />
          <Route path="queue" element={<Queue />} />
          <Route path="ai-audit" element={<AiAudit />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="doctor/consultation/:consultationId" element={<DoctorConsultation />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
