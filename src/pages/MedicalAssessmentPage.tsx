import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { Button, Icon } from '../components/ui';
import { supabase } from '../lib/supabase';

interface MedicalAssessmentData {
  chronicDiseases: string[];
  medications: string[];
  allergies: string;
  mobilityLevel: string;
  oxygenRequired: boolean;
  dietaryRestrictions: string;
  // Conditional fields for specific diseases
  insulinDependent?: boolean;
  bloodSugarRange?: string;
  hba1cLevel?: string;
  hasPacemaker?: boolean;
  lastEcgDate?: string;
  currentBpSystolic?: string;
  currentBpDiastolic?: string;
  inhalerType?: string;
  lastAsthmaAttackDate?: string;
  dialysisRequired?: boolean;
  lastCreatinineLevel?: string;
  // Document upload URLs
  medicalDocuments?: { name: string; url: string }[];
}

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

const inhalerTypes = [
  { value: '', label: 'Select inhaler type' },
  { value: 'metered-dose', label: 'Metered-Dose Inhaler (MDI)' },
  { value: 'dry-powder', label: 'Dry Powder Inhaler (DPI)' },
  { value: 'soft-mist', label: 'Soft Mist Inhaler' },
  { value: 'nebulizer', label: 'Nebulizer' },
  { value: 'other', label: 'Other' },
];

const AUTOSAVE_INTERVAL = 5000; // 5 seconds

const getLocalStorageKey = (travelerIndex: number) =>
  `medical_assessment_draft_${travelerIndex}`;

const getDefaultAssessment = (): MedicalAssessmentData => ({
  chronicDiseases: [],
  medications: [],
  allergies: '',
  mobilityLevel: 'full',
  oxygenRequired: false,
  dietaryRestrictions: '',
  insulinDependent: false,
  bloodSugarRange: '',
  hba1cLevel: '',
  hasPacemaker: false,
  lastEcgDate: '',
  currentBpSystolic: '',
  currentBpDiastolic: '',
  inhalerType: '',
  lastAsthmaAttackDate: '',
  dialysisRequired: false,
  lastCreatinineLevel: '',
  medicalDocuments: [],
});

