import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';
import { Circuit } from '../types/database';
import { Button, Icon } from '../components/ui';
import { format, addDays } from 'date-fns';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const circuitId = searchParams.get('circuit');

  const { bookingData, updateBookingData } = useBooking();
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    departureDate: bookingData.departureDate || '',
    numberOfTravelers: bookingData.numberOfTravelers || 1,
    travelers: bookingData.travelers.length > 0 ? bookingData.travelers : [
      {
        firstName: '',
        lastName: '',
        age: 0,
        gender: '',
        phone: '',
        email: '',
        relationship: 'self',
      },
    ],
    emergencyContact: bookingData.emergencyContact || {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    specialRequirements: bookingData.specialRequirements || '',
  });

  useEffect(() => {
    if (circuitId) {
      fetchCircuit(circuitId);
    }
  }, [circuitId]);

  const fetchCircuit = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCircuit(data);
        if (!bookingData.circuitId) {
          updateBookingData({
            circuitId: data.id,
            circuitName: data.name,
            circuitPrice: data.base_price,
            medicalSurcharge: data.medical_surcharge,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching circuit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTravelerChange = (index: number, field: string, value: string | number) => {
    const updatedTravelers = [...formData.travelers];
    updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
    setFormData({ ...formData, travelers: updatedTravelers });
  };

  const handleNumberOfTravelersChange = (num: number) => {
    const travelers = [...formData.travelers];
    if (num > travelers.length) {
      for (let i = travelers.length; i < num; i++) {
        travelers.push({
          firstName: '',
          lastName: '',
          age: 0,
          gender: '',
          phone: '',
          email: '',
          relationship: 'family',
        });
      }
    } else {
      travelers.splice(num);
    }
    setFormData({ ...formData, numberOfTravelers: num, travelers });
  };

  const validateStep1 = () => {
    return formData.departureDate && formData.numberOfTravelers > 0;
  };

  const validateStep2 = () => {
    return formData.travelers.every(
      (t) => t.firstName && t.lastName && t.age > 0 && t.gender && t.phone && t.email
    );
  };

  const validateStep3 = () => {
    return (
      formData.emergencyContact.name &&
      formData.emergencyContact.relationship &&
      formData.emergencyContact.phone
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      alert('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      alert('Please fill in all traveler details');
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      alert('Please provide emergency contact details');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!circuit) return;

    const returnDate = format(
      addDays(new Date(formData.departureDate), circuit.duration_days - 1),
      'yyyy-MM-dd'
    );

    const totalPrice =
      (circuit.base_price + circuit.medical_surcharge) * formData.numberOfTravelers;

    updateBookingData({
      ...formData,
      returnDate,
      totalPrice,
    });

    navigate('/booking/medical-assessment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Circuit not found</h2>
          <Button onClick={() => navigate('/circuits')}>Browse Circuits</Button>
        </div>
      </div>
    );
  }

  const minDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-[1000px] mx-auto px-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8"
        >
          <Icon name="arrow_back" />
          <span>Back to Circuit</span>
        </button>

        <div className="bg-white rounded-xl p-8 border border-[#e7dfda] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={circuit.featured_image_url}
              alt={circuit.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#181410]">{circuit.name}</h1>
              <p className="text-gray-600">
                {circuit.duration_days} Days | Starting from ₹
                {circuit.base_price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-3 ${
                  step < currentStep
                    ? 'text-green-600'
                    : step === currentStep
                    ? 'text-primary'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {step < currentStep ? <Icon name="check" /> : step}
                </div>
                <span className="font-medium text-sm">
                  {step === 1 && 'Journey Details'}
                  {step === 2 && 'Traveler Info'}
                  {step === 3 && 'Emergency Contact'}
                </span>
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#181410]">Journey Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date *
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Booking must be made at least 7 days in advance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Travelers *
                </label>
                <select
                  value={formData.numberOfTravelers}
                  onChange={(e) => handleNumberOfTravelersChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Icon name="info" className="text-blue-600 text-xl mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>All travelers must be 55 years or older</li>
                      <li>Medical assessment required for all travelers</li>
                      <li>Refund policy: 100% refund if cancelled 14+ days before departure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#181410]">Traveler Information</h2>

              {formData.travelers.map((traveler, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#181410] mb-4">
                    Traveler {index + 1}
                    {index === 0 && ' (Primary)'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={traveler.firstName}
                        onChange={(e) =>
                          handleTravelerChange(index, 'firstName', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={traveler.lastName}
                        onChange={(e) =>
                          handleTravelerChange(index, 'lastName', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="55"
                        value={traveler.age || ''}
                        onChange={(e) =>
                          handleTravelerChange(index, 'age', parseInt(e.target.value))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        value={traveler.gender}
                        onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={traveler.phone}
                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={traveler.email}
                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#181410]">Emergency Contact</h2>
              <p className="text-gray-600">
                Please provide someone we can contact in case of emergency during the journey
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Son, Daughter, Spouse"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, email: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements or Requests (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.specialRequirements}
                  onChange={(e) =>
                    setFormData({ ...formData, specialRequirements: e.target.value })
                  }
                  placeholder="Any dietary restrictions, special assistance needed, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                <Icon name="arrow_back" className="mr-2" />
                Previous
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className={currentStep === 1 ? 'ml-auto' : ''}
            >
              {currentStep === 3 ? 'Continue to Medical Assessment' : 'Next'}
              <Icon name="arrow_forward" className="ml-2" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
          <h3 className="font-bold text-[#181410] mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price per person</span>
              <span className="font-medium">₹{circuit.base_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Medical Surcharge per person</span>
              <span className="font-medium">₹{circuit.medical_surcharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Travelers</span>
              <span className="font-medium">{formData.numberOfTravelers}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-[#181410]">Total Amount</span>
              <span className="font-bold text-primary text-lg">
                ₹
                {(
                  (circuit.base_price + circuit.medical_surcharge) *
                  formData.numberOfTravelers
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
