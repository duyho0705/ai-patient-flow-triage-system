package vn.clinic.cdm.service.common;

import vn.clinic.cdm.dto.clinical.ConsultationSummaryPdfDto;
import vn.clinic.cdm.dto.medication.PrescriptionDto;
import vn.clinic.cdm.dto.report.CdmReportDto;
import vn.clinic.cdm.dto.report.GenericReportDto;

import java.io.ByteArrayInputStream;

public interface PdfService {
    ByteArrayInputStream generatePrescriptionPdf(PrescriptionDto prescription);
    
    ByteArrayInputStream generateConsultationSummaryPdf(ConsultationSummaryPdfDto data);
    
    ByteArrayInputStream generateCdmReportPdf(CdmReportDto data);
    
    ByteArrayInputStream generateGenericPdf(GenericReportDto data);
}
