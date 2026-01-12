/*
  # Add Destinations and Departure Cities to Circuits

  1. Changes
    - Add `destinations` column (JSONB array) to store list of destination cities
    - Add `departure_cities` column (JSONB array) to store list of departure cities
    
  2. Notes
    - Both columns are nullable and default to empty arrays
    - Stored as JSONB for flexibility and querying capabilities
*/

-- Add destinations column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'circuits' AND column_name = 'destinations'
  ) THEN
    ALTER TABLE circuits ADD COLUMN destinations JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add departure_cities column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'circuits' AND column_name = 'departure_cities'
  ) THEN
    ALTER TABLE circuits ADD COLUMN departure_cities JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;