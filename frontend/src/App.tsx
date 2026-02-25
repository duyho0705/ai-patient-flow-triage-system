import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'
import { PermissionGate } from '@/components/PermissionGate'
import { RequirePatient } from '@/components/RequirePatient'
import { RequireStaff } from '@/components/RequireStaff'

import { LandingPage } from '@/pages/LandingPage'
import { Dashboard } from '@/pages/Dashboard'
import { Scheduling } from '@/pages/Scheduling'

import { Reports } from '@/pages/Reports'
import { RiskAnalysis } from '@/pages/doctor/RiskAnalysis'
import { PrescriptionList } from '@/pages/doctor/PrescriptionList' // Added this import
import { Admin } from '@/pages/Admin'
import { PatientPortal } from '@/pages/patient/PatientPortal'
import { PatientEhr } from '@/pages/admin/PatientEhr'
import { Reception } from '@/pages/Reception'
import { Consultation } from '@/pages/Consultation'
import { PatientLayout } from '@/components/PatientLayout'
import PatientDashboard from '@/pages/patient/Dashboard'
import PatientHistory from '@/pages/patient/History'
import PatientHistoryDetail from '@/pages/patient/HistoryDetail'
import PatientAppointments from '@/pages/patient/Appointments'
import PatientBooking from '@/pages/patient/Booking'
import PatientProfile from '@/pages/patient/Profile'
import PatientVitals from '@/pages/patient/Vitals'
import PatientBilling from '@/pages/patient/Billing'
import PatientPaymentReturn from '@/pages/patient/PaymentReturn'
import PatientInsurance from '@/pages/patient/Insurance'
import PatientChatDoctor from '@/pages/patient/ChatDoctor'
import AiAssistant from '@/pages/patient/AiAssistant'
import PatientFamily from '@/pages/patient/Family'
import DoctorChat from '@/pages/doctor/Chat'
import { DoctorConsultation } from '@/pages/DoctorConsultation'
import { PatientList } from '@/pages/doctor/PatientList'
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
          {/* Patient Portal - chỉ cho role patient */}
          <Route element={<RequirePatient />}>
            <Route path="/portal/:patientId" element={<PatientPortal />} />
            <Route path="/patient" element={<PatientLayout><Outlet /></PatientLayout>}>
              <Route index element={<PatientDashboard />} />
              <Route path="history" element={<PatientHistory />} />
              <Route path="history/:id" element={<PatientHistoryDetail />} />
              <Route path="vitals" element={<PatientVitals />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="booking" element={<PatientBooking />} />
              <Route path="billing" element={<PatientBilling />} />
              <Route path="payment-return" element={<PatientPaymentReturn />} />
              <Route path="insurance" element={<PatientInsurance />} />
              <Route path="chat" element={<PatientChatDoctor />} />
              <Route path="ai-assistant" element={<AiAssistant />} />
              <Route path="family" element={<PatientFamily />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>
          </Route>

          {/* Staff Portal - chỉ cho staff (không patient) */}
          <Route element={<RequireStaff />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />

              {/* Tiếp nhận BN: Receptionist & Admin */}
              <Route element={<PermissionGate allowedRoles={['receptionist', 'admin']} />}>
                <Route path="reception" element={<Reception />} />
              </Route>

              {/* Quản lý Điều trị & EHR: Doctor & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'admin']} />}>
                <Route path="consultation" element={<Consultation />} />
                <Route path="consultation/:consultationId" element={<DoctorConsultation />} />
                <Route path="patients/:patientId/ehr" element={<PatientEhr />} />
                <Route path="chat" element={<DoctorChat />} />
              </Route>

              {/* Phân tích nguy cơ: Doctor, Clinic Manager & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'clinic_manager', 'admin']} />}>
                <Route path="analytics" element={<RiskAnalysis />} />
              </Route>

              {/* Toa thuốc: Doctor & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'admin']} />}>
                <Route path="prescriptions" element={<PrescriptionList />} />
              </Route>

              {/* Theo dõi & Tái khám: Doctor, Receptionist & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'receptionist', 'admin']} />}>
                <Route path="patients" element={<PatientList />} />
                <Route path="scheduling" element={<Scheduling />} />
              </Route>

              {/* Báo cáo & Phân tích CDM */}
              <Route element={<PermissionGate allowedRoles={['clinic_manager', 'admin']} />}>
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Admin Only */}
              <Route element={<PermissionGate allowedRoles={['admin']} />}>
                <Route path="admin" element={<Admin />} />
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
