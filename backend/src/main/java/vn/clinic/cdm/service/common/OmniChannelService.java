package vn.clinic.cdm.service.common;

import vn.clinic.cdm.dto.common.ReminderRequest;

public interface OmniChannelService {
    void sendMedicationReminder(ReminderRequest request);
}
