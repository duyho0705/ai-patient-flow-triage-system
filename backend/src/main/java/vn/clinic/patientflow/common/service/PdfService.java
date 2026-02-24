package vn.clinic.patientflow.common.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.api.dto.PrescriptionDto;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfService {

    @Value("${app.pdf.font-path:src/main/resources/fonts/Arial.ttf}")
    private String fontPath;

    public ByteArrayInputStream generatePrescriptionPdf(PrescriptionDto prescription) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = getBaseFont();
            Font titleFont = new Font(bf, 18, Font.BOLD);
            Font normalFont = new Font(bf, 12, Font.NORMAL);
            Font boldFont = new Font(bf, 12, Font.BOLD);

            Paragraph title = new Paragraph("ĐƠN THUỐC (PRESCRIPTION)", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Bệnh nhân (Patient): " + prescription.getPatientName(), normalFont));
            document.add(new Paragraph("Bác sĩ (Doctor): " + prescription.getDoctorName(), normalFont));
            document.add(new Paragraph("Ngày (Date): "
                    + java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(java.time.LocalDate.now()),
                    normalFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Danh sách thuốc (Medicines):", boldFont));
            for (var item : prescription.getItems()) {
                document.add(new Paragraph("- " + item.getProductName() + ": " + item.getQuantity() + " ("
                        + item.getDosageInstruction() + ")", normalFont));
            }

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph(
                    "Ghi chú (Notes): " + (prescription.getNotes() != null ? prescription.getNotes() : ""),
                    normalFont));

            document.close();
        } catch (DocumentException | IOException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateConsultationSummaryPdf(
            vn.clinic.patientflow.api.dto.ConsultationSummaryPdfDto data) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = getBaseFont();
            Font headerFont = new Font(bf, 18, Font.BOLD);
            Font sectionFont = new Font(bf, 14, Font.BOLD);
            Font normalFont = new Font(bf, 11, Font.NORMAL);
            Font boldFont = new Font(bf, 11, Font.BOLD);

            // Header
            Paragraph header = new Paragraph("PHIẾU KHÁM BỆNH & TÓM TẮT ĐIỀU TRỊ", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph("(Medical Consultation Summary)", normalFont) {
                {
                    setAlignment(Element.ALIGN_CENTER);
                }
            });
            document.add(Chunk.NEWLINE);

            // Patient Info Section
            document.add(new Paragraph("I. THÔNG TIN BỆNH NHÂN (PATIENT INFORMATION)", sectionFont));
            document.add(new Paragraph("Họ và tên (Full Name): " + data.getPatientName(), normalFont));
            document.add(new Paragraph(
                    "Ngày sinh (DOB): " + (data.getPatientDob() != null ? data.getPatientDob() : "N/A"), normalFont));
            document.add(new Paragraph(
                    "Giới tính (Gender): " + (data.getPatientGender() != null ? data.getPatientGender() : "N/A"),
                    normalFont));
            document.add(new Paragraph("Bác sĩ điều trị (Doctor): " + data.getDoctorName(), normalFont));
            document.add(new Paragraph("Thời gian khám (Time): " + data.getConsultationDate(), normalFont));
            document.add(Chunk.NEWLINE);

            // Clinical Section
            document.add(new Paragraph("II. NỘI DUNG KHÁM (CLINICAL DETAILS)", sectionFont));
            document.add(new Paragraph("Lý do khám (Chief Complaint): "
                    + (data.getChiefComplaint() != null ? data.getChiefComplaint() : ""), normalFont));
            document.add(new Paragraph(
                    "Chẩn đoán (Diagnosis): " + (data.getDiagnosis() != null ? data.getDiagnosis() : "Đang cập nhật"),
                    boldFont));
            document.add(new Paragraph("Ghi chú lâm sàng (Clinical Notes): "
                    + (data.getClinicalNotes() != null ? data.getClinicalNotes() : ""), normalFont));
            document.add(Chunk.NEWLINE);

            // Vitals
            if (data.getVitals() != null && !data.getVitals().isEmpty()) {
                document.add(new Paragraph("III. CHỈ SỐ SINH HIỆU (VITALS)", sectionFont));
                for (var v : data.getVitals()) {
                    document.add(
                            new Paragraph("- " + v.getType() + ": " + v.getValue() + " " + v.getUnit(), normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Lab Results
            if (data.getLabResults() != null && !data.getLabResults().isEmpty()) {
                document.add(new Paragraph("IV. KẾT QUẢ XÉT NGHIỆM (LAB RESULTS)", sectionFont));
                for (var lr : data.getLabResults()) {
                    document.add(new Paragraph("- " + lr.getTestName() + ": " + lr.getValue() + " " + lr.getUnit()
                            + " (Ref: " + lr.getReferenceRange() + ") [" + lr.getStatus() + "]", normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Prescription
            if (data.getPrescriptionItems() != null && !data.getPrescriptionItems().isEmpty()) {
                document.add(new Paragraph("V. ĐƠN THUỐC (PRESCRIPTION)", sectionFont));
                for (var item : data.getPrescriptionItems()) {
                    document.add(new Paragraph("- " + item.getProductName() + " x" + item.getQuantity() + " | HD: "
                            + item.getDosageInstruction(), normalFont));
                }
                if (data.getPrescriptionNotes() != null) {
                    document.add(new Paragraph("Ghi chú đơn thuốc: " + data.getPrescriptionNotes(), normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Diagnostic Imaging
            if (data.getImagingResults() != null && !data.getImagingResults().isEmpty()) {
                document.add(new Paragraph("VI. CHẨN ĐOÁN HÌNH ẢNH (DIAGNOSTIC IMAGING)", sectionFont));
                for (var img : data.getImagingResults()) {
                    document.add(new Paragraph("- " + img.getTitle() + ": " + img.getDescription(), normalFont));
                }
            }

            document.close();
        } catch (DocumentException | IOException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateCdmReportPdf(vn.clinic.patientflow.api.dto.CdmReportDto data) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = getBaseFont();
            Font headerFont = new Font(bf, 18, Font.BOLD);
            Font sectionFont = new Font(bf, 14, Font.BOLD);
            Font normalFont = new Font(bf, 11, Font.NORMAL);
            Font italicFont = new Font(bf, 10, Font.ITALIC);

            // Header
            Paragraph header = new Paragraph("BÁO CÁO QUẢN LÝ BỆNH MÃN TÍNH (CDM)", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph("(Chronic Disease Management Report)", normalFont) {
                {
                    setAlignment(Element.ALIGN_CENTER);
                }
            });
            document.add(Chunk.NEWLINE);

            // Patient info
            document.add(new Paragraph(
                    "Bệnh nhân: " + data.getPatientName() + " | Giới tính: " + data.getPatientGender(), normalFont));
            document.add(new Paragraph("Ngày sinh: " + data.getPatientDob(), normalFont));
            document.add(new Paragraph("Bác sĩ phụ trách: " + data.getDoctorName(), normalFont));
            document.add(new Paragraph("Ngày lập báo cáo: " + data.getReportDate(), normalFont));
            document.add(Chunk.NEWLINE);

            // Section 1: Chronic Conditions
            document.add(new Paragraph("1. DANH SÁCH BỆNH NỀN (CHRONIC CONDITIONS)", sectionFont));
            if (data.getConditions() == null || data.getConditions().isEmpty()) {
                document.add(new Paragraph("- Không có bệnh nền được ghi nhận.", normalFont));
            } else {
                for (var c : data.getConditions()) {
                    document.add(new Paragraph(
                            "- " + c.getName() + " (ICD-10: " + c.getIcd10() + ") | Mức độ: " + c.getSeverity(),
                            normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 2: Vital Targets
            document.add(new Paragraph("2. NGƯỠNG SINH HIỆU MỤC TIÊU (VITAL TARGETS)", sectionFont));
            if (data.getTargets() == null || data.getTargets().isEmpty()) {
                document.add(new Paragraph("- Sử dụng ngưỡng lâm sàng tiêu chuẩn.", normalFont));
            } else {
                for (var t : data.getTargets()) {
                    document.add(
                            new Paragraph("- " + t.getType() + ": " + t.getRange() + " " + t.getUnit(), normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 3: Adherence
            document.add(new Paragraph("3. TUÂN THỦ ĐIỀU TRỊ (MEDICATION ADHERENCE)", sectionFont));
            if (data.getAdherence() == null || data.getAdherence().isEmpty()) {
                document.add(new Paragraph("- Chưa có dữ liệu theo dõi uống thuốc.", normalFont));
            } else {
                for (var a : data.getAdherence()) {
                    document.add(new Paragraph("- " + a.getMedicine() + ": Điểm tuân thủ " + a.getScore()
                            + "% (Lần cuối: " + a.getLastTaken() + ")", normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 4: AI Care Plan
            if (data.getAiCarePlan() != null && !data.getAiCarePlan().isEmpty()) {
                document.add(new Paragraph("4. KẾ HOẠCH CHĂM SÓC AI (AI CARE PLAN)", sectionFont));
                document.add(new Paragraph("Phân tích cá nhân hóa dựa trên dữ liệu lâm sàng:", italicFont));
                document.add(new Paragraph(data.getAiCarePlan(), normalFont));
            }

            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph("Báo cáo được hỗ trợ bởi hệ thống Enterprise AI Healthcare", italicFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
        } catch (DocumentException | IOException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private BaseFont getBaseFont() throws IOException {
        try {
            return BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (Exception e) {
            return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
        }
    }
}
