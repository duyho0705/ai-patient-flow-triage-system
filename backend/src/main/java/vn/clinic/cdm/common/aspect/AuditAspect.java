package vn.clinic.cdm.common.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.common.annotation.AuditAction;
import vn.clinic.cdm.service.common.AuditService;
import vn.clinic.cdm.dto.common.AuditRequest;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @AfterReturning(pointcut = "@annotation(auditAction)", returning = "result")
    public void logSuccessfulAction(JoinPoint joinPoint, AuditAction auditAction, Object result) {
        logAction(auditAction.value(), "SUCCESS", "");
    }

    @AfterThrowing(pointcut = "@annotation(auditAction)", throwing = "ex")
    public void logFailedAction(JoinPoint joinPoint, AuditAction auditAction, Exception ex) {
        logAction(auditAction.value(), "FAILED", ex.getMessage());
    }

    private void logAction(String action, String status, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AuthPrincipal principal)) {
            return;
        }

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();
        String ip = request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");

        auditService.log(new AuditRequest(
                principal.getUserId(),
                principal.getEmail(),
                action,
                details,
                status,
                ip,
                ua));
    }
}
