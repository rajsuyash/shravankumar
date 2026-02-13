-- Add missing columns to email_queue referenced by the process-email-queue edge function
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;
