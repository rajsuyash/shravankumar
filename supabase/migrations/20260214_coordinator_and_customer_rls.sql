-- Coordinator & Customer RLS policies for trips and trip_daily_updates
-- Run in Supabase SQL Editor

-- ========== TRIPS TABLE POLICIES ==========

-- Coordinators can view their assigned trips
CREATE POLICY "Coordinators can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (coordinator_id = auth.uid());

-- Coordinators can update their assigned trips (status, location, etc.)
CREATE POLICY "Coordinators can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (coordinator_id = auth.uid())
  WITH CHECK (coordinator_id = auth.uid());

-- Admins can insert new trips
CREATE POLICY "Admins can insert trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Customers can view trips linked to their bookings
CREATE POLICY "Customers can view their booked trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT trip_id FROM bookings
      WHERE customer_id = auth.uid() AND trip_id IS NOT NULL
    )
  );

-- ========== TRIP_DAILY_UPDATES TABLE POLICIES ==========

-- Coordinators can insert updates for their trips
CREATE POLICY "Coordinators can insert updates for own trips"
  ON trip_daily_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM trips WHERE coordinator_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Coordinators can view updates for their trips
CREATE POLICY "Coordinators can view updates for own trips"
  ON trip_daily_updates FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM trips WHERE coordinator_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Customers can view updates for trips linked to their bookings
CREATE POLICY "Customers can view their trip updates"
  ON trip_daily_updates FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT trip_id FROM bookings
      WHERE customer_id = auth.uid() AND trip_id IS NOT NULL
    )
  );

-- ========== PERFORMANCE INDEX ==========

CREATE INDEX IF NOT EXISTS idx_bookings_customer_trip
  ON bookings(customer_id, trip_id);
