/*
  # Add Display Order to Circuits

  1. Changes
    - Add `display_order` column to `circuits` table
      - Type: integer
      - Default: 999 (circuits without explicit order will appear last)
      - Used to control the order in which circuits are displayed on the home page
    
  2. Notes
    - Lower numbers appear first (1, 2, 3, etc.)
    - Existing circuits will get default value of 999
    - Admins can set custom order through the admin dashboard
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'circuits' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE circuits ADD COLUMN display_order integer DEFAULT 999 NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_circuits_display_order ON circuits(display_order);