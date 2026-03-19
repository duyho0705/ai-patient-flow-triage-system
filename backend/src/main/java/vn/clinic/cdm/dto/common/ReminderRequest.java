package vn.clinic.cdm.dto.common;

public record ReminderRequest(
    String fullName,
    String email,
    String phone,
    String medicineName,
    String dosage
) {}
