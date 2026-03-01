-- V10__Fix_AuditLog_EntityId_Type.sql
-- Ép kiểu cột entity_id sang UUID để khớp với Java entity
ALTER TABLE audit_log 
ALTER COLUMN entity_id TYPE UUID USING entity_id::uuid;
