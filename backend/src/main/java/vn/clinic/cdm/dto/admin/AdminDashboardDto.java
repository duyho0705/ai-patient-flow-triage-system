package vn.clinic.cdm.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về dữ liệu tổng quan cho Admin Dashboard (SystemOverview).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalUsers;
    private long activeUsers;
    private long totalPatients;
    private long totalDoctors;
    private long totalRoles;
    private long totalTenants;
    private long totalBranches;
    private long todayAuditLogs;
    private long failedAuditLogs;
    private long highRiskPatients;
}
