import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'
import { PermissionGate } from '@/components/PermissionGate'
import { RequirePatient } from '@/components/RequirePatient'
import { RequireStaff } from '@/components/RequireStaff'

import { LandingPage } from '@/pages/LandingPage'
import { Dashboard } from '@/pages/Dashboard'

import { Reports } from '@/pages/Reports'
import { RiskAnalysis } from '@/pages/doctor/RiskAnalysis'
import { PrescriptionList } from '@/pages/doctor/PrescriptionList'
import { Admin } from '@/pages/Admin'
import { PatientEhr } from '@/pages/admin/PatientEhr'
import { PatientLayout } from '@/components/PatientLayout'
import PatientDashboard from '@/pages/patient/Dashboard'
import PatientHistory from '@/pages/patient/History'
import PatientHistoryDetail from '@/pages/patient/HistoryDetail'
import PatientAppointments from '@/pages/patient/Appointments'
import PatientProfile from '@/pages/patient/Profile'
import PatientVitals from '@/pages/patient/Vitals'
import PatientMedications from '@/pages/patient/Medications'
import PatientChatDoctor from '@/pages/patient/ChatDoctor'
import DoctorChat from '@/pages/doctor/Chat'
import { PatientList } from '@/pages/doctor/PatientList'
import { ManageDoctor } from '@/pages/admin/ManageDoctor'
import { PatientAllocation } from '@/pages/admin/PatientAllocation'

import { MonthlyReport } from '@/pages/admin/MonthlyReport'
import { DoctorPerformance } from '@/pages/admin/DoctorPerformance'
import Scheduling from '@/pages/doctor/Scheduling'
import { Outlet } from 'react-router-dom'




function App() {
  return (
    <>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
            maxWidth: '500px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" state={{ openLogin: true }} replace />} />
        <Route element={<RequireAuth />}>
          {/* Patient Portal - role patient */}
          <Route element={<RequirePatient />}>
            <Route path="/patient" element={<PatientLayout><Outlet /></PatientLayout>}>
              <Route index element={<PatientDashboard />} />
              <Route path="history" element={<PatientHistory />} />
              <Route path="history/:id" element={<PatientHistoryDetail />} />
              <Route path="medications" element={<PatientMedications />} />
              <Route path="vitals" element={<PatientVitals />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="chat" element={<PatientChatDoctor />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>
          </Route>

          {/* Staff Portal - staff (not patient) */}
          <Route element={<RequireStaff />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />

              {/* Patient Management: Doctor & Clinic Manager */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'clinic_manager']} />}>
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:patientId/ehr" element={<PatientEhr />} />
                <Route path="chat" element={<DoctorChat />} />
                <Route path="scheduling" element={<Scheduling />} />
              </Route>

              {/* Risk Analysis: Doctor & Clinic Manager */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'clinic_manager']} />}>
                <Route path="analytics" element={<RiskAnalysis />} />
              </Route>

              {/* Prescriptions: Doctor Only */}
              <Route element={<PermissionGate allowedRoles={['doctor']} />}>
                <Route path="prescriptions" element={<PrescriptionList />} />
              </Route>

              {/* Reports & CDM Management: Clinic Manager Only */}
              <Route element={<PermissionGate allowedRoles={['clinic_manager']} />}>
                <Route path="reports" element={<Reports />} />

                <Route path="reports/monthly" element={<MonthlyReport />} />
                <Route path="reports/performance" element={<DoctorPerformance />} />
                <Route path="admin/doctors" element={<ManageDoctor />} />
                <Route path="admin/allocation" element={<PatientAllocation />} />
              </Route>

              {/* Admin Only: System Administration */}
              <Route element={<PermissionGate allowedRoles={['admin']} />}>
                <Route path="admin" element={<Admin />} />
                <Route path="admin/users" element={<Admin />} />
                <Route path="admin/roles" element={<Admin />} />
                <Route path="admin/audit-logs" element={<Admin />} />
                <Route path="admin/settings" element={<Admin />} />
                <Route path="admin/tenants" element={<Admin />} />
                <Route path="admin/diseases" element={<Admin />} />
                <Route path="admin/reports" element={<Admin />} />
                <Route path="admin/ai-config" element={<Admin />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
