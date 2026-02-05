package vn.clinic.patientflow.patient.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.AiChatRequest;
import vn.clinic.patientflow.api.dto.AiChatResponse;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.service.SchedulingService;

@Service
@RequiredArgsConstructor
public class PatientAiChatService {

    private final SchedulingService schedulingService;
    private final InvoiceRepository invoiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final vn.clinic.patientflow.triage.repository.TriageVitalRepository triageVitalRepository;

    public AiChatResponse processMessage(Patient patient, AiChatRequest request) {
        String msg = request.getMessage().toLowerCase();
        List<String> suggestions = new ArrayList<>();
        String response = "";

        // ... existing cases ...
        // (I will keep the logic but update the health case)

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
                        appt.getBranch().getNameVi(), appt.getBranch().getAddressLine());
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
            var vitals = triageVitalRepository.findByPatientId(patient.getId());
            if (vitals.isEmpty()) {
                response = "Tôi chưa ghi nhận chỉ số sinh hiệu nào của bạn trong hệ thống. Bạn có muốn đặt lịch để được bác sĩ kiểm tra không?";
                suggestions.add("Đặt lịch khám");
            } else {
                var latest = vitals.get(vitals.size() - 1);
                response = String.format("Chỉ số %s gần nhất của bạn là %s %s (ghi nhận vào %s). " +
                        "Dựa trên dữ liệu, các chỉ số của bạn đang được theo dõi tốt. Đừng quên duy trì lối sống lành mạnh nhé!",
                        latest.getVitalType(), latest.getValueNumeric(), latest.getUnit(),
                        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
                                .withZone(java.time.ZoneId.systemDefault()).format(latest.getRecordedAt()));
                suggestions.add("Xem biểu đồ sức khỏe");
                suggestions.add("Tư vấn dinh dưỡng");
            }
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
