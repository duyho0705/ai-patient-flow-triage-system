package vn.clinic.cdm.service.report.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.dto.report.DailyVolumeDto;
import vn.clinic.cdm.dto.report.WaitTimeSummaryDto;
import vn.clinic.cdm.service.report.ReportExportService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl implements ReportExportService {

    @Override
    public byte[] exportMonthlyReport(UUID tenantId, int year, int month) {
        return new byte[0];
    }

    @Override
    public byte[] exportDoctorPerformance(UUID tenantId) {
        return new byte[0];
    }

    @Override
    public byte[] exportDailyVolumeExcel(List<DailyVolumeDto> data) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Daily Volume");
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

            int rowIdx = 1;
            for (DailyVolumeDto dto : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getDate().toString());
                row.createCell(1).setCellValue(dto.getBranchName());
                row.createCell(2).setCellValue(String.valueOf(dto.getTriageCount()));
                row.createCell(3).setCellValue(String.valueOf(dto.getCompletedQueueEntries()));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            return new byte[0];
        }
    }

    @Override
    public byte[] exportWaitTimeExcel(WaitTimeSummaryDto dto) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Wait Time Summary");
            Row r = sheet.createRow(0);
            r.createCell(0).setCellValue("Avg Wait Time:");
            r.createCell(1).setCellValue(dto.getAverageWaitMinutes());
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            return new byte[0];
        }
    }
}
