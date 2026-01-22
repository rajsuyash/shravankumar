-- Step 1: Add trip_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id);

-- Add index for trip_id lookups
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);

-- Step 2: Create pilgrim_checklist table for tracking pilgrim status during trips
CREATE TABLE IF NOT EXISTS pilgrim_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  pilgrim_index INTEGER NOT NULL,
  pilgrim_name VARCHAR(255) NOT NULL,
  pilgrim_age INTEGER,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES users(id),
  medical_clearance_verified BOOLEAN DEFAULT false,
  medical_clearance_verified_at TIMESTAMPTZ,
  medical_clearance_verified_by UUID REFERENCES users(id),
  documents_verified BOOLEAN DEFAULT false,
  documents_verified_at TIMESTAMPTZ,
  payment_verified BOOLEAN DEFAULT false,
  special_needs_flagged BOOLEAN DEFAULT false,
  special_needs_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, pilgrim_index)
);

-- Add indexes for quick lookups
CREATE INDEX idx_pilgrim_checklist_trip_id ON pilgrim_checklist(trip_id);
CREATE INDEX idx_pilgrim_checklist_booking_id ON pilgrim_checklist(booking_id);
CREATE INDEX idx_pilgrim_checklist_status ON pilgrim_checklist(trip_id, checked_in, medical_clearance_verified);

-- Enable RLS
ALTER TABLE pilgrim_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view pilgrim checklist for their trips"
  ON pilgrim_checklist FOR SELECT
  TO authenticated
  USING (
    -- Trip coordinators can view their trips
    trip_id IN (
      SELECT id FROM trips WHERE coordinator_id = auth.uid()
    )
    -- Admins can view all
    OR auth.uid() IN (
      SELECT id FROM users WHERE user_type = 'admin'
    )
    -- Medical team can view trips they're assigned to as doctor
    OR (
      auth.uid() IN (SELECT id FROM users WHERE user_type = 'medical_team')
      AND trip_id IN (
        SELECT id FROM trips WHERE doctor_id = auth.uid()
      )
    )
  );

-- Coordinators can manage pilgrim checklist for their trips
CREATE POLICY "Coordinators can manage pilgrim checklist"
  ON pilgrim_checklist FOR ALL
  TO authenticated
  USING (
    -- Trip coordinators can manage their trips
    trip_id IN (
      SELECT id FROM trips WHERE coordinator_id = auth.uid()
    )
    -- Admins can manage all
    OR auth.uid() IN (
      SELECT id FROM users WHERE user_type = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pilgrim_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON pilgrim_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_pilgrim_checklist_updated_at();

-- Function to automatically create pilgrim checklist entries when booking is confirmed
CREATE OR REPLACE FUNCTION create_pilgrim_checklist_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  traveler JSONB;
  traveler_index INTEGER := 0;
BEGIN
  -- Only create checklist when booking is confirmed and has a trip_id
  IF NEW.booking_status = 'confirmed' AND NEW.trip_id IS NOT NULL THEN
    -- Loop through traveler_details array
    FOR traveler IN SELECT * FROM jsonb_array_elements(NEW.traveler_details)
    LOOP
      -- Insert checklist entry for each traveler
      INSERT INTO pilgrim_checklist (
        booking_id,
        trip_id,
        pilgrim_index,
        pilgrim_name,
        pilgrim_age,
        checked_in,
        medical_clearance_verified,
        documents_verified,
        payment_verified,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.trip_id,
        traveler_index,
        COALESCE(traveler->>'name', 'Unknown'),
        (traveler->>'age')::INTEGER,
        false,
        false,
        false,
        NEW.payment_status = 'completed',
        NOW(),
        NOW()
      )
      ON CONFLICT (booking_id, pilgrim_index) DO UPDATE
      SET
        trip_id = EXCLUDED.trip_id,
        pilgrim_name = EXCLUDED.pilgrim_name,
        pilgrim_age = EXCLUDED.pilgrim_age,
        payment_verified = EXCLUDED.payment_verified,
        updated_at = NOW();

      traveler_index := traveler_index + 1;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create pilgrim checklist entries
CREATE TRIGGER create_pilgrim_checklist_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_pilgrim_checklist_on_booking();

-- Comments for documentation
COMMENT ON TABLE pilgrim_checklist IS 'Tracks check-in and verification status for each pilgrim on a trip';
COMMENT ON COLUMN pilgrim_checklist.pilgrim_index IS 'Index of pilgrim in the booking traveler_details array';
COMMENT ON COLUMN pilgrim_checklist.checked_in IS 'Whether pilgrim has checked in for the trip';
COMMENT ON COLUMN pilgrim_checklist.medical_clearance_verified IS 'Whether medical team has verified clearance';
COMMENT ON COLUMN pilgrim_checklist.documents_verified IS 'Whether all required documents are verified';
COMMENT ON COLUMN pilgrim_checklist.payment_verified IS 'Whether payment for this booking is complete';
COMMENT ON COLUMN pilgrim_checklist.special_needs_flagged IS 'Whether pilgrim has special needs requiring attention';
