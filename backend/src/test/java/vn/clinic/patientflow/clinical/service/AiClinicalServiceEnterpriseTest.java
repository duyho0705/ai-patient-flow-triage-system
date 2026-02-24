package vn.clinic.patientflow.clinical.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import dev.langchain4j.model.chat.ChatLanguageModel;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest
public class AiClinicalServiceEnterpriseTest {

    @Autowired
    private AiClinicalService aiClinicalService;

    @MockBean
    private ChatLanguageModel chatModel;

    @Test
    public void testRateLimiting() {
        UUID branchId = UUID.randomUUID();
        TenantBranch branch = new TenantBranch(branchId);
        ClinicalConsultation consultation = ClinicalConsultation.builder()
                .branch(branch)
                .build();

        when(chatModel.chat(anyString())).thenReturn("AI Response");

        // We configured 10 calls per minute, burst 20 in the service.
        // Let's consume all tokens.
        for (int i = 0; i < 20; i++) {
            String result = aiClinicalService.generateLongTermCarePlan(consultation);
            assertNotNull(result);
            assertFalse(result.contains("Hệ thống đang bận"));
        }

        // The 21st call should be rate limited
        String limitedResult = aiClinicalService.generateLongTermCarePlan(consultation);
        assertTrue(limitedResult.contains("Hệ thống đang bận"));
    }
}
