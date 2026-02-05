import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';
import { generateBookingConfirmationPDF, generateItineraryPDF, downloadPDF } from '../lib/pdfGenerator';

interface TravelerDetail {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone?: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  departure_date: string;
  return_date: string;
  number_of_travelers: number;
  total_price: number;
  traveler_details: TravelerDetail[];
  special_requirements?: string;
  circuits: {
    name: string;
    starts_from_city: string;
    duration_days: number;
    itinerary?: Array<{
      day: number;
      title: string;
      activities: string[];
      accommodation?: string;
    }>;
  };
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingRef) {
      fetchBooking(bookingRef);
    }
  }, [bookingRef]);

  const fetchBooking = async (ref: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          circuits (
            name,
            starts_from_city,
            duration_days,
            itinerary
          )
        `
        )
        .eq('booking_reference', ref)
        .maybeSingle();

      if (error) throw error;
      setBooking(data);

      // Fetch emergency contact
      if (data?.id) {
        const { data: contactData } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('booking_id', data.id)
          .eq('is_primary', true)
          .maybeSingle();
        
        if (contactData) {
          setEmergencyContact(contactData);
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadConfirmation = () => {
    if (!booking) return;

    const pdfData = {
      bookingReference: booking.booking_reference,
      circuitName: booking.circuits.name,
      departureDate: booking.departure_date,
      returnDate: booking.return_date,
      numberOfTravelers: booking.number_of_travelers,
      totalPrice: booking.total_price,
      travelers: booking.traveler_details.map(t => ({
        firstName: t.firstName,
        lastName: t.lastName,
        age: t.age,
        gender: (t as TravelerDetail & { gender?: string }).gender || 'Not specified',
        phone: t.phone || '',
        email: t.email,
      })),
      emergencyContact: emergencyContact || {
        name: 'Not provided',
        relationship: 'N/A',
        phone: 'N/A',
      },
      specialRequirements: booking.special_requirements,
    };

    const doc = generateBookingConfirmationPDF(pdfData);
    downloadPDF(doc, `ShravanKumar-Booking-${booking.booking_reference}.pdf`);
  };

  const handleDownloadItinerary = () => {
    if (!booking || !booking.circuits.itinerary) {
      alert('Itinerary not available for this circuit');
      return;
    }

    const doc = generateItineraryPDF(
      booking.circuits.name,
      booking.circuits.itinerary,
      booking.departure_date
    );
    downloadPDF(doc, `ShravanKumar-Itinerary-${booking.circuits.name.replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <Button onClick={() => navigate('/circuits')}>Browse Circuits</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-[800px] mx-auto px-4 md:px-10">
        <div className="bg-white rounded-xl p-8 md:p-12 border border-[#e7dfda] text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="check_circle" className="text-green-600 text-5xl" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#181410] mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your sacred journey has been successfully booked
          </p>

          <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-lg">
            <Icon name="confirmation_number" className="text-primary text-2xl" />
            <div className="text-left">
              <p className="text-xs text-gray-600">Booking Reference</p>
              <p className="text-xl font-bold text-primary">{booking.booking_reference}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-[#e7dfda] mb-8">
          <h2 className="text-2xl font-bold text-[#181410] mb-6">Journey Details</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Icon name="temple_hindu" className="text-primary text-3xl" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Sacred Circuit</p>
                <p className="font-bold text-[#181410] text-lg">{booking.circuits.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.circuits.duration_days} Days | Starting from {booking.circuits.starts_from_city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Departure Date</p>
                <p className="font-bold text-[#181410]">
                  {format(new Date(booking.departure_date), 'dd MMMM yyyy')}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Return Date</p>
                <p className="font-bold text-[#181410]">
                  {format(new Date(booking.return_date), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Travelers</p>
              <div className="space-y-2">
                {booking.traveler_details.map((traveler: TravelerDetail, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="person" className="text-primary text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-[#181410]">
                        {traveler.firstName} {traveler.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {traveler.age} years | {traveler.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="payments" className="text-green-600 text-2xl" />
                <div>
                  <p className="font-bold text-green-900">Payment Successful</p>
                  <p className="text-sm text-green-700">
                    Amount Paid: ₹{booking.total_price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <Icon name="medical_services" className="text-blue-600 text-2xl mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <Icon name="check" className="text-blue-600 text-sm mt-0.5" />
                  <span>
                    Confirmation email sent to all travelers with detailed itinerary
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" className="text-blue-600 text-sm mt-0.5" />
                  <span>
                    Our medical team will review health assessments within 24 hours
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" className="text-blue-600 text-sm mt-0.5" />
                  <span>
                    Journey Coordinator will contact you 7 days before departure
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="check" className="text-blue-600 text-sm mt-0.5" />
                  <span>
                    Real-time tracking link will be shared with emergency contact
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e7dfda] mb-8">
          <h3 className="font-bold text-[#181410] mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="tel:+911234567890"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="call" className="text-primary text-xl" />
              </div>
              <div>
                <p className="font-medium text-[#181410]">Call Support</p>
                <p className="text-sm text-gray-600">+91 123 456 7890</p>
              </div>
            </a>
            <a
              href="mailto:support@shravankumar.com"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="email" className="text-primary text-xl" />
              </div>
              <div>
                <p className="font-medium text-[#181410]">Email Us</p>
                <p className="text-sm text-gray-600">support@shravankumar.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Download Actions */}
        <div className="bg-white rounded-xl p-6 border border-[#e7dfda] mb-8">
          <h3 className="font-bold text-[#181410] mb-4">Download Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadConfirmation}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="receipt_long" className="text-primary text-xl" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#181410]">Booking Confirmation</p>
                <p className="text-sm text-gray-600">Download PDF with all details</p>
              </div>
            </button>
            <button
              onClick={handleDownloadItinerary}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="map" className="text-primary text-xl" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#181410]">Journey Itinerary</p>
                <p className="text-sm text-gray-600">Day-by-day schedule PDF</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
            <Icon name="dashboard" className="mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/circuits')}>
            Browse More Journeys
          </Button>
        </div>
      </div>
    </div>
  );
};
