package vn.clinic.cdm.report;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.ai.AiEffectivenessDto;
import vn.clinic.cdm.api.dto.report.DailyVolumeDto;
import vn.clinic.cdm.api.dto.report.WaitTimeSummaryDto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    /**
     * ÄÆ°á»ng dáº«n tá»›i font há»— trá»£ tiáº¿ng Viá»‡t.
     * Náº¿u Ä‘á»ƒ trá»‘ng, sáº½ dÃ¹ng font máº·c Ä‘á»‹nh (khÃ´ng hiá»ƒn thá»‹ Ä‘Æ°á»£c tiáº¿ng Viá»‡t).
     */
    private final String UNICODE_FONT_PATH = "C:/Windows/Fonts/arial.ttf";

    public byte[] exportDailyVolumeExcel(List<DailyVolumeDto> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Daily Volume");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = { "Date", "Branch", "Triage Count", "Completed Queue" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            // Data
            int rowIdx = 1;
            for (DailyVolumeDto dto : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getDate().toString());
                row.createCell(1).setCellValue(dto.getBranchName());
                row.createCell(2).setCellValue(dto.getTriageCount());
                row.createCell(3).setCellValue(dto.getCompletedQueueEntries());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportWaitTimeExcel(WaitTimeSummaryDto dto) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Wait Time Summary");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Report Info
            Row row0 = sheet.createRow(0);
            row0.createCell(0).setCellValue("Branch:");
            row0.createCell(1).setCellValue(dto.getBranchName());

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("Period:");
            row1.createCell(1).setCellValue(dto.getFromDate() + " to " + dto.getToDate());

            // Header
            Row headerRow = sheet.createRow(3);
            String[] headers = { "Metric", "Value" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 4;
            addRow(sheet, rowIdx++, "Average Wait Minutes", dto.getAverageWaitMinutes());
            addRow(sheet, rowIdx++, "Total Completed Patients", (double) dto.getTotalCompletedEntries());

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void addRow(Sheet sheet, int rowIdx, String label, Double value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        if (value != null) {
            row.createCell(1).setCellValue(value);
        } else {
            row.createCell(1).setCellValue("N/A");
        }
    }

    public byte[] exportAiEffectivenessPdf(AiEffectivenessDto dto) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font setup for Vietnamese
            com.lowagie.text.Font titleFont;
            com.lowagie.text.Font normalFont;
            com.lowagie.text.Font boldFont;

            try {
                com.lowagie.text.pdf.BaseFont bf = com.lowagie.text.pdf.BaseFont.createFont(UNICODE_FONT_PATH,
                        com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED);
                titleFont = new com.lowagie.text.Font(bf, 18, com.lowagie.text.Font.BOLD);
                normalFont = new com.lowagie.text.Font(bf, 12, com.lowagie.text.Font.NORMAL);
                boldFont = new com.lowagie.text.Font(bf, 12, com.lowagie.text.Font.BOLD);
            } catch (Exception e) {
                // Fallback to default if font file not found
                titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
                normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
                boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            }

            Paragraph title = new Paragraph("BÃO CÃO HIá»†U QUáº¢ PHÃ‚N LOáº I AI", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Chi nhÃ¡nh: " + dto.getBranchName(), normalFont));
            document.add(new Paragraph("Thá»i gian: " + dto.getFromDate() + " Ä‘áº¿n " + dto.getToDate(), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            addTableCell(table, "Chá»‰ sá»‘ (Criteria)", true, boldFont);
            addTableCell(table, "GiÃ¡ trá»‹ (Value)", true, boldFont);

            addTableCell(table, "Tá»•ng sá»‘ lÆ°á»£t phÃ¢n loáº¡i", false, normalFont);
            addTableCell(table, String.valueOf(dto.getTotalSessions()), false, normalFont);

            addTableCell(table, "Sá»‘ lÆ°á»£t AI thá»±c hiá»‡n", false, normalFont);
            addTableCell(table, String.valueOf(dto.getAiSessions()), false, normalFont);

            addTableCell(table, "Sá»‘ lÆ°á»£t NhÃ¢n viÃªn thá»±c hiá»‡n", false, normalFont);
            addTableCell(table, String.valueOf(dto.getHumanSessions()), false, normalFont);

            addTableCell(table, "Sá»‘ lÆ°á»£t AI dá»± Ä‘oÃ¡n Ä‘Ãºng (Match)", false, normalFont);
            addTableCell(table, String.valueOf(dto.getMatchCount()), false, normalFont);

            addTableCell(table, "Sá»‘ lÆ°á»£t bá»‹ thay Ä‘á»•i (Override)", false, normalFont);
            addTableCell(table, String.valueOf(dto.getOverrideCount()), false, normalFont);

            addTableCell(table, "Tá»· lá»‡ chÃ­nh xÃ¡c (Match Rate)", false, boldFont);
            addTableCell(table, String.format("%.2f%%", (dto.getMatchRate() != null ? dto.getMatchRate() * 100 : 0)),
                    false, boldFont);

            document.add(table);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return out.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, boolean isHeader, com.lowagie.text.Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8f);
        if (isHeader) {
            cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        }
        table.addCell(cell);
    }
}

