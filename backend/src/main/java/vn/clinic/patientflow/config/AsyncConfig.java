package vn.clinic.patientflow.config;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import vn.clinic.patientflow.common.tenant.TenantContext;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Executor;

/**
 * Enterprise Async Configuration.
 * Ensures Multi-tenancy context and Security Context are propagated to
 * background threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Ent-Async-");
        executor.setTaskDecorator(new ContextCopyingDecorator());
        executor.initialize();
        return executor;
    }

    static class ContextCopyingDecorator implements TaskDecorator {
        @Override
        public Runnable decorate(Runnable runnable) {
            // Capture state from the parent thread
            Optional<UUID> tenantId = TenantContext.getTenantId();
            Optional<UUID> branchId = TenantContext.getBranchId();
            SecurityContext securityContext = SecurityContextHolder.getContext();

            return () -> {
                try {
                    // Set state in the child thread
                    tenantId.ifPresent(TenantContext::setTenantId);
                    branchId.ifPresent(TenantContext::setBranchId);
                    if (securityContext != null) {
                        SecurityContextHolder.setContext(securityContext);
                    }
                    runnable.run();
                } finally {
                    // Clear state
                    TenantContext.clear();
                    SecurityContextHolder.clearContext();
                }
            };
        }
    }
}
