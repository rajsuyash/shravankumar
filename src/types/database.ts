export interface Circuit {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  difficulty_level: 'Easy' | 'Moderate' | 'Challenging';
  accessibility_rating: number;
  base_price: number;
  medical_surcharge: number;
  max_group_size: number;
  min_age: number;
  starts_from_city: string;
  featured_image_url: string;
  images: string[];
  itinerary: ItineraryDay[];
  included_services: string[];
  excluded_services?: string[];
  medical_support_details: string;
  accommodation_details?: any[];
  transportation_details?: any[];
  cancellation_policy?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  accommodation?: string;
  meals?: string[];
}

export interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  circuit_id: string;
  pilgrim_id?: string;
  booking_date: string;
  departure_date: string;
  return_date: string;
  number_of_travelers: number;
  total_price: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  booking_status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  group_id?: string;
  traveler_details: TravelerDetails[];
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface TravelerDetails {
  name: string;
  age: number;
  gender: string;
  id_proof: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  user_type: 'customer' | 'pilgrim' | 'staff' | 'admin' | 'medical_team';
  profile_photo_url?: string;
  emergency_contacts: EmergencyContact[];
  health_profile: any;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  circuit_id: string;
  rating: number;
  review_text?: string;
  medical_support_rating?: number;
  comfort_rating?: number;
  accessibility_rating?: number;
  spiritual_fulfillment_rating?: number;
  staff_behavior_rating?: number;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MedicalAssessment {
  id: string;
  booking_id: string;
  pilgrim_id: string;
  chronic_diseases: string[];
  medications: Medication[];
  allergies?: string;
  mobility_level: 'full' | 'limited' | 'wheelchair' | 'bed_ridden';
  oxygen_required: boolean;
  dietary_restrictions?: string;
  medical_documents: string[];
  assessment_date: string;
  medical_clearance: boolean;
  doctor_notes?: string;
  flagged_high_risk: boolean;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  purpose?: string;
}
