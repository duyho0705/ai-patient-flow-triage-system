package vn.clinic.patientflow.config;

import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import vn.clinic.patientflow.common.service.RateLimitService;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitService rateLimitService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = request.getRemoteAddr();
        String uri = request.getRequestURI();

        // Apply strict limit for AI and Auth endpoints
        boolean strict = uri.contains("/ai-") || uri.contains("/auth/");

        Bucket bucket = rateLimitService.resolveBucket(ip, strict);

        if (bucket.tryConsume(1)) {
            // Add remaining tokens to header
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            return true;
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests. Please slow down. (Enterprise Protection)");
            return false;
        }
    }
}
