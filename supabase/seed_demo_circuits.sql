-- Demo Circuit Data for Shravan Kumar Pilgrimage
-- Run this in your Supabase SQL Editor to add sample circuits

-- First, delete any existing circuits (optional - remove if you want to keep existing data)
-- DELETE FROM circuits;

-- Insert Demo Circuits
INSERT INTO circuits (
  id,
  name,
  description,
  duration_days,
  difficulty_level,
  accessibility_rating,
  base_price,
  medical_surcharge,
  max_group_size,
  min_age,
  starts_from_city,
  featured_image_url,
  images,
  itinerary,
  included_services,
  excluded_services,
  medical_support_details,
  accommodation_details,
  transportation_details,
  cancellation_policy,
  is_active,
  display_order,
  destinations,
  departure_cities
) VALUES
-- Circuit 1: Kashi Vishwanath Yatra
(
  uuid_generate_v4(),
  'Kashi Vishwanath Darshan',
  'Experience the divine energy of Varanasi, the spiritual capital of India. Visit the sacred Kashi Vishwanath Temple, witness the mesmerizing Ganga Aarti, and take a holy dip in the Ganges. This carefully curated journey ensures comfort and safety for senior pilgrims while providing an unforgettable spiritual experience.',
  5,
  'Easy',
  5,
  24999.00,
  2500.00,
  15,
  55,
  'Delhi',
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Delhi to Varanasi", "activities": ["Departure from Delhi by AC Train/Flight", "Arrival in Varanasi", "Check-in at hotel", "Evening rest and acclimatization"], "accommodation": "Hotel Surya, Varanasi", "meals": ["Lunch", "Dinner"]},
    {"day": 2, "title": "Kashi Vishwanath Darshan", "activities": ["Early morning Ganga Snan", "Kashi Vishwanath Temple darshan", "Annapurna Temple visit", "Sankat Mochan Temple"], "accommodation": "Hotel Surya, Varanasi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Ganga Aarti & Temples", "activities": ["Morning boat ride on Ganges", "Tulsi Manas Temple", "Durga Temple", "Evening Ganga Aarti at Dashashwamedh Ghat"], "accommodation": "Hotel Surya, Varanasi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 4, "title": "Sarnath Excursion", "activities": ["Visit Sarnath - where Buddha gave first sermon", "Dhamek Stupa", "Sarnath Museum", "Free time for shopping"], "accommodation": "Hotel Surya, Varanasi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 5, "title": "Return Journey", "activities": ["Morning pooja at hotel", "Check-out", "Transfer to station/airport", "Return to Delhi"], "accommodation": null, "meals": ["Breakfast"]}
  ]'::jsonb,
  '["AC accommodation", "All meals (vegetarian)", "AC transportation", "Temple darshan arrangements", "24/7 medical support", "Tour coordinator", "Ganga boat ride", "All entry fees"]'::jsonb,
  '["Personal expenses", "Tips and gratituities", "Travel insurance", "Any items not mentioned in inclusions"]'::jsonb,
  'Dedicated paramedic on every trip. Daily BP and sugar monitoring. Oxygen cylinders available. Tie-up with Apollo Hospital Varanasi for emergencies. Wheelchair assistance at all temples.',
  '[{"hotelName": "Hotel Surya", "address": "The Mall, Varanasi", "roomType": "Deluxe AC Room", "amenities": ["AC", "Attached bathroom", "Hot water", "Room service", "Elevator access"]}]'::jsonb,
  '[{"vehicleType": "AC Tempo Traveller", "features": "Push-back seats, Low floor entry, First aid kit"}]'::jsonb,
  'Full refund if cancelled 30 days before departure. 50% refund for 15-29 days. No refund within 14 days of departure.',
  true,
  1,
  '["Varanasi", "Sarnath"]'::jsonb,
  '["Delhi", "Lucknow", "Patna"]'::jsonb
),

