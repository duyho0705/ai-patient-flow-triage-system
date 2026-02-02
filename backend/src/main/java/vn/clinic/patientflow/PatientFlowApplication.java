package vn.clinic.patientflow;

/**
 * Entry point – AI-powered patient flow and triage (Vietnam clinics).
 * Modular monolith: tenant, identity, patient, scheduling, triage, queue, clinical, aiaudit.
 */
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PatientFlowApplication {

    public static void main(String[] args) {
        // Force UTC timezone at the earliest possible moment
        System.setProperty("user.timezone", "UTC");
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        SpringApplication.run(PatientFlowApplication.class, args);
    }
}
