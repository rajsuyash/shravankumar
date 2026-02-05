import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingData, resetBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // Require authentication for booking
    if (!user) {
      alert('Please sign in to complete your booking');
      navigate('/login?redirect=/booking/payment');
      return;
    }

    setProcessing(true);

    try {
      const bookingReference = `SK${Date.now().toString().slice(-8)}`;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingReference,
          customer_id: user.id,
          circuit_id: bookingData.circuitId,
          departure_date: bookingData.departureDate,
          return_date: bookingData.returnDate,
          number_of_travelers: bookingData.numberOfTravelers,
          total_price: bookingData.totalPrice,
          payment_status: 'completed',
          booking_status: 'confirmed',
          traveler_details: bookingData.travelers,
          special_requirements: bookingData.specialRequirements,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      await supabase.from('emergency_contacts').insert({
        booking_id: booking.id,
        name: bookingData.emergencyContact.name,
        relationship: bookingData.emergencyContact.relationship,
        phone: bookingData.emergencyContact.phone,
        email: bookingData.emergencyContact.email,
        is_primary: true,
      });

      const medicalAssessmentPromises = bookingData.travelers.map((_traveler, index) => {
        const assessment = bookingData.medicalAssessments[index];
        return supabase.from('medical_assessments').insert({
          booking_id: booking.id,
          pilgrim_id: user.id,
          chronic_diseases: assessment?.chronicDiseases || [],
          medications: assessment?.medications || [],
          allergies: assessment?.allergies || '',
          mobility_level: assessment?.mobilityLevel || 'full',
          oxygen_required: assessment?.oxygenRequired || false,
          dietary_restrictions: assessment?.dietaryRestrictions || '',
          medical_clearance: false,
          flagged_high_risk: false,
        });
      });

      await Promise.all(medicalAssessmentPromises);

      await supabase.from('payments').insert({
        booking_id: booking.id,
        amount: bookingData.totalPrice,
        payment_method: 'demo',
        payment_status: 'success',
      });

      navigate(`/booking/confirmation?ref=${bookingReference}`);
      resetBooking();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData.circuitId) {
    navigate('/circuits');
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-[1000px] mx-auto px-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8"
        >
          <Icon name="arrow_back" />
          <span>Back to Medical Assessment</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-8 border border-[#e7dfda]">
              <h1 className="text-3xl font-bold text-[#181410] mb-6">Payment</h1>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="verified_user" className="text-green-600 text-3xl" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-2">Secure Payment</h3>
                    <p className="text-sm text-green-800">
                      Your payment is secured with bank-level encryption. We never store your card
                      details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon name="payment" className="text-primary text-2xl" />
                      <div>
                        <p className="font-bold text-[#181410]">Pay with Card / UPI / Net Banking</p>
                        <p className="text-sm text-gray-600">Powered by Razorpay</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click the button below to proceed to our secure payment gateway
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Icon name="info" className="text-blue-600 text-xl" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-2">Payment Information</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Full payment required to confirm booking</li>
                        <li>Instant confirmation upon successful payment</li>
                        <li>
                          100% refund if cancelled 14+ days before departure (processing fees may
                          apply)
                        </li>
                        <li>Medical team will review assessments within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 text-primary rounded mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-primary underline">
                        Terms and Conditions
                      </a>
                      ,{' '}
                      <a href="#" className="text-primary underline">
                        Cancellation Policy
                      </a>
                      , and{' '}
                      <a href="#" className="text-primary underline">
                        Medical Disclosure Agreement
                      </a>
                      . I understand that accurate medical information is crucial for the safety of
                      all travelers.
                    </span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={!agreedToTerms || processing}
                >
                  {processing ? (
                    <>
                      <Icon name="progress_activity" className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon name="lock" className="mr-2" />
                      Proceed to Secure Payment - ₹{bookingData.totalPrice.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-[#e7dfda] sticky top-24">
              <h3 className="font-bold text-[#181410] mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Journey</p>
                  <p className="font-medium text-[#181410]">{bookingData.circuitName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-medium text-[#181410]">
                      {bookingData.departureDate
                        ? format(new Date(bookingData.departureDate), 'dd MMM yyyy')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return</p>
                    <p className="font-medium text-[#181410]">
                      {bookingData.returnDate
                        ? format(new Date(bookingData.returnDate), 'dd MMM yyyy')
                        : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  {bookingData.travelers.map((traveler, index) => (
                    <p key={index} className="text-sm text-[#181410]">
                      {traveler.firstName} {traveler.lastName} ({traveler.age}yrs)
                    </p>
                  ))}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-sm text-[#181410]">
                    {bookingData.emergencyContact.name} ({bookingData.emergencyContact.relationship}
                    )
                  </p>
                  <p className="text-sm text-gray-600">{bookingData.emergencyContact.phone}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">
                    ₹
                    {(
                      bookingData.circuitPrice * bookingData.numberOfTravelers
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medical Surcharge</span>
                  <span className="font-medium">
                    ₹
                    {(
                      bookingData.medicalSurcharge * bookingData.numberOfTravelers
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Travelers</span>
                  <span className="font-medium">{bookingData.numberOfTravelers}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-[#181410]">Total Amount</span>
                  <span className="font-bold text-primary text-xl">
                    ₹{bookingData.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Icon name="check_circle" />
                  <span>100% Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
