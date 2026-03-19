package vn.clinic.cdm.dto.common;

public record EmailRequest(
    String to,
    String subject,
    String body,
    byte[] attachment,
    String fileName
) {}
