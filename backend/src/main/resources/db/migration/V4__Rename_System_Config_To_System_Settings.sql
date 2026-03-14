-- Migration V4: Rename system_config to system_settings and align with entity
ALTER TABLE system_config RENAME TO system_settings;
ALTER TABLE system_settings RENAME COLUMN config_key TO setting_key;
ALTER TABLE system_settings RENAME COLUMN config_value TO setting_value;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE system_settings DROP COLUMN IF EXISTS is_secret;
