import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { Button, Icon } from '../components/ui';
import { supabase } from '../lib/supabase';

interface DiabetesDetails {
  type: string;
  onInsulin: boolean;
  insulinType?: string;
  lastHbA1c?: string;
}

interface HeartConditionDetails {
  condition: string;
  hasPacemaker: boolean;
  lastEcgDate?: string;
}

interface MedicalAssessmentData {
  chronicDiseases: string[];
  medications: string[];
  allergies: string;
  mobilityLevel: string;
  oxygenRequired: boolean;
  dietaryRestrictions: string;
  // Conditional fields
  diabetesDetails?: DiabetesDetails;
  heartConditionDetails?: HeartConditionDetails;
  documents?: string[];
}

const commonDiseases = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Kidney Disease',
  'Thyroid Disorder',
  'COPD',
  'Parkinson\'s',
  'Dementia/Alzheimer\'s',
];

const mobilityLevels = [
  { value: 'full', label: 'Full Mobility - Can walk independently', icon: 'directions_walk' },
  { value: 'limited', label: 'Limited Mobility - Needs occasional assistance', icon: 'elderly' },
  { value: 'wheelchair', label: 'Wheelchair User - Needs wheelchair', icon: 'accessible' },
];

export const MedicalAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [currentTravelerIndex, setCurrentTravelerIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assessments, setAssessments] = useState<{ [key: number]: MedicalAssessmentData }>(
    bookingData.medicalAssessments || {}
  );

  const [currentAssessment, setCurrentAssessment] = useState<MedicalAssessmentData>({
    chronicDiseases: assessments[currentTravelerIndex]?.chronicDiseases || [],
    medications: assessments[currentTravelerIndex]?.medications || [],
    allergies: assessments[currentTravelerIndex]?.allergies || '',
    mobilityLevel: assessments[currentTravelerIndex]?.mobilityLevel || 'full',
    oxygenRequired: assessments[currentTravelerIndex]?.oxygenRequired || false,
    dietaryRestrictions: assessments[currentTravelerIndex]?.dietaryRestrictions || '',
    diabetesDetails: assessments[currentTravelerIndex]?.diabetesDetails,
    heartConditionDetails: assessments[currentTravelerIndex]?.heartConditionDetails,
    documents: assessments[currentTravelerIndex]?.documents || [],
  });

  const [medicationInput, setMedicationInput] = useState('');

  const currentTraveler = bookingData.travelers[currentTravelerIndex];

  // Check if specific conditions are selected
  const hasDiabetes = currentAssessment.chronicDiseases.includes('Diabetes');
  const hasHeartDisease = currentAssessment.chronicDiseases.includes('Heart Disease');

  const handleDiseaseToggle = (disease: string) => {
    const diseases = [...currentAssessment.chronicDiseases];
    const index = diseases.indexOf(disease);
    
    if (index > -1) {
      diseases.splice(index, 1);
      // Clear conditional fields when disease is deselected
      const updates: Partial<MedicalAssessmentData> = { chronicDiseases: diseases };
      if (disease === 'Diabetes') {
        updates.diabetesDetails = undefined;
      }
      if (disease === 'Heart Disease') {
        updates.heartConditionDetails = undefined;
      }
      setCurrentAssessment({ ...currentAssessment, ...updates });
    } else {
      diseases.push(disease);
      // Initialize conditional fields when disease is selected
      const updates: Partial<MedicalAssessmentData> = { chronicDiseases: diseases };
      if (disease === 'Diabetes') {
        updates.diabetesDetails = { type: 'Type 2', onInsulin: false };
      }
      if (disease === 'Heart Disease') {
        updates.heartConditionDetails = { condition: '', hasPacemaker: false };
      }
      setCurrentAssessment({ ...currentAssessment, ...updates });
    }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `medical-docs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('circuit-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('circuit-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setCurrentAssessment({
        ...currentAssessment,
        documents: [...(currentAssessment.documents || []), ...uploadedUrls],
      });

      alert(`${uploadedUrls.length} document(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = (index: number) => {
    const documents = [...(currentAssessment.documents || [])];
    documents.splice(index, 1);
    setCurrentAssessment({ ...currentAssessment, documents });
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
        documents: [],
      };
      setCurrentAssessment(nextAssessment);
    } else {
      // Save final assessments and proceed
      const finalAssessments = {
        ...assessments,
        [currentTravelerIndex]: currentAssessment,
      };
      updateBookingData({ medicalAssessments: finalAssessments });
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
        documents: [],
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#181410] mb-2">Medical Assessment</h1>
            <p className="text-gray-600">
              Help us ensure a safe and comfortable journey by providing health information
            </p>
          </div>

          {/* Current Traveler Info */}
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
            {/* Progress indicator */}
            <div className="flex gap-1 mt-3">
              {bookingData.travelers.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= currentTravelerIndex ? 'bg-blue-600' : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Section 1: Chronic Diseases */}
            <div>
              <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                <Icon name="healing" className="text-primary" />
                Section 1: Medical Conditions
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
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {currentAssessment.chronicDiseases.includes(disease) && (
                      <Icon name="check" className="inline mr-1 text-sm" />
                    )}
                    {disease}
                  </button>
                ))}
              </div>

              {/* Conditional: Diabetes Details */}
              {hasDiabetes && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                    <Icon name="bloodtype" className="text-amber-600" />
                    Diabetes Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diabetes Type
                      </label>
                      <select
                        value={currentAssessment.diabetesDetails?.type || 'Type 2'}
                        onChange={(e) => setCurrentAssessment({
                          ...currentAssessment,
                          diabetesDetails: {
                            ...currentAssessment.diabetesDetails!,
                            type: e.target.value,
                          },
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <option value="Type 1">Type 1</option>
                        <option value="Type 2">Type 2</option>
                        <option value="Gestational">Gestational</option>
                        <option value="Pre-diabetic">Pre-diabetic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last HbA1c Level (if known)
                      </label>
                      <input
                        type="text"
                        value={currentAssessment.diabetesDetails?.lastHbA1c || ''}
                        onChange={(e) => setCurrentAssessment({
                          ...currentAssessment,
                          diabetesDetails: {
                            ...currentAssessment.diabetesDetails!,
                            lastHbA1c: e.target.value,
                          },
                        })}
                        placeholder="e.g., 6.5%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                        <input
                          type="checkbox"
                          checked={currentAssessment.diabetesDetails?.onInsulin || false}
                          onChange={(e) => setCurrentAssessment({
                            ...currentAssessment,
                            diabetesDetails: {
                              ...currentAssessment.diabetesDetails!,
                              onInsulin: e.target.checked,
                            },
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-gray-700">Currently on Insulin</span>
                      </label>
                    </div>
                    {currentAssessment.diabetesDetails?.onInsulin && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insulin Type & Dosage
                        </label>
                        <input
                          type="text"
                          value={currentAssessment.diabetesDetails?.insulinType || ''}
                          onChange={(e) => setCurrentAssessment({
                            ...currentAssessment,
                            diabetesDetails: {
                              ...currentAssessment.diabetesDetails!,
                              insulinType: e.target.value,
                            },
                          })}
                          placeholder="e.g., Lantus 20 units at bedtime"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conditional: Heart Disease Details */}
              {hasHeartDisease && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                    <Icon name="favorite" className="text-red-600" />
                    Heart Condition Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Heart Condition
                      </label>
                      <input
                        type="text"
                        value={currentAssessment.heartConditionDetails?.condition || ''}
                        onChange={(e) => setCurrentAssessment({
                          ...currentAssessment,
                          heartConditionDetails: {
                            ...currentAssessment.heartConditionDetails!,
                            condition: e.target.value,
                          },
                        })}
                        placeholder="e.g., Coronary artery disease, Atrial fibrillation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last ECG/Echo Date
                      </label>
                      <input
                        type="date"
                        value={currentAssessment.heartConditionDetails?.lastEcgDate || ''}
                        onChange={(e) => setCurrentAssessment({
                          ...currentAssessment,
                          heartConditionDetails: {
                            ...currentAssessment.heartConditionDetails!,
                            lastEcgDate: e.target.value,
                          },
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 w-full">
                        <input
                          type="checkbox"
                          checked={currentAssessment.heartConditionDetails?.hasPacemaker || false}
                          onChange={(e) => setCurrentAssessment({
                            ...currentAssessment,
                            heartConditionDetails: {
                              ...currentAssessment.heartConditionDetails!,
                              hasPacemaker: e.target.checked,
                            },
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-gray-700">Has Pacemaker/ICD</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Medications */}
            <div>
              <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                <Icon name="medication" className="text-primary" />
                Section 2: Current Medications
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                List all medications being taken regularly
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  placeholder="e.g., Metformin 500mg twice daily"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button variant="secondary" onClick={addMedication}>
                  <Icon name="add" />
                  Add
                </Button>
              </div>
              {currentAssessment.medications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentAssessment.medications.map((med: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                    >
                      <Icon name="medication" className="text-green-600 text-sm" />
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

            {/* Section 3: Allergies & Diet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                  <Icon name="warning" className="text-primary" />
                  Allergies
                </h3>
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
                <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                  <Icon name="restaurant" className="text-primary" />
                  Dietary Restrictions
                </h3>
                <textarea
                  rows={3}
                  value={currentAssessment.dietaryRestrictions}
                  onChange={(e) =>
                    setCurrentAssessment({
                      ...currentAssessment,
                      dietaryRestrictions: e.target.value,
                    })
                  }
                  placeholder="e.g., Vegetarian, No spicy food, Diabetic diet, Low sodium"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Section 4: Mobility */}
            <div>
              <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                <Icon name="accessibility" className="text-primary" />
                Section 3: Mobility Level *
              </h3>
              <div className="space-y-3">
                {mobilityLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAssessment.mobilityLevel === level.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
                    <Icon name={level.icon} className="text-2xl text-gray-600" />
                    <span className="font-medium text-gray-800">{level.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 border-red-200 bg-red-50/50">
                  <input
                    type="checkbox"
                    checked={currentAssessment.oxygenRequired}
                    onChange={(e) =>
                      setCurrentAssessment({
                        ...currentAssessment,
                        oxygenRequired: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-red-600 rounded"
                  />
                  <Icon name="air" className="text-2xl text-red-600" />
                  <div>
                    <p className="font-medium text-gray-800">Oxygen Support Required</p>
                    <p className="text-sm text-gray-600">
                      Check if traveler needs oxygen support during the journey
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 5: Document Upload */}
            <div>
              <h3 className="font-bold text-[#181410] mb-2 flex items-center gap-2">
                <Icon name="upload_file" className="text-primary" />
                Section 4: Medical Documents (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload prescriptions, medical reports, or other relevant documents
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <Icon name="cloud_upload" className="text-5xl text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG, DOC up to 10MB each
                  </p>
                </label>
              </div>

              {(currentAssessment.documents?.length || 0) > 0 && (
                <div className="mt-4 space-y-2">
                  {(currentAssessment.documents || []).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="description" className="text-green-600" />
                        <span className="text-sm text-green-900 truncate max-w-[200px]">
                          Document {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Icon name="visibility" />
                        </a>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Icon name="delete" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Review Notice */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="health_and_safety" className="text-amber-600 text-2xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Medical Team Review</p>
                  <p>
                    Our medical team will review this information within 24 hours and may contact 
                    you if additional details are needed. We ensure appropriate medical support 
                    is arranged for your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
