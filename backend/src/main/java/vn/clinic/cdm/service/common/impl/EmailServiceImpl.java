package vn.clinic.cdm.service.common.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.dto.common.EmailRequest;
import vn.clinic.cdm.service.common.EmailService;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmailWithAttachment(EmailRequest request) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(request.to());
            helper.setSubject(request.subject());
            helper.setText(request.body(), true);

            if (request.attachment() != null) {
                helper.addAttachment(request.fileName(), new ByteArrayDataSource(request.attachment(), "application/pdf"));
            }

            mailSender.send(message);
            log.info("Email sent successfully to: {}", request.to());
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", request.to(), e.getMessage());
        }
    }
}
