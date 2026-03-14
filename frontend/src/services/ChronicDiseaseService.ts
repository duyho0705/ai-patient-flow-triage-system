import { RiskPatientDto } from "@/api/doctor";

/**
 * Enterprise Service for Chronic Disease Management Logic
 * Handles complex business rules, sorting, and data processing
 */
export const ChronicDiseaseService = {
    /**
     * Sorts patients by priority level for clinical triage
     * Priority: CRITICAL (3) > HIGH (2) > MEDIUM (1) > LOW (0)
     */
    sortRiskPatients(patients: RiskPatientDto[]): RiskPatientDto[] {
        const priorityScore: Record<string, number> = {
            'CRITICAL': 3,
            'HIGH': 2,
            'MEDIUM': 1,
            'LOW': 0
        };

        return [...patients].sort((a, b) => {
            const scoreA = priorityScore[a.riskLevel] || 0;
            const scoreB = priorityScore[b.riskLevel] || 0;
            
            // Primary sort: Risk Level
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            
            // Secondary sort: Alphabetical Name
            return a.patientName.localeCompare(b.patientName);
        });
    },

    /**
     * Formats clinical data for PDF export (EHR Report)
     */
    prepareEhrReportData(profile: any, history: any[], metrics: any[]) {
        return {
            reportId: `EHR-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            patient: {
                name: profile?.fullNameVi || 'N/A',
                dob: profile?.dateOfBirth || 'N/A',
                gender: profile?.gender === 'MALE' ? 'Nam' : 'Nữ',
                bloodType: profile?.bloodType || 'N/A',
                cid: profile?.cccd || 'N/A'
            },
            summary: {
                totalVisits: history.length,
                lastVisit: history[0]?.startedAt || 'N/A',
                latestVitals: metrics.reduce((acc: any, m: any) => {
                    acc[m.metricType] = m.value;
                    return acc;
                }, {})
            }
        };
    },

    /**
     * Mock AI Parser: Extracts medication reminders from prescription notes
     * In a real enterprise app, this would call an LLM or structured parsing API
     */
    parsePrescriptionReminders(notes: string) {
        if (!notes) return [];
        
        // Simple regex-based parsing for demo purposes
        // Example: "Amlodipine 5mg, uống sáng 1 viên" -> sáng: 1 viên
        const reminders = [];
        const lines = notes.split('\n');
        
        for (const line of lines) {
            if (line.toLowerCase().includes('sáng')) {
                reminders.push({ time: '08:00', note: `Uống sáng: ${line}` });
            }
            if (line.toLowerCase().includes('trưa')) {
                reminders.push({ time: '12:00', note: `Uống trưa: ${line}` });
            }
            if (line.toLowerCase().includes('chiều') || line.toLowerCase().includes('tối')) {
                reminders.push({ time: '19:00', note: `Uống tối: ${line}` });
            }
        }
        
        return reminders;
    },

    /**
     * Checks if there are consecutive abnormal vitals over the last 3 days
     * Returns true if 3+ days of abnormalities are detected
     */
    checkConsecutiveAbnormalVitals(vitalHistory: any[], config: Record<string, { normalRange: [number, number] }>) {
        if (!vitalHistory || vitalHistory.length < 3) return false;

        // Group by day
        const dailyVitals: Record<string, any[]> = {};
        vitalHistory.forEach(v => {
            const date = new Date(v.recordedAt).toISOString().split('T')[0];
            if (!dailyVitals[date]) dailyVitals[date] = [];
            dailyVitals[date].push(v);
        });

        const sortedDates = Object.keys(dailyVitals).sort((a, b) => b.localeCompare(a));
        if (sortedDates.length < 3) return false;

        let consecutiveCount = 0;
        for (const date of sortedDates) {
            const dayVitals = dailyVitals[date];
            const hasAbnormal = dayVitals.some(v => {
                const cfg = config[v.vitalType?.toUpperCase()];
                if (!cfg) return false;
                const [low, high] = cfg.normalRange;
                return v.valueNumeric < low || v.valueNumeric > high;
            });

            if (hasAbnormal) {
                consecutiveCount++;
                if (consecutiveCount >= 3) return true;
            } else {
                // Not consecutive anymore
                break;
            }
        }

        return false;
    }
};