-- Circuit 2: Char Dham Yatra
(
  uuid_generate_v4(),
  'Char Dham Yatra - Complete Circuit',
  'Embark on the holiest pilgrimage in Hinduism - the Char Dham Yatra covering Yamunotri, Gangotri, Kedarnath, and Badrinath. Our specially designed itinerary ensures adequate rest and acclimatization for senior pilgrims with comprehensive medical support throughout the journey.',
  12,
  'Moderate',
  3,
  54999.00,
  5000.00,
  12,
  55,
  'Delhi',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800", "https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Delhi to Haridwar", "activities": ["Departure from Delhi", "Arrival in Haridwar", "Evening Ganga Aarti"], "accommodation": "Hotel Ganga Lahari, Haridwar", "meals": ["Dinner"]},
    {"day": 2, "title": "Haridwar to Barkot", "activities": ["Drive to Barkot via Mussoorie", "Rest and acclimatization"], "accommodation": "Hotel in Barkot", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Yamunotri Darshan", "activities": ["Drive to Janki Chatti", "Trek/Palki to Yamunotri", "Temple darshan", "Return to Barkot"], "accommodation": "Hotel in Barkot", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 4, "title": "Barkot to Uttarkashi", "activities": ["Scenic drive to Uttarkashi", "Visit Vishwanath Temple", "Rest day"], "accommodation": "Hotel in Uttarkashi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 5, "title": "Gangotri Darshan", "activities": ["Drive to Gangotri", "Temple darshan", "Holy dip in Bhagirathi", "Return to Uttarkashi"], "accommodation": "Hotel in Uttarkashi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 6, "title": "Uttarkashi to Guptkashi", "activities": ["Drive to Guptkashi", "Visit Ardh Narishwar Temple", "Rest"], "accommodation": "Hotel in Guptkashi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 7, "title": "Kedarnath Darshan", "activities": ["Drive to Sonprayag", "Helicopter/Palki to Kedarnath", "Temple darshan", "Return to Guptkashi"], "accommodation": "Hotel in Guptkashi", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 8, "title": "Guptkashi to Badrinath", "activities": ["Scenic drive via Chopta", "Arrive Badrinath", "Evening aarti"], "accommodation": "Hotel in Badrinath", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 9, "title": "Badrinath Darshan", "activities": ["Early morning darshan", "Mana Village visit", "Tapt Kund holy dip"], "accommodation": "Hotel in Badrinath", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 10, "title": "Badrinath to Rudraprayag", "activities": ["Drive to Rudraprayag", "Visit Rudranath Temple", "Rest"], "accommodation": "Hotel in Rudraprayag", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 11, "title": "Rudraprayag to Rishikesh", "activities": ["Drive to Rishikesh", "Visit Ram Jhula, Laxman Jhula", "Evening aarti"], "accommodation": "Hotel in Rishikesh", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 12, "title": "Return to Delhi", "activities": ["Morning visit to ashrams", "Drive to Delhi", "Tour concludes"], "accommodation": null, "meals": ["Breakfast"]}
  ]'::jsonb,
  '["AC accommodation throughout", "All meals (pure vegetarian)", "AC transportation", "Helicopter tickets for Kedarnath (subject to availability)", "Palki/Pony charges", "24/7 medical team", "Oxygen cylinders", "All temple arrangements", "Tour manager"]'::jsonb,
  '["Personal expenses", "Travel insurance", "Any items not in inclusions", "Extra helicopter trips"]'::jsonb,
  'Full medical team including doctor and paramedic. Portable oxygen concentrators. Daily health monitoring. Tie-ups with hospitals in Dehradun and Rishikesh. Acclimatization days built into itinerary.',
  '[{"hotelName": "Various 3-star hotels", "roomType": "Deluxe rooms with heating", "amenities": ["Hot water", "Room heater", "Attached bathroom", "Room service"]}]'::jsonb,
  '[{"vehicleType": "Force Traveller 4x4", "features": "High ground clearance, Comfortable seating, Oxygen cylinder, First aid"}]'::jsonb,
  'Full refund 45 days before. 75% refund 30-44 days. 50% refund 15-29 days. No refund within 14 days.',
  true,
  2,
  '["Yamunotri", "Gangotri", "Kedarnath", "Badrinath", "Rishikesh", "Haridwar"]'::jsonb,
  '["Delhi", "Dehradun", "Haridwar"]'::jsonb
),

-- Circuit 3: Tirupati Balaji Darshan
(
  uuid_generate_v4(),
  'Tirupati Balaji VIP Darshan',
  'Seek blessings of Lord Venkateswara at the world-famous Tirumala Temple. Our VIP darshan package ensures minimal waiting time and comfortable journey for senior pilgrims. Includes special darshan tickets and all arrangements.',
  3,
  'Easy',
  5,
  18999.00,
  1500.00,
  20,
  55,
  'Chennai',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", "https://images.unsplash.com/photo-1621496503717-09bf79c9fd75?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Chennai to Tirupati", "activities": ["Departure from Chennai", "Arrival in Tirupati", "Visit Padmavathi Temple", "Check-in and rest"], "accommodation": "Hotel Bliss, Tirupati", "meals": ["Lunch", "Dinner"]},
    {"day": 2, "title": "Tirumala Darshan", "activities": ["Early morning transfer to Tirumala", "VIP Darshan of Lord Venkateswara", "Laddu prasadam", "Visit other temples", "Return to Tirupati"], "accommodation": "Hotel Bliss, Tirupati", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Return Journey", "activities": ["Visit Kalahasti Temple", "Return to Chennai", "Tour concludes"], "accommodation": null, "meals": ["Breakfast", "Lunch"]}
  ]'::jsonb,
  '["AC accommodation", "All meals (South Indian vegetarian)", "AC transportation", "VIP darshan tickets", "Laddu prasadam", "Medical support", "All temple arrangements"]'::jsonb,
  '["Personal expenses", "Special poojas", "Hair offering (Mundan)", "Travel insurance"]'::jsonb,
  'Paramedic support throughout. Wheelchair assistance available. Tie-up with SVIMS Hospital. Oxygen support if needed.',
  '[{"hotelName": "Hotel Bliss", "address": "TP Area, Tirupati", "roomType": "AC Deluxe", "amenities": ["AC", "Hot water", "South Indian restaurant", "Elevator"]}]'::jsonb,
  '[{"vehicleType": "AC Innova/Tempo Traveller", "features": "Comfortable seating, Luggage space"}]'::jsonb,
  'Full refund 15 days before. 50% refund 7-14 days. No refund within 7 days.',
  true,
  3,
  '["Tirupati", "Tirumala", "Kalahasti"]'::jsonb,
  '["Chennai", "Bangalore", "Hyderabad"]'::jsonb
),

