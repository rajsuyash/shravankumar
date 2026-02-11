/*
  # Email Queue Table

  Creates an email_queue table that acts as a queue for outbound emails.
  Emails are inserted by the application and can be processed by a
  Supabase Edge Function or external cron job.

  Security:
  - RLS enabled
  - Authenticated users can insert emails (for booking confirmations etc.)
  - Only admins can read/update the queue (for processing)
*/

-- Email Queue Table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert emails into the queue
CREATE POLICY "Authenticated users can queue emails"
  ON email_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Admins can read the email queue (for processing / monitoring)
CREATE POLICY "Admins can read email queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE user_type = 'admin'
    )
  );

-- Policy: Admins can update email queue status (mark as sent/failed)
CREATE POLICY "Admins can update email queue"
  ON email_queue FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE user_type = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE user_type = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);
