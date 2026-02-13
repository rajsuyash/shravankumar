import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';
import { queueBookingConfirmationEmail } from '../lib/emailService';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';
import toast from '../lib/toast';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
const isRazorpayEnabled = Boolean(RAZORPAY_KEY_ID && window.Razorpay);

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingData, resetBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  /**
   * Creates a Razorpay order server-side via Supabase Edge Function.
   */
  const createServerOrder = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount: bookingData.totalPrice,
        currency: 'INR',
        circuit_id: bookingData.circuitId,
        notes: { travelers: String(bookingData.numberOfTravelers) },
      },
    });

    if (error || !data?.order_id) {
      throw new Error('Failed to create payment order. Please try again.');
    }

    return data as { order_id: string; amount: number; currency: string; key_id: string };
  }, [bookingData]);

  /**
   * Verifies Razorpay payment signature server-side.
   */
  const verifyPaymentServer = useCallback(
    async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      });

      if (error || !data?.verified) {
        throw new Error('Payment verification failed. Please contact support.');
      }

      return data as { verified: boolean; order_id: string; payment_id: string };
    },
    []
  );

  /**
   * Creates the booking and all associated records in Supabase.
   * Called only after successful and verified payment.
   */
  const createBookingRecords = useCallback(
    async (paymentMethod: string, paymentId?: string, orderId?: string) => {
      const bookingReference = `BK${Date.now().toString().slice(-8)}`;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingReference,
          customer_id: user?.id,
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
          pilgrim_id: user?.id,
          chronic_diseases: assessment?.chronicDiseases || [],
          medications: assessment?.medications || [],
          allergies: assessment?.allergies || '',
          mobility_level: assessment?.mobilityLevel || 'full',
          oxygen_required: assessment?.oxygenRequired || false,
          dietary_restrictions: assessment?.dietaryRestrictions || '',
          medical_documents: assessment?.medicalDocuments || [],
          medical_clearance: false,
          flagged_high_risk: false,
        });
      });

      await Promise.all(medicalAssessmentPromises);

      await supabase.from('payments').insert({
        booking_id: booking.id,
        amount: bookingData.totalPrice,
        payment_method: paymentMethod,
        payment_status: 'success',
        ...(paymentId ? { transaction_id: paymentId } : {}),
        ...(orderId ? { razorpay_order_id: orderId } : {}),
      });

      // Create in-app notification
      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed!',
          message: `Your booking for ${bookingData.circuitName} (Ref: ${bookingReference}) has been confirmed. Our medical team will review your assessments within 24 hours.`,
        });
      }

      // Queue booking confirmation email
      await queueBookingConfirmationEmail(
        {
          bookingReference,
          customerEmail: user?.email || '',
          customerName: bookingData.travelers[0]
            ? `${bookingData.travelers[0].firstName} ${bookingData.travelers[0].lastName}`
            : 'Valued Customer',
          circuitName: bookingData.circuitName,
          departureDate: bookingData.departureDate
            ? format(new Date(bookingData.departureDate), 'dd MMM yyyy')
            : '',
          returnDate: bookingData.returnDate
            ? format(new Date(bookingData.returnDate), 'dd MMM yyyy')
            : '',
          totalPrice: bookingData.totalPrice,
          numberOfTravelers: bookingData.numberOfTravelers,
        },
        bookingData.travelers.map((t) => ({
          firstName: t.firstName,
          lastName: t.lastName,
          age: t.age,
        })),
      );

      return bookingReference;
    },
    [user, bookingData]
  );

  /**
   * Opens Razorpay checkout modal with a server-created order_id.
   */
  const openRazorpayCheckout = useCallback(
    (orderId: string, keyId: string): Promise<RazorpaySuccessResponse> => {
      return new Promise((resolve, reject) => {
        const options: RazorpayOptions = {
          key: keyId,
          amount: Math.round(bookingData.totalPrice * 100),
          currency: 'INR',
          name: 'Shravan Kumar Pilgrimage',
          description: `Booking for ${bookingData.circuitName}`,
          order_id: orderId,
          prefill: {
            email: user?.email || '',
          },
          theme: {
            color: '#e36b2b',
          },
          handler: (response: RazorpaySuccessResponse) => {
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
            confirm_close: true,
          },
        };

        const razorpayInstance = new window.Razorpay(options);

        razorpayInstance.on('payment.failed', (response: RazorpayFailureResponse) => {
          reject(
            new Error(response.error.description || 'Payment failed. Please try again.')
          );
        });

        razorpayInstance.open();
      });
    },
    [bookingData, user]
  );

  /**
   * Handles the full secure payment flow:
   * 1. Create order server-side
   * 2. Open Razorpay checkout with order_id
   * 3. Verify signature server-side
   * 4. Create booking records only after verification
   */
  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      if (isRazorpayEnabled) {
        // Step 1: Create order server-side
        const order = await createServerOrder();

        // Step 2: Open Razorpay checkout with server-created order
        const paymentResponse = await openRazorpayCheckout(order.order_id, order.key_id);

        // Step 3: Verify payment signature server-side
        await verifyPaymentServer(
          paymentResponse.razorpay_order_id!,
          paymentResponse.razorpay_payment_id,
          paymentResponse.razorpay_signature!
        );

        // Step 4: Only create booking after verified payment
        const bookingReference = await createBookingRecords(
          'razorpay',
          paymentResponse.razorpay_payment_id,
          paymentResponse.razorpay_order_id
        );

        toast.success('Payment successful! Booking confirmed.');
        navigate(`/booking/confirmation?ref=${bookingReference}`);
        resetBooking();
      } else {
        // Demo / fallback payment flow
        const bookingReference = await createBookingRecords('demo');

        toast.success('Demo booking created successfully!');
        navigate(`/booking/confirmation?ref=${bookingReference}`);
        resetBooking();
      }
    } catch (error: unknown) {
      console.error('Payment/booking error:', error);
      const message =
        error instanceof Error ? error.message : 'There was an error processing your payment.';

      if (message !== 'Payment cancelled by user') {
        toast.error(message);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

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
                      details. All payments are verified server-side.
                    </p>
                  </div>
                </div>
              </div>

              {!isRazorpayEnabled && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon name="science" className="text-yellow-700 text-xl" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Demo Mode</p>
                      <p>
                        Razorpay is not configured. Payments will be simulated. Set
                        VITE_RAZORPAY_KEY_ID in your environment to enable live payments.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      <Link to="/terms" className="text-primary underline">
                        Terms and Conditions
                      </Link>
                      ,{' '}
                      <Link to="/cancellation-policy" className="text-primary underline">
                        Cancellation Policy
                      </Link>
                      , and{' '}
                      <Link to="/medical-disclosure" className="text-primary underline">
                        Medical Disclosure Agreement
                      </Link>
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
