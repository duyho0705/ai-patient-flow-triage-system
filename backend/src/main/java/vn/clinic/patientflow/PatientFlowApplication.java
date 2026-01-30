package vn.clinic.patientflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point – AI-powered patient flow and triage (Vietnam clinics).
 * Modular monolith: tenant, identity, patient, scheduling, triage, queue, clinical, aiaudit.
 */
@SpringBootApplication
public class PatientFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatientFlowApplication.class, args);
    }
}