-- Circuit 4: Dwarka-Somnath Gujarat Pilgrimage
(
  uuid_generate_v4(),
  'Dwarka-Somnath Divine Circuit',
  'Visit the sacred abodes of Lord Krishna at Dwarka and Lord Shiva at Somnath. This Gujarat pilgrimage covers the legendary Dwarkadhish Temple and the first of twelve Jyotirlingas. Perfect for devotees seeking blessings of both Vishnu and Shiva.',
  6,
  'Easy',
  4,
  32999.00,
  3000.00,
  15,
  55,
  'Ahmedabad',
  'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800", "https://images.unsplash.com/photo-1621275471769-e6aa344546d5?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Ahmedabad to Dwarka", "activities": ["Flight/Train to Jamnagar", "Drive to Dwarka", "Evening aarti at Dwarkadhish"], "accommodation": "Hotel Dwarka Residency", "meals": ["Dinner"]},
    {"day": 2, "title": "Dwarka Darshan", "activities": ["Early morning darshan Dwarkadhish Temple", "Bet Dwarka visit", "Rukmini Temple", "Gomti Ghat"], "accommodation": "Hotel Dwarka Residency", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Dwarka to Porbandar", "activities": ["Drive to Porbandar", "Kirti Mandir (Gandhi birthplace)", "Sudama Temple"], "accommodation": "Hotel in Porbandar", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 4, "title": "Porbandar to Somnath", "activities": ["Drive to Somnath", "Evening Sound & Light show", "Somnath Temple aarti"], "accommodation": "Hotel in Somnath", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 5, "title": "Somnath & Junagadh", "activities": ["Morning darshan Somnath", "Drive to Junagadh", "Girnar foothills darshan", "Return to Somnath"], "accommodation": "Hotel in Somnath", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 6, "title": "Return Journey", "activities": ["Morning aarti", "Drive to Rajkot airport", "Return flight"], "accommodation": null, "meals": ["Breakfast"]}
  ]'::jsonb,
  '["AC accommodation", "All meals (Gujarati thali)", "AC transportation", "Temple darshan arrangements", "Sound & Light show tickets", "Medical support", "Tour guide"]'::jsonb,
  '["Airfare", "Personal expenses", "Special poojas", "Travel insurance"]'::jsonb,
  'Paramedic on all days. First aid and basic medicines. Tie-up with hospitals in Jamnagar and Rajkot. Wheelchair available.',
  '[{"hotelName": "Various 3-star hotels", "roomType": "AC Deluxe", "amenities": ["AC", "Attached bath", "Restaurant", "Parking"]}]'::jsonb,
  '[{"vehicleType": "AC Tempo Traveller", "features": "Push-back seats, Luggage carrier, First aid kit"}]'::jsonb,
  'Full refund 21 days before. 50% refund 10-20 days. No refund within 10 days.',
  true,
  4,
  '["Dwarka", "Somnath", "Porbandar", "Junagadh"]'::jsonb,
  '["Ahmedabad", "Rajkot", "Mumbai"]'::jsonb
),

