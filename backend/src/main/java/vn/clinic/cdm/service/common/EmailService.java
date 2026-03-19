package vn.clinic.cdm.service.common;

import vn.clinic.cdm.dto.common.EmailRequest;

public interface EmailService {
    void sendEmailWithAttachment(EmailRequest request);
}
