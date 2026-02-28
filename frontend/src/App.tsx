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
import { PatientPortal } from '@/pages/patient/PatientPortal'
import { PatientEhr } from '@/pages/admin/PatientEhr'
import { PatientLayout } from '@/components/PatientLayout'
import PatientDashboard from '@/pages/patient/Dashboard'
import PatientHistory from '@/pages/patient/History'
import PatientHistoryDetail from '@/pages/patient/HistoryDetail'
import PatientAppointments from '@/pages/patient/Appointments'
import PatientProfile from '@/pages/patient/Profile'
import PatientVitals from '@/pages/patient/Vitals'
import PatientChatDoctor from '@/pages/patient/ChatDoctor'
import AiAssistant from '@/pages/patient/AiAssistant'
import PatientFamily from '@/pages/patient/Family'
import DoctorChat from '@/pages/doctor/Chat'
import { PatientList } from '@/pages/doctor/PatientList'
import { ManageDoctor } from '@/pages/admin/ManageDoctor'
import { PatientAllocation } from '@/pages/admin/PatientAllocation'
import { FinancialReport } from '@/pages/admin/FinancialReport'
import { MonthlyReport } from '@/pages/admin/MonthlyReport'
import { DoctorPerformance } from '@/pages/admin/DoctorPerformance'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { getRedirectResult } from 'firebase/auth'
import { auth } from '@/firebase'
import toast from 'react-hot-toast'
import { ERROR_CODES, APP_ROUTES } from '@/constants'
import { useAppNavigation } from '@/hooks/useAppNavigation'

function SocialLoginHandler() {
  const { socialLogin } = useAuth()
  const { setTenant } = useTenant()
  const location = useLocation()
  const navigation = useAppNavigation()

  useEffect(() => {
    let handled = false
    const handleRedirectResult = async () => {
      if (handled) return
      try {
        const result = await getRedirectResult(auth)
        if (result && result.user) {
          handled = true
          toast.success("Xác thực mạng xã hội thành công! Đang xử lý đăng nhập...")
          const token = await result.user.getIdToken()
          try {
            const res = await socialLogin({ idToken: token, tenantId: undefined, branchId: undefined })
            setTenant(res.user.tenantId, res.user.branchId ?? undefined)
            setTimeout(() => {
              navigation.navigateAfterLogin(res.user)
            }, 300)
          } catch (socialErr: any) {
            console.log("Social login needs tenant selection:", socialErr)
            if (socialErr.errorCode === ERROR_CODES.AUTH_TENANT_REQUIRED || socialErr.message === 'REQUIRE_TENANT_SELECTION') {
              if (location.pathname === APP_ROUTES.LOGIN) {
                navigation.navigateToLogin({ firebaseToken: token })
              } else {
                navigation.navigateToLanding({ openLogin: true, firebaseToken: token })
              }
            } else {
              toast.error('Lỗi đăng nhập: ' + socialErr.message)
            }
          }
        }
      } catch (err: any) {
        console.error('Redirect sign-in error:', err)
        if (err?.message?.includes('REQUIRE_TENANT_SELECTION') || err?.response?.data?.message?.includes('REQUIRE_TENANT_SELECTION')) {
          // Already handled in inner try-catch, but just in case
        } else {
          toast.error('Lỗi đăng nhập MXH: ' + err.message)
        }
      }
    }
    handleRedirectResult()
  }, [])

  return null
}

function App() {
  return (
    <>
      <SocialLoginHandler />
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
            <Route path="/portal/:patientId" element={<PatientPortal />} />
            <Route path="/patient" element={<PatientLayout><Outlet /></PatientLayout>}>
              <Route index element={<PatientDashboard />} />
              <Route path="history" element={<PatientHistory />} />
              <Route path="history/:id" element={<PatientHistoryDetail />} />
              <Route path="vitals" element={<PatientVitals />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="chat" element={<PatientChatDoctor />} />
              <Route path="ai-assistant" element={<AiAssistant />} />
              <Route path="family" element={<PatientFamily />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>
          </Route>

          {/* Staff Portal - staff (not patient) */}
          <Route element={<RequireStaff />}>
            <Route element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />

              {/* Patient Management: Doctor, Clinic Manager & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'clinic_manager', 'admin']} />}>
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:patientId/ehr" element={<PatientEhr />} />
                <Route path="chat" element={<DoctorChat />} />
              </Route>

              {/* Risk Analysis: Doctor, Clinic Manager & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'clinic_manager', 'admin']} />}>
                <Route path="analytics" element={<RiskAnalysis />} />
              </Route>

              {/* Prescriptions: Doctor & Admin */}
              <Route element={<PermissionGate allowedRoles={['doctor', 'admin']} />}>
                <Route path="prescriptions" element={<PrescriptionList />} />
              </Route>

              {/* Reports & CDM Management: Clinic Manager & Admin */}
              <Route element={<PermissionGate allowedRoles={['clinic_manager', 'admin']} />}>
                <Route path="reports" element={<Reports />} />
                <Route path="reports/finance" element={<FinancialReport />} />
                <Route path="reports/monthly" element={<MonthlyReport />} />
                <Route path="reports/performance" element={<DoctorPerformance />} />
                <Route path="admin/doctors" element={<ManageDoctor />} />
                <Route path="admin/allocation" element={<PatientAllocation />} />
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
