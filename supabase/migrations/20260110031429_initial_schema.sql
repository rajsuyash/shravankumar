/*
  # Initial Database Schema for Shravan Kumar Pilgrimage Marketplace

  1. New Tables
    - `users` - User accounts (customers, pilgrims, staff, admin, medical team)
    - `circuits` - Pilgrimage tour packages
    - `bookings` - Tour bookings
    - `medical_assessments` - Pre-trip health assessments
    - `trips` - Actual tour executions
    - `trip_daily_updates` - Daily updates and photos during trips
    - `payments` - Payment transactions
    - `reviews` - Customer reviews and ratings
    - `emergency_contacts` - Emergency contact information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for staff and medical team role-based access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  age INT,
  user_type VARCHAR(50) CHECK (user_type IN ('customer', 'pilgrim', 'staff', 'admin', 'medical_team')) DEFAULT 'customer',
  profile_photo_url VARCHAR(500),
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  health_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circuits Table
CREATE TABLE IF NOT EXISTS circuits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INT NOT NULL,
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')) DEFAULT 'Easy',
  accessibility_rating INT CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5) DEFAULT 3,
  base_price DECIMAL(10, 2) NOT NULL,
  medical_surcharge DECIMAL(10, 2) DEFAULT 0,
  max_group_size INT DEFAULT 10,
  min_age INT DEFAULT 55,
  starts_from_city VARCHAR(255),
  featured_image_url VARCHAR(500),
  images JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  included_services JSONB DEFAULT '[]'::jsonb,
  excluded_services JSONB DEFAULT '[]'::jsonb,
  medical_support_details TEXT,
  accommodation_details JSONB DEFAULT '[]'::jsonb,
  transportation_details JSONB DEFAULT '[]'::jsonb,
  cancellation_policy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) NOT NULL,
  circuit_id UUID REFERENCES circuits(id) NOT NULL,
  pilgrim_id UUID REFERENCES users(id),
  booking_date DATE DEFAULT CURRENT_DATE,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  number_of_travelers INT DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  booking_status VARCHAR(50) CHECK (booking_status IN ('confirmed', 'pending', 'cancelled', 'completed')) DEFAULT 'pending',
  group_id UUID,
  traveler_details JSONB DEFAULT '[]'::jsonb,
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Assessments Table
CREATE TABLE IF NOT EXISTS medical_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  pilgrim_id UUID REFERENCES users(id) NOT NULL,
  chronic_diseases JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  allergies TEXT,
  mobility_level VARCHAR(50) CHECK (mobility_level IN ('full', 'limited', 'wheelchair', 'bed_ridden')) DEFAULT 'full',
  oxygen_required BOOLEAN DEFAULT false,
  dietary_restrictions TEXT,
  medical_documents JSONB DEFAULT '[]'::jsonb,
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  medical_clearance BOOLEAN DEFAULT false,
  doctor_notes TEXT,
  flagged_high_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips Table (Actual Tour Executions)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circuit_id UUID REFERENCES circuits(id) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  coordinator_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
  group_size INT DEFAULT 0,
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  current_location_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Daily Updates Table
CREATE TABLE IF NOT EXISTS trip_daily_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) NOT NULL,
  date DATE NOT NULL,
  activity_description TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  health_status_summary TEXT,
  incidents_or_issues TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  payment_status VARCHAR(50) CHECK (payment_status IN ('success', 'failed', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  customer_id UUID REFERENCES users(id) NOT NULL,
  circuit_id UUID REFERENCES circuits(id) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  medical_support_rating INT CHECK (medical_support_rating >= 1 AND medical_support_rating <= 5),
  comfort_rating INT CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  accessibility_rating INT CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  spiritual_fulfillment_rating INT CHECK (spiritual_fulfillment_rating >= 1 AND spiritual_fulfillment_rating <= 5),
  staff_behavior_rating INT CHECK (staff_behavior_rating >= 1 AND staff_behavior_rating <= 5),
  photos JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for Circuits (Public Read)
CREATE POLICY "Anyone can view active circuits"
  ON circuits FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for Bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = pilgrim_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for Medical Assessments
CREATE POLICY "Users can view own medical assessments"
  ON medical_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = pilgrim_id OR auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_id
  ));

CREATE POLICY "Users can create medical assessments"
  ON medical_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = pilgrim_id OR auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_id
  ));

-- RLS Policies for Payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_id
  ));

-- RLS Policies for Reviews
CREATE POLICY "Users can view approved reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Users can create reviews for own bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for Emergency Contacts
CREATE POLICY "Users can view emergency contacts for own bookings"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_id
  ));

CREATE POLICY "Users can manage emergency contacts for own bookings"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_id
  ));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_circuit_id ON bookings(circuit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_circuits_active ON circuits(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_circuit_id ON reviews(circuit_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_medical_assessments_booking_id ON medical_assessments(booking_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_circuits_updated_at ON circuits;
CREATE TRIGGER update_circuits_updated_at BEFORE UPDATE ON circuits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_assessments_updated_at ON medical_assessments;
CREATE TRIGGER update_medical_assessments_updated_at BEFORE UPDATE ON medical_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();