-- Circuit 5: Rameshwaram & Madurai
(
  uuid_generate_v4(),
  'Rameshwaram & Madurai Sacred Journey',
  'Visit the holy Ramanathaswamy Temple at Rameshwaram and the magnificent Meenakshi Temple at Madurai. Experience the spiritual essence of Tamil Nadu with comfortable arrangements for senior pilgrims.',
  4,
  'Easy',
  4,
  21999.00,
  2000.00,
  18,
  55,
  'Chennai',
  'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Chennai to Rameshwaram", "activities": ["Train/Flight to Madurai", "Drive to Rameshwaram", "Evening aarti"], "accommodation": "Hotel Tamil Nadu, Rameshwaram", "meals": ["Dinner"]},
    {"day": 2, "title": "Rameshwaram Darshan", "activities": ["22 Theertham holy bath", "Ramanathaswamy Temple darshan", "Dhanushkodi visit", "Gandamadana Parvatham"], "accommodation": "Hotel Tamil Nadu, Rameshwaram", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Rameshwaram to Madurai", "activities": ["Morning pooja", "Drive to Madurai", "Evening Meenakshi Temple darshan"], "accommodation": "Hotel in Madurai", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 4, "title": "Madurai & Return", "activities": ["Morning Meenakshi Temple darshan", "Thirumalai Nayak Palace", "Return journey to Chennai"], "accommodation": null, "meals": ["Breakfast", "Lunch"]}
  ]'::jsonb,
  '["AC accommodation", "All meals (South Indian)", "AC transportation", "Temple darshan assistance", "22 Theertham arrangements", "Medical support", "Guide services"]'::jsonb,
  '["Personal expenses", "Special poojas", "Travel insurance", "Camera fees"]'::jsonb,
  'Paramedic available. Basic medicines provided. Hospital tie-ups in Madurai. Wheelchair assistance at temples.',
  '[{"hotelName": "Various hotels", "roomType": "AC rooms", "amenities": ["AC", "Hot water", "Restaurant", "Room service"]}]'::jsonb,
  '[{"vehicleType": "AC Innova/Tempo Traveller", "features": "Comfortable seating, Good suspension"}]'::jsonb,
  'Full refund 15 days before. 50% refund 7-14 days. No refund within 7 days.',
  true,
  5,
  '["Rameshwaram", "Madurai", "Dhanushkodi"]'::jsonb,
  '["Chennai", "Madurai", "Trichy"]'::jsonb
),

-- Circuit 6: Puri Jagannath & Konark
(
  uuid_generate_v4(),
  'Puri Jagannath & Konark Sun Temple',
  'Seek blessings at the famous Jagannath Temple in Puri and witness the architectural marvel of Konark Sun Temple. This Odisha pilgrimage offers a perfect blend of spirituality and cultural heritage.',
  4,
  'Easy',
  5,
  19999.00,
  1800.00,
  20,
  55,
  'Bhubaneswar',
  'https://images.unsplash.com/photo-1590766940554-634827d4e063?w=800&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1590766940554-634827d4e063?w=800", "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800"]'::jsonb,
  '[
    {"day": 1, "title": "Arrival in Bhubaneswar", "activities": ["Arrival at Bhubaneswar", "Visit Lingaraj Temple", "Mukteshwar Temple", "Transfer to Puri"], "accommodation": "Hotel Hans Coco Palms, Puri", "meals": ["Lunch", "Dinner"]},
    {"day": 2, "title": "Puri Darshan", "activities": ["Early morning Jagannath Temple darshan", "Gundicha Temple", "Puri Beach", "Evening aarti"], "accommodation": "Hotel Hans Coco Palms, Puri", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 3, "title": "Konark Excursion", "activities": ["Visit Konark Sun Temple", "Chandrabhaga Beach", "Raghurajpur Artist Village", "Return to Puri"], "accommodation": "Hotel Hans Coco Palms, Puri", "meals": ["Breakfast", "Lunch", "Dinner"]},
    {"day": 4, "title": "Return Journey", "activities": ["Morning darshan", "Drive to Bhubaneswar", "Departure"], "accommodation": null, "meals": ["Breakfast"]}
  ]'::jsonb,
  '["AC accommodation", "All meals (Odia cuisine)", "AC transportation", "Temple darshan arrangements", "All entry fees", "Medical support", "Tour guide"]'::jsonb,
  '["Personal expenses", "Special poojas", "Mahaprasad charges", "Travel insurance"]'::jsonb,
  'Paramedic support. Basic medical kit. Hospital tie-up with AIIMS Bhubaneswar. Wheelchair assistance available.',
  '[{"hotelName": "Hotel Hans Coco Palms", "address": "Marine Drive, Puri", "roomType": "Sea View AC", "amenities": ["AC", "Sea view", "Restaurant", "Beach access"]}]'::jsonb,
  '[{"vehicleType": "AC Innova Crysta", "features": "Comfortable seating, Good AC, Luggage space"}]'::jsonb,
  'Full refund 15 days before. 50% refund 7-14 days. No refund within 7 days.',
  true,
  6,
  '["Puri", "Konark", "Bhubaneswar"]'::jsonb,
  '["Bhubaneswar", "Kolkata", "Hyderabad"]'::jsonb
);

-- Verify insertion
SELECT name, duration_days, base_price, difficulty_level, display_order
FROM circuits
WHERE is_active = true
ORDER BY display_order;
