-- Migration V12: Fix Admin Role Code mismatch
-- Rename SYSTEM_ADMIN to ADMIN to match backend @PreAuthorize checks.

UPDATE identity_role 
SET code = 'ADMIN' 
WHERE code = 'SYSTEM_ADMIN';
