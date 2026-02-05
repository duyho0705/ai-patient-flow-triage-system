package vn.clinic.patientflow.patient.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.api.dto.AiChatRequest;
import vn.clinic.patientflow.api.dto.AiChatResponse;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.service.TriageService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientAiChatService {

    private final SchedulingService schedulingService;
    private final ClinicalService clinicalService;
    private final InvoiceRepository invoiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final TriageSessionRepository triageSessionRepository;
    private final TriageService triageService;

    public AiChatResponse processMessage(Patient patient, AiChatRequest request) {
        String msg = request.getMessage().toLowerCase();
        List<String> suggestions = new ArrayList<>();
        String response = "";

        // 1. Appointment Intent
        if (msg.contains("lịch khám") || msg.contains("hẹn") || msg.contains("bác sĩ nào")) {
            var appointments = schedulingService.getUpcomingAppointmentsByPatient(patient.getId());
            if (appointments.isEmpty()) {
                response = "Chào " + patient.getFullNameVi()
                        + ", hiện tại bạn chưa có lịch hẹn nào sắp tới. Bạn có muốn tôi hỗ trợ đặt lịch mới không?";
                suggestions.add("Đặt lịch khám ngay");
                suggestions.add("Xem lịch sử khám");
            } else {
                var appt = appointments.get(0);
                response = String.format(
                        "Bạn có lịch hẹn vào ngày %s lúc %s tại %s (%s). Hãy nhớ đến trước 15 phút để làm thủ tục nhé!",
                        appt.getAppointmentDate(), appt.getSlotStartTime(),
                        appt.getBranch().getNameVi(), appt.getBranch().getAddress());
                suggestions.add("Chỉ đường đến phòng khám");
                suggestions.add("Hủy/Đổi lịch");
            }
        }
        // 2. Billing Intent
        else if (msg.contains("thanh toán") || msg.contains("hóa đơn") || msg.contains("tiền")) {
            var pending = invoiceRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patient.getId(), "PENDING");
            if (pending.isEmpty()) {
                response = "Tất cả các hóa đơn của bạn đã được thanh toán đầy đủ. Cảm ơn bạn!";
                suggestions.add("Xem lịch sử thanh toán");
            } else {
                var inv = pending.get(0);
                response = String.format(
                        "Bạn còn 1 hóa đơn chưa thanh toán: %s với số tiền %,.0f đ. Bạn có muốn thanh toán nhanh qua MoMo hoặc VietQR không?",
                        inv.getInvoiceNumber(), inv.getFinalAmount().doubleValue());
                suggestions.add("Thanh toán ngay");
                suggestions.add("Tải hóa đơn PDF");
            }
        }
        // 3. Health/Vitals Intent
        else if (msg.contains("sức khỏe") || msg.contains("huyết áp") || msg.contains("chỉ số")
                || msg.contains("nhịp tim")) {
            response = "Dựa trên dữ liệu gần nhất, các chỉ số sinh hiệu của bạn đang ở mức ổn định. Bạn nên tiếp tục duy trì chế độ ăn uống và tập luyện như bác sĩ đã dặn.";
            suggestions.add("Xem biểu đồ sức khỏe");
            suggestions.add("Tư vấn dinh dưỡng");
        }
        // 4. Medication Intent
        else if (msg.contains("thuốc") || msg.contains("uống như thế nào") || msg.contains("đơn thuốc")) {
            var latestPres = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                    .findFirst();
            if (latestPres.isPresent()) {
                response = "Đơn thuốc gần nhất của bạn có " + latestPres.get().getItems().size()
                        + " loại thuốc. Bạn cần tôi hướng dẫn cách dùng loại nào không?";
                suggestions.add("Hướng dẫn dùng thuốc");
                suggestions.add("Nhắc lịch uống thuốc");
            } else {
                response = "Hiện tại tôi chưa thấy đơn thuốc nào trong hồ sơ của bạn.";
                suggestions.add("Đặt lịch khám");
            }
        }
        // 5. Default
        else {
            response = "Chào " + patient.getFullNameVi()
                    + "! Tôi là Trợ lý AI sẵn sàng hỗ trợ bạn 24/7. Bạn có thể hỏi tôi về lịch khám, kết quả xét nghiệm hoặc hướng dẫn thanh toán.";
            suggestions.add("Kiểm tra lịch khám");
            suggestions.add("Xem chỉ số sức khỏe");
            suggestions.add("Hỏi về triệu chứng");
        }

        return AiChatResponse.builder()
                .response(response)
                .suggestions(suggestions)
                .build();
    }
}
