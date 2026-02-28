import { useNavigate } from 'react-router-dom'
import { APP_ROLES, APP_ROUTES } from '@/constants'
import type { AuthUserDto } from '@/types/api'

/**
 * Enterprise Navigation Hook to handle complex routing logic.
 */
export function useAppNavigation() {
    const navigate = useNavigate()

    const navigateAfterLogin = (user: AuthUserDto, targetPath?: string, replace = true) => {
        // Check roles (ignoring case for enterprise robustness)
        const isPatient = user.roles.some(r => r.toUpperCase() === APP_ROLES.PATIENT)

        // Use targetPath if provided, otherwise default based on role
        const target = targetPath || (isPatient ? APP_ROUTES.PATIENT_DASHBOARD : APP_ROUTES.STAFF_DASHBOARD)

        navigate(target, { replace })
    }

    const navigateToLogin = (state?: any) => {
        navigate(APP_ROUTES.LOGIN, { state, replace: true })
    }

    const navigateToLanding = (state?: any) => {
        navigate(APP_ROUTES.LANDING, { state, replace: true })
    }

    return {
        navigateAfterLogin,
        navigateToLogin,
        navigateToLanding
    }
}