export const MedicalAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [currentTravelerIndex, setCurrentTravelerIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assessments, setAssessments] = useState<{ [key: number]: MedicalAssessmentData }>(
    bookingData.medicalAssessments || {}
  );

  const buildInitialAssessment = useCallback((index: number): MedicalAssessmentData => {
    const existing = assessments[index];
    return existing
      ? { ...getDefaultAssessment(), ...existing }
      : getDefaultAssessment();
  }, [assessments]);

  const [currentAssessment, setCurrentAssessment] = useState<MedicalAssessmentData>(
    buildInitialAssessment(currentTravelerIndex)
  );

  const [medicationInput, setMedicationInput] = useState('');
  const currentTraveler = bookingData.travelers[currentTravelerIndex];

  // Check for saved draft on mount and when traveler changes
  useEffect(() => {
    const key = getLocalStorageKey(currentTravelerIndex);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setShowRestoreBanner(true);
        }
      } catch {
        // Invalid data, remove it
        localStorage.removeItem(key);
      }
    }
  }, [currentTravelerIndex]);

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
    const key = getLocalStorageKey(currentTravelerIndex);
    const interval = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(currentAssessment));
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentAssessment, currentTravelerIndex]);

  const handleRestoreDraft = () => {
    const key = getLocalStorageKey(currentTravelerIndex);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MedicalAssessmentData;
        setCurrentAssessment({ ...getDefaultAssessment(), ...parsed });
      } catch {
        // ignore parse errors
      }
    }
    setShowRestoreBanner(false);
  };

  const handleDiscardDraft = () => {
    const key = getLocalStorageKey(currentTravelerIndex);
    localStorage.removeItem(key);
    setShowRestoreBanner(false);
  };

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

  const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate all files before uploading
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not a supported file type. Please upload PDF, JPG, or PNG files only.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds the 10MB size limit. Please upload a smaller file.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setUploadingFile(true);

    const newDocuments = [...(currentAssessment.medicalDocuments || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `traveler_${currentTravelerIndex}/${fileName}`;

      try {
        const { error } = await supabase.storage
          .from('medical-documents')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(filePath);

        newDocuments.push({
          name: file.name,
          url: urlData.publicUrl,
        });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setCurrentAssessment({
      ...currentAssessment,
      medicalDocuments: newDocuments,
    });
    setUploadingFile(false);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (index: number) => {
    const docs = [...(currentAssessment.medicalDocuments || [])];
    const doc = docs[index];

    // Try to remove from Supabase storage
    if (doc.url) {
      try {
        const urlParts = doc.url.split('/medical-documents/');
        if (urlParts[1]) {
          await supabase.storage
            .from('medical-documents')
            .remove([urlParts[1]]);
        }
      } catch (err) {
        console.error('Failed to remove file from storage:', err);
      }
    }

    docs.splice(index, 1);
    setCurrentAssessment({
      ...currentAssessment,
      medicalDocuments: docs,
    });
  };

  const saveCurrentAssessment = () => {
    const updated = {
      ...assessments,
      [currentTravelerIndex]: currentAssessment,
    };
    setAssessments(updated);
    return updated;
  };

  const handleNext = () => {
    const updatedAssessments = saveCurrentAssessment();

    if (currentTravelerIndex < bookingData.travelers.length - 1) {
      const nextIndex = currentTravelerIndex + 1;
      setCurrentTravelerIndex(nextIndex);
      const nextAssessment = updatedAssessments[nextIndex]
        ? { ...getDefaultAssessment(), ...updatedAssessments[nextIndex] }
        : getDefaultAssessment();
      setCurrentAssessment(nextAssessment);
      setCurrentSection(1);

      // Clear the current traveler's draft on successful progression
      localStorage.removeItem(getLocalStorageKey(currentTravelerIndex));
    } else {
      // Final traveler -- save and navigate
      updateBookingData({ medicalAssessments: updatedAssessments });

      // Clear all drafts
      for (let i = 0; i < bookingData.travelers.length; i++) {
        localStorage.removeItem(getLocalStorageKey(i));
      }

      navigate('/booking/payment');
    }
  };

  const handlePrevious = () => {
    saveCurrentAssessment();
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      return;
    }
    if (currentTravelerIndex > 0) {
      const prevIndex = currentTravelerIndex - 1;
      setCurrentTravelerIndex(prevIndex);
      setCurrentAssessment(
        assessments[prevIndex]
          ? { ...getDefaultAssessment(), ...assessments[prevIndex] }
          : getDefaultAssessment()
      );
      setCurrentSection(3);
    } else {
      navigate(-1);
    }
  };

  const handleNextSection = () => {
    if (currentSection < 3) {
      setCurrentSection(currentSection + 1);
    } else {
      handleNext();
    }
  };

  const validateAssessment = () => {
    return currentAssessment.mobilityLevel !== '';
  };

  // Section progress indicator
  const sectionLabels = ['Medical History', 'Current Health Status', 'Medical Documents'];

  const renderSectionProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {sectionLabels.map((label, idx) => {
          const sectionNum = idx + 1;
          const isActive = currentSection === sectionNum;
          const isCompleted = currentSection > sectionNum;
          return (
            <button
              key={label}
              onClick={() => setCurrentSection(sectionNum)}
              className="flex-1 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="check" className="text-sm" />
                  ) : (
                    sectionNum
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden md:inline ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-1">
        {sectionLabels.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-1 rounded-full transition-colors ${
              currentSection > idx ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 text-center mt-2">
        Section {currentSection} of 3: {sectionLabels[currentSection - 1]}
      </p>
    </div>
  );

  // Conditional fields for specific diseases
  const renderDiabetesFields = () => (
    <div className="ml-4 mt-3 p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-4">
      <p className="text-sm font-medium text-orange-800">Diabetes Details</p>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={currentAssessment.insulinDependent || false}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, insulinDependent: e.target.checked })
          }
          className="w-4 h-4 text-primary rounded"
        />
        <span className="text-sm text-gray-700">Insulin Dependent?</span>
      </label>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Blood Sugar Range</label>
        <input
          type="text"
          value={currentAssessment.bloodSugarRange || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, bloodSugarRange: e.target.value })
          }
          placeholder="e.g., 90-130 mg/dL"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">HbA1c Level</label>
        <input
          type="text"
          value={currentAssessment.hba1cLevel || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, hba1cLevel: e.target.value })
          }
          placeholder="e.g., 6.5%"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderHeartDiseaseFields = () => (
    <div className="ml-4 mt-3 p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
      <p className="text-sm font-medium text-red-800">Heart Disease Details</p>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={currentAssessment.hasPacemaker || false}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, hasPacemaker: e.target.checked })
          }
          className="w-4 h-4 text-primary rounded"
        />
        <span className="text-sm text-gray-700">Pacemaker?</span>
      </label>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Last ECG Date</label>
        <input
          type="date"
          value={currentAssessment.lastEcgDate || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, lastEcgDate: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderHypertensionFields = () => (
    <div className="ml-4 mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
      <p className="text-sm font-medium text-purple-800">Hypertension Details</p>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Current BP Reading</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentAssessment.currentBpSystolic || ''}
            onChange={(e) =>
              setCurrentAssessment({ ...currentAssessment, currentBpSystolic: e.target.value })
            }
            placeholder="Systolic (e.g., 120)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-gray-500 font-bold">/</span>
          <input
            type="text"
            value={currentAssessment.currentBpDiastolic || ''}
            onChange={(e) =>
              setCurrentAssessment({ ...currentAssessment, currentBpDiastolic: e.target.value })
            }
            placeholder="Diastolic (e.g., 80)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-gray-500">mmHg</span>
        </div>
      </div>
    </div>
  );

  const renderAsthmaFields = () => (
    <div className="ml-4 mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
      <p className="text-sm font-medium text-blue-800">Asthma Details</p>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Inhaler Type</label>
        <select
          value={currentAssessment.inhalerType || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, inhalerType: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {inhalerTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Last Asthma Attack Date</label>
        <input
          type="date"
          value={currentAssessment.lastAsthmaAttackDate || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, lastAsthmaAttackDate: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderKidneyDiseaseFields = () => (
    <div className="ml-4 mt-3 p-4 bg-teal-50 rounded-lg border border-teal-200 space-y-4">
      <p className="text-sm font-medium text-teal-800">Kidney Disease Details</p>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={currentAssessment.dialysisRequired || false}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, dialysisRequired: e.target.checked })
          }
          className="w-4 h-4 text-primary rounded"
        />
        <span className="text-sm text-gray-700">Dialysis Required?</span>
      </label>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Last Creatinine Level</label>
        <input
          type="text"
          value={currentAssessment.lastCreatinineLevel || ''}
          onChange={(e) =>
            setCurrentAssessment({ ...currentAssessment, lastCreatinineLevel: e.target.value })
          }
          placeholder="e.g., 1.2 mg/dL"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  // Section 1: Medical History
  const renderSection1 = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-[#181410] flex items-center gap-2">
          <Icon name="history" className="text-primary" />
          Medical History
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Provide information about existing medical conditions and allergies
        </p>
      </div>

      {/* Chronic Diseases */}
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

        {/* Conditional disease-specific fields */}
        {currentAssessment.chronicDiseases.includes('Diabetes') && renderDiabetesFields()}
        {currentAssessment.chronicDiseases.includes('Heart Disease') && renderHeartDiseaseFields()}
        {currentAssessment.chronicDiseases.includes('Hypertension') && renderHypertensionFields()}
        {currentAssessment.chronicDiseases.includes('Asthma') && renderAsthmaFields()}
        {currentAssessment.chronicDiseases.includes('Kidney Disease') && renderKidneyDiseaseFields()}
      </div>

      {/* Allergies */}
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
    </div>
  );

  // Section 2: Current Health Status
  const renderSection2 = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-[#181410] flex items-center gap-2">
          <Icon name="monitor_heart" className="text-primary" />
          Current Health Status
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Provide information about current medications, mobility, and dietary needs
        </p>
      </div>

      {/* Current Medications */}
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
            {currentAssessment.medications.map((med: string, index: number) => (
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

      {/* Mobility Level */}
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

      {/* Oxygen Support */}
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

      {/* Dietary Restrictions */}
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
    </div>
  );

  // Section 3: Medical Documents
  const renderSection3 = () => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-[#181410] flex items-center gap-2">
          <Icon name="upload_file" className="text-primary" />
          Medical Documents
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload prescriptions, medical reports, and other relevant documents
        </p>
      </div>

      {/* Upload Area */}
      <div>
        <h3 className="font-bold text-[#181410] mb-4">
          Upload Prescriptions & Medical Reports
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload PDF files or images of your medical documents. These help our medical team
          prepare appropriate support for your journey.
        </p>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="cloud_upload" className="text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-400">
            PDF, JPG, PNG files (max 10MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadingFile && (
          <div className="mt-4 flex items-center gap-3 text-primary">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm font-medium">Uploading files...</span>
          </div>
        )}

        {/* Uploaded files list */}
        {currentAssessment.medicalDocuments && currentAssessment.medicalDocuments.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Documents ({currentAssessment.medicalDocuments.length})
            </h4>
            {currentAssessment.medicalDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    name={doc.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                    className={`text-xl ${
                      doc.name.endsWith('.pdf') ? 'text-red-500' : 'text-blue-500'
                    }`}
                  />
                  <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium flex-shrink-0 ml-3"
                >
                  <Icon name="delete" className="text-sm" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Team Review Notice */}
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
  );

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

          {/* Traveler indicator */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
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

          {/* Restore draft banner */}
          {showRestoreBanner && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="restore" className="text-yellow-700 text-xl" />
                  <div>
                    <p className="font-medium text-yellow-900">Unsaved draft found</p>
                    <p className="text-sm text-yellow-700">
                      Would you like to restore your previously saved assessment data?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={handleRestoreDraft}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={handleDiscardDraft}
                    className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Auto-save indicator */}
          <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Auto-saving drafts every {AUTOSAVE_INTERVAL / 1000} seconds</span>
          </div>

          {/* Section progress indicator */}
          {renderSectionProgress()}

          {/* Render active section */}
          {currentSection === 1 && renderSection1()}
          {currentSection === 2 && renderSection2()}
          {currentSection === 3 && renderSection3()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button variant="secondary" onClick={handlePrevious}>
              <Icon name="arrow_back" className="mr-2" />
              {currentSection > 1
                ? 'Previous Section'
                : currentTravelerIndex === 0
                ? 'Back to Booking'
                : 'Previous Traveler'}
            </Button>
            <Button
              variant="primary"
              onClick={handleNextSection}
              disabled={!validateAssessment()}
            >
              {currentSection < 3
                ? 'Next Section'
                : currentTravelerIndex < bookingData.travelers.length - 1
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
