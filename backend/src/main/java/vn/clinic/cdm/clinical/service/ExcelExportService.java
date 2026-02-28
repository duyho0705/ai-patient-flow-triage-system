package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.repository.PatientRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final PatientRepository patientRepository;

    public byte[] exportPatientReport() throws IOException {
        List<Patient> patients = patientRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("BÃ¡o cÃ¡o bá»‡nh nhÃ¢n");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0: Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "ID", "Há» tÃªn", "CCCD", "NgÃ y sinh", "Sá»‘ Ä‘iá»‡n thoáº¡i", "Giá»›i tÃ­nh", "Quá»‘c tá»‹ch" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowIdx = 1;
            for (Patient p : patients) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId().toString());
                row.createCell(1).setCellValue(p.getFullNameVi());
                row.createCell(2).setCellValue(p.getCccd());
                row.createCell(3).setCellValue(p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : "N/A");
                row.createCell(4).setCellValue(p.getPhone());
                row.createCell(5).setCellValue(p.getGender());
                row.createCell(6).setCellValue(p.getNationality());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}

