import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingData, resetBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'demo'>('razorpay');

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isRazorpayConfigured = !!razorpayKeyId && razorpayKeyId !== 'your_razorpay_key_id';

  const createBookingInDatabase = async (paymentId: string, paymentMethod: string) => {
    const bookingReference = `SK${Date.now().toString().slice(-8)}`;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        customer_id: user!.id,
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

    // Create emergency contact
    await supabase.from('emergency_contacts').insert({
      booking_id: booking.id,
      name: bookingData.emergencyContact.name,
      relationship: bookingData.emergencyContact.relationship,
      phone: bookingData.emergencyContact.phone,
      email: bookingData.emergencyContact.email,
      is_primary: true,
    });

    // Create medical assessments for each traveler
    const medicalAssessmentPromises = bookingData.travelers.map((_traveler, index) => {
      const assessment = bookingData.medicalAssessments[index];
      return supabase.from('medical_assessments').insert({
        booking_id: booking.id,
        pilgrim_id: user!.id,
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

    // Record payment
    await supabase.from('payments').insert({
      booking_id: booking.id,
      amount: bookingData.totalPrice,
      payment_method: paymentMethod,
      razorpay_payment_id: paymentId,
      payment_status: 'success',
    });

    return bookingReference;
  };

  const handleRazorpayPayment = () => {
    if (!isRazorpayConfigured) {
      alert('Razorpay is not configured. Please use demo mode or configure Razorpay.');
      return;
    }

    const primaryTraveler = bookingData.travelers[0];
    
    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: bookingData.totalPrice * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Shravan Kumar',
      description: `Booking: ${bookingData.circuitName}`,
      image: '/logo.png',
      prefill: {
        name: `${primaryTraveler.firstName} ${primaryTraveler.lastName}`,
        email: primaryTraveler.email,
        contact: primaryTraveler.phone,
      },
      notes: {
        circuit_name: bookingData.circuitName,
        travelers: String(bookingData.numberOfTravelers),
        departure_date: bookingData.departureDate,
      },
      theme: {
        color: '#C45500',
      },
      handler: async (response: RazorpayResponse) => {
        setProcessing(true);
        try {
          const bookingRef = await createBookingInDatabase(
            response.razorpay_payment_id,
            'razorpay'
          );
          navigate(`/booking/confirmation?ref=${bookingRef}`);
          resetBooking();
        } catch (error) {
          console.error('Error creating booking:', error);
          alert('Payment successful but booking creation failed. Please contact support.');
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleDemoPayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingRef = await createBookingInDatabase('DEMO_' + Date.now(), 'demo');
      navigate(`/booking/confirmation?ref=${bookingRef}`);
      resetBooking();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!user) {
      alert('Please sign in to complete your booking');
      navigate('/login?redirect=/booking/payment');
      return;
    }

    if (paymentMode === 'razorpay' && isRazorpayConfigured) {
      handleRazorpayPayment();
    } else {
      handleDemoPayment();
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
                {/* Payment Mode Selection */}
                <div className="space-y-3">
                  <p className="font-medium text-gray-700">Select Payment Method</p>
                  
                  <label 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMode === 'razorpay' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="razorpay"
                      checked={paymentMode === 'razorpay'}
                      onChange={() => setPaymentMode('razorpay')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Icon name="payment" className="text-primary text-2xl" />
                      <div>
                        <p className="font-bold text-[#181410]">Pay with Card / UPI / Net Banking</p>
                        <p className="text-sm text-gray-600">
                          {isRazorpayConfigured ? 'Powered by Razorpay' : 'Razorpay not configured - will use demo mode'}
                        </p>
                      </div>
                    </div>
                    {!isRazorpayConfigured && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Demo</span>
                    )}
                  </label>

                  <label 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMode === 'demo' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="demo"
                      checked={paymentMode === 'demo'}
                      onChange={() => setPaymentMode('demo')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Icon name="science" className="text-amber-600 text-2xl" />
                      <div>
                        <p className="font-bold text-[#181410]">Demo Mode (Testing)</p>
                        <p className="text-sm text-gray-600">Skip payment for testing purposes</p>
                      </div>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Test</span>
                  </label>
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
                      {paymentMode === 'demo' ? 'Complete Booking (Demo)' : 'Pay Now'} - ₹{bookingData.totalPrice.toLocaleString()}
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
