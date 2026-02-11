/*
  # Medical Audit Trail

  Creates a medical_audit_trail table to track all medical team actions
  (approvals, revocations, high-risk flags, notes) with timestamps and performer info.

  Security:
  - RLS enabled
  - Medical team and admins can read and write audit records
  - Regular users cannot access audit trail
*/

-- Medical Audit Trail Table
CREATE TABLE IF NOT EXISTS medical_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES medical_assessments(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'revoked', 'flagged_high_risk', 'note_added')),
  performed_by UUID REFERENCES users(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medical_audit_trail ENABLE ROW LEVEL SECURITY;

-- Policy: Medical team and admins can read audit trail records
CREATE POLICY "Medical team and admins can read audit trail"
  ON medical_audit_trail FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE user_type IN ('medical_team', 'medical', 'admin')
    )
  );

-- Policy: Medical team and admins can insert audit trail records
CREATE POLICY "Medical team and admins can insert audit trail"
  ON medical_audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE user_type IN ('medical_team', 'medical', 'admin')
    )
  );

-- Policy: Medical team and admins can update medical assessments (for doctor_notes, flagged_high_risk)
-- Check if this policy already exists; if not, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medical_assessments'
    AND policyname = 'Medical team can update assessments'
  ) THEN
    CREATE POLICY "Medical team can update assessments"
      ON medical_assessments FOR UPDATE
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE user_type IN ('medical_team', 'medical', 'admin')
        )
      )
      WITH CHECK (
        auth.uid() IN (
          SELECT id FROM users WHERE user_type IN ('medical_team', 'medical', 'admin')
        )
      );
  END IF;
END $$;

-- Policy: Medical team and admins can read all medical assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medical_assessments'
    AND policyname = 'Medical team can read all assessments'
  ) THEN
    CREATE POLICY "Medical team can read all assessments"
      ON medical_assessments FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE user_type IN ('medical_team', 'medical', 'admin')
        )
      );
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_assessment_id ON medical_audit_trail(assessment_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_by ON medical_audit_trail(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON medical_audit_trail(created_at DESC);
