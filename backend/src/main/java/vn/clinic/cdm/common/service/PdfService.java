package vn.clinic.cdm.common.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.medication.PrescriptionDto;

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

            Paragraph title = new Paragraph("ÄÆ N THUá»C (PRESCRIPTION)", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Bá»‡nh nhÃ¢n (Patient): " + prescription.getPatientName(), normalFont));
            document.add(new Paragraph("BÃ¡c sÄ© (Doctor): " + prescription.getDoctorName(), normalFont));
            document.add(new Paragraph("NgÃ y (Date): "
                    + java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(java.time.LocalDate.now()),
                    normalFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Danh sÃ¡ch thuá»‘c (Medicines):", boldFont));
            for (var item : prescription.getItems()) {
                document.add(new Paragraph("- " + item.getProductName() + ": " + item.getQuantity() + " ("
                        + item.getDosageInstruction() + ")", normalFont));
            }

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph(
                    "Ghi chÃº (Notes): " + (prescription.getNotes() != null ? prescription.getNotes() : ""),
                    normalFont));

            document.close();
        } catch (DocumentException | IOException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateConsultationSummaryPdf(
            vn.clinic.cdm.api.dto.clinical.ConsultationSummaryPdfDto data) {
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
            Paragraph header = new Paragraph("PHIáº¾U KHÃM Bá»†NH & TÃ“M Táº®T ÄIá»€U TRá»Š", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph("(Medical Consultation Summary)", normalFont) {
                {
                    setAlignment(Element.ALIGN_CENTER);
                }
            });
            document.add(Chunk.NEWLINE);

            // Patient Info Section
            document.add(new Paragraph("I. THÃ”NG TIN Bá»†NH NHÃ‚N (PATIENT INFORMATION)", sectionFont));
            document.add(new Paragraph("Há» vÃ  tÃªn (Full Name): " + data.getPatientName(), normalFont));
            document.add(new Paragraph(
                    "NgÃ y sinh (DOB): " + (data.getPatientDob() != null ? data.getPatientDob() : "N/A"), normalFont));
            document.add(new Paragraph(
                    "Giá»›i tÃ­nh (Gender): " + (data.getPatientGender() != null ? data.getPatientGender() : "N/A"),
                    normalFont));
            document.add(new Paragraph("BÃ¡c sÄ© Ä‘iá»u trá»‹ (Doctor): " + data.getDoctorName(), normalFont));
            document.add(new Paragraph("Thá»i gian khÃ¡m (Time): " + data.getConsultationDate(), normalFont));
            document.add(Chunk.NEWLINE);

            // Clinical Section
            document.add(new Paragraph("II. Ná»˜I DUNG KHÃM (CLINICAL DETAILS)", sectionFont));
            document.add(new Paragraph("LÃ½ do khÃ¡m (Chief Complaint): "
                    + (data.getChiefComplaint() != null ? data.getChiefComplaint() : ""), normalFont));
            document.add(new Paragraph(
                    "Cháº©n Ä‘oÃ¡n (Diagnosis): " + (data.getDiagnosis() != null ? data.getDiagnosis() : "Äang cáº­p nháº­t"),
                    boldFont));
            document.add(new Paragraph("Ghi chÃº lÃ¢m sÃ ng (Clinical Notes): "
                    + (data.getClinicalNotes() != null ? data.getClinicalNotes() : ""), normalFont));
            document.add(Chunk.NEWLINE);

            // Vitals
            if (data.getVitals() != null && !data.getVitals().isEmpty()) {
                document.add(new Paragraph("III. CHá»ˆ Sá» SINH HIá»†U (VITALS)", sectionFont));
                for (var v : data.getVitals()) {
                    document.add(
                            new Paragraph("- " + v.getType() + ": " + v.getValue() + " " + v.getUnit(), normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Lab Results
            if (data.getLabResults() != null && !data.getLabResults().isEmpty()) {
                document.add(new Paragraph("IV. Káº¾T QUáº¢ XÃ‰T NGHIá»†M (LAB RESULTS)", sectionFont));
                for (var lr : data.getLabResults()) {
                    document.add(new Paragraph("- " + lr.getTestName() + ": " + lr.getValue() + " " + lr.getUnit()
                            + " (Ref: " + lr.getReferenceRange() + ") [" + lr.getStatus() + "]", normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Prescription
            if (data.getPrescriptionItems() != null && !data.getPrescriptionItems().isEmpty()) {
                document.add(new Paragraph("V. ÄÆ N THUá»C (PRESCRIPTION)", sectionFont));
                for (var item : data.getPrescriptionItems()) {
                    document.add(new Paragraph("- " + item.getProductName() + " x" + item.getQuantity() + " | HD: "
                            + item.getDosageInstruction(), normalFont));
                }
                if (data.getPrescriptionNotes() != null) {
                    document.add(new Paragraph("Ghi chÃº Ä‘Æ¡n thuá»‘c: " + data.getPrescriptionNotes(), normalFont));
                }
                document.add(Chunk.NEWLINE);
            }

            // Diagnostic Imaging
            if (data.getImagingResults() != null && !data.getImagingResults().isEmpty()) {
                document.add(new Paragraph("VI. CHáº¨N ÄOÃN HÃŒNH áº¢NH (DIAGNOSTIC IMAGING)", sectionFont));
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

    public ByteArrayInputStream generateCdmReportPdf(vn.clinic.cdm.api.dto.report.CdmReportDto data) {
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
            Paragraph header = new Paragraph("BÃO CÃO QUáº¢N LÃ Bá»†NH MÃƒN TÃNH (CDM)", headerFont);
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
                    "Bá»‡nh nhÃ¢n: " + data.getPatientName() + " | Giá»›i tÃ­nh: " + data.getPatientGender(), normalFont));
            document.add(new Paragraph("NgÃ y sinh: " + data.getPatientDob(), normalFont));
            document.add(new Paragraph("BÃ¡c sÄ© phá»¥ trÃ¡ch: " + data.getDoctorName(), normalFont));
            document.add(new Paragraph("NgÃ y láº­p bÃ¡o cÃ¡o: " + data.getReportDate(), normalFont));
            document.add(Chunk.NEWLINE);

            // Section 1: Chronic Conditions
            document.add(new Paragraph("1. DANH SÃCH Bá»†NH Ná»€N (CHRONIC CONDITIONS)", sectionFont));
            if (data.getConditions() == null || data.getConditions().isEmpty()) {
                document.add(new Paragraph("- KhÃ´ng cÃ³ bá»‡nh ná»n Ä‘Æ°á»£c ghi nháº­n.", normalFont));
            } else {
                for (var c : data.getConditions()) {
                    document.add(new Paragraph(
                            "- " + c.getName() + " (ICD-10: " + c.getIcd10() + ") | Má»©c Ä‘á»™: " + c.getSeverity(),
                            normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 2: Vital Targets
            document.add(new Paragraph("2. NGÆ¯á» NG SINH HIá»†U Má»¤C TIÃŠU (VITAL TARGETS)", sectionFont));
            if (data.getTargets() == null || data.getTargets().isEmpty()) {
                document.add(new Paragraph("- Sá»­ dá»¥ng ngÆ°á»¡ng lÃ¢m sÃ ng tiÃªu chuáº©n.", normalFont));
            } else {
                for (var t : data.getTargets()) {
                    document.add(
                            new Paragraph("- " + t.getType() + ": " + t.getRange() + " " + t.getUnit(), normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 3: Adherence
            document.add(new Paragraph("3. TUÃ‚N THá»¦ ÄIá»€U TRá»Š (MEDICATION ADHERENCE)", sectionFont));
            if (data.getAdherence() == null || data.getAdherence().isEmpty()) {
                document.add(new Paragraph("- ChÆ°a cÃ³ dá»¯ liá»‡u theo dÃµi uá»‘ng thuá»‘c.", normalFont));
            } else {
                for (var a : data.getAdherence()) {
                    document.add(new Paragraph("- " + a.getMedicine() + ": Äiá»ƒm tuÃ¢n thá»§ " + a.getScore()
                            + "% (Láº§n cuá»‘i: " + a.getLastTaken() + ")", normalFont));
                }
            }
            document.add(Chunk.NEWLINE);

            // Section 4: AI Care Plan
            if (data.getAiCarePlan() != null && !data.getAiCarePlan().isEmpty()) {
                document.add(new Paragraph("4. Káº¾ HOáº CH CHÄ‚M SÃ“C AI (AI CARE PLAN)", sectionFont));
                document.add(new Paragraph("PhÃ¢n tÃ­ch cÃ¡ nhÃ¢n hÃ³a dá»±a trÃªn dá»¯ liá»‡u lÃ¢m sÃ ng:", italicFont));
                document.add(new Paragraph(data.getAiCarePlan(), normalFont));
            }

            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph("BÃ¡o cÃ¡o Ä‘Æ°á»£c há»— trá»£ bá»Ÿi há»‡ thá»‘ng Enterprise AI Healthcare", italicFont);
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

