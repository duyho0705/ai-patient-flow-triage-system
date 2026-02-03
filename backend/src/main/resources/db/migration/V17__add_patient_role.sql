INSERT INTO identity_role (id, code, name_vi, description, created_at, updated_at) VALUES
    (gen_random_uuid(), 'patient', 'Bệnh nhân', 'Bệnh nhân tự quản lý hồ sơ, đặt lịch, xem hàng chờ', now(), now())
ON CONFLICT (code) DO NOTHING;
