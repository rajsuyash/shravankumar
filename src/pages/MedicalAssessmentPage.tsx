import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { Button, Icon } from '../components/ui';

const commonDiseases = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Kidney Disease',
  'Thyroid Disorder',
];

const mobilityLevels = [
  { value: 'full', label: 'Full Mobility - Can walk independently' },
  { value: 'limited', label: 'Limited Mobility - Needs occasional assistance' },
  { value: 'wheelchair', label: 'Wheelchair User - Needs wheelchair' },
];

export const MedicalAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [currentTravelerIndex, setCurrentTravelerIndex] = useState(0);

  const [assessments, setAssessments] = useState<{ [key: number]: any }>(
    bookingData.medicalAssessments || {}
  );

  const [currentAssessment, setCurrentAssessment] = useState({
    chronicDiseases: assessments[currentTravelerIndex]?.chronicDiseases || [],
    medications: assessments[currentTravelerIndex]?.medications || [],
    allergies: assessments[currentTravelerIndex]?.allergies || '',
    mobilityLevel: assessments[currentTravelerIndex]?.mobilityLevel || 'full',
    oxygenRequired: assessments[currentTravelerIndex]?.oxygenRequired || false,
    dietaryRestrictions: assessments[currentTravelerIndex]?.dietaryRestrictions || '',
  });

  const [medicationInput, setMedicationInput] = useState('');

  const currentTraveler = bookingData.travelers[currentTravelerIndex];

  const handleDiseaseToggle = (disease: string) => {
    const diseases = [...currentAssessment.chronicDiseases];
    const index = diseases.indexOf(disease);
    if (index > -1) {
      diseases.splice(index, 1);
    } else {
      diseases.push(disease);
    }
    setCurrentAssessment({ ...currentAssessment, chronicDiseases: diseases });
  };

  const addMedication = () => {
    if (medicationInput.trim()) {
      setCurrentAssessment({
        ...currentAssessment,
        medications: [...currentAssessment.medications, medicationInput.trim()],
      });
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    const medications = [...currentAssessment.medications];
    medications.splice(index, 1);
    setCurrentAssessment({ ...currentAssessment, medications });
  };

  const saveCurrentAssessment = () => {
    setAssessments({
      ...assessments,
      [currentTravelerIndex]: currentAssessment,
    });
  };

  const handleNext = () => {
    saveCurrentAssessment();

    if (currentTravelerIndex < bookingData.travelers.length - 1) {
      const nextIndex = currentTravelerIndex + 1;
      setCurrentTravelerIndex(nextIndex);
      const nextAssessment = assessments[nextIndex] || {
        chronicDiseases: [],
        medications: [],
        allergies: '',
        mobilityLevel: 'full',
        oxygenRequired: false,
        dietaryRestrictions: '',
      };
      setCurrentAssessment(nextAssessment);
    } else {
      updateBookingData({ medicalAssessments: assessments });
      navigate('/booking/payment');
    }
  };

  const handlePrevious = () => {
    saveCurrentAssessment();
    if (currentTravelerIndex > 0) {
      const prevIndex = currentTravelerIndex - 1;
      setCurrentTravelerIndex(prevIndex);
      setCurrentAssessment(assessments[prevIndex] || {
        chronicDiseases: [],
        medications: [],
        allergies: '',
        mobilityLevel: 'full',
        oxygenRequired: false,
        dietaryRestrictions: '',
      });
    } else {
      navigate(-1);
    }
  };

  const validateAssessment = () => {
    return currentAssessment.mobilityLevel !== '';
  };

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-[900px] mx-auto px-4 md:px-10">
        <button
          onClick={() => navigate('/booking/new')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8"
        >
          <Icon name="arrow_back" />
          <span>Back to Booking Details</span>
        </button>

        <div className="bg-white rounded-xl p-8 border border-[#e7dfda]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#181410] mb-2">Medical Assessment</h1>
            <p className="text-gray-600">
              Help us ensure a safe and comfortable journey by providing health information
            </p>
          </div>

          <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Icon name="medical_services" className="text-blue-600 text-2xl" />
              <div>
                <p className="font-medium text-blue-900">
                  Assessment for: {currentTraveler?.firstName} {currentTraveler?.lastName}
                </p>
                <p className="text-sm text-blue-700">
                  Traveler {currentTravelerIndex + 1} of {bookingData.travelers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-[#181410] mb-4">
                Chronic Diseases or Medical Conditions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select all conditions that apply (if any)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonDiseases.map((disease) => (
                  <button
                    key={disease}
                    onClick={() => handleDiseaseToggle(disease)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      currentAssessment.chronicDiseases.includes(disease)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {disease}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#181410] mb-4">Current Medications</h3>
              <p className="text-sm text-gray-600 mb-4">
                List all medications being taken regularly
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  placeholder="e.g., Metformin 500mg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button variant="secondary" onClick={addMedication}>
                  <Icon name="add" />
                  Add
                </Button>
              </div>
              {currentAssessment.medications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentAssessment.medications.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                    >
                      <span className="text-sm text-green-900">{med}</span>
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-[#181410] mb-4">Allergies</h3>
              <textarea
                rows={3}
                value={currentAssessment.allergies}
                onChange={(e) =>
                  setCurrentAssessment({ ...currentAssessment, allergies: e.target.value })
                }
                placeholder="List any allergies to medications, foods, or environmental factors"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <h3 className="font-bold text-[#181410] mb-4">Mobility Level *</h3>
              <div className="space-y-3">
                {mobilityLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        currentAssessment.mobilityLevel === level.value ? '#d97706' : '#e5e7eb',
                      backgroundColor:
                        currentAssessment.mobilityLevel === level.value ? '#fef3c7' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="mobility"
                      value={level.value}
                      checked={currentAssessment.mobilityLevel === level.value}
                      onChange={(e) =>
                        setCurrentAssessment({
                          ...currentAssessment,
                          mobilityLevel: e.target.value,
                        })
                      }
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-medium text-gray-800">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={currentAssessment.oxygenRequired}
                  onChange={(e) =>
                    setCurrentAssessment({
                      ...currentAssessment,
                      oxygenRequired: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">Oxygen Support Required</p>
                  <p className="text-sm text-gray-600">
                    Check if traveler needs oxygen support during the journey
                  </p>
                </div>
              </label>
            </div>

            <div>
              <h3 className="font-bold text-[#181410] mb-4">Dietary Restrictions</h3>
              <textarea
                rows={3}
                value={currentAssessment.dietaryRestrictions}
                onChange={(e) =>
                  setCurrentAssessment({
                    ...currentAssessment,
                    dietaryRestrictions: e.target.value,
                  })
                }
                placeholder="e.g., Vegetarian, No spicy food, Diabetic diet"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="health_and_safety" className="text-amber-600 text-2xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Medical Team Review</p>
                  <p>
                    Our medical team will review this information and may contact you if additional
                    details are needed. We ensure appropriate medical support is arranged for your
                    journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button variant="secondary" onClick={handlePrevious}>
              <Icon name="arrow_back" className="mr-2" />
              {currentTravelerIndex === 0 ? 'Back to Booking' : 'Previous Traveler'}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!validateAssessment()}
            >
              {currentTravelerIndex < bookingData.travelers.length - 1
                ? 'Next Traveler'
                : 'Continue to Payment'}
              <Icon name="arrow_forward" className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
