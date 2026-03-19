package vn.clinic.cdm.service.clinical;

import java.io.IOException;

public interface ExcelExportService {
    byte[] exportPatientReport() throws IOException;
}
