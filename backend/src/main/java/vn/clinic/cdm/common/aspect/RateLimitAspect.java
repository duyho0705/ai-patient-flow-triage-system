package vn.clinic.cdm.common.aspect;

import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import vn.clinic.cdm.common.annotation.RateLimit;
import vn.clinic.cdm.common.exception.ApiException;
import vn.clinic.cdm.common.exception.ErrorCode;
import vn.clinic.cdm.common.service.RateLimitService;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private final RateLimitService rateLimitService;

    @Before("@annotation(rateLimit)")
    public void applyRateLimit(JoinPoint joinPoint, RateLimit rateLimit) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null)
            return;

        HttpServletRequest request = attributes.getRequest();
        String ip = request.getRemoteAddr();

        // Key by IP + Method Name for granular limit
        String key = ip + ":" + joinPoint.getSignature().toShortString();
        Bucket bucket = rateLimitService.resolveBucket(key, rateLimit.strict());

        if (!bucket.tryConsume(1)) {
            throw new ApiException(ErrorCode.TOO_MANY_REQUESTS, HttpStatus.TOO_MANY_REQUESTS,
                    "Too many requests. Please try again later.");
        }
    }
}
