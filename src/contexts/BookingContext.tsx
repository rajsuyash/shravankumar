import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Traveler {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  relationship: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface MedicalAssessment {
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

interface BookingData {
  circuitId: string;
  circuitName: string;
  circuitPrice: number;
  medicalSurcharge: number;
  departureDate: string;
  returnDate: string;
  numberOfTravelers: number;
  travelers: Traveler[];
  emergencyContact: EmergencyContact;
  medicalAssessments: { [travelerId: number]: MedicalAssessment };
  specialRequirements: string;
  totalPrice: number;
}

interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const defaultBookingData: BookingData = {
  circuitId: '',
  circuitName: '',
  circuitPrice: 0,
  medicalSurcharge: 0,
  departureDate: '',
  returnDate: '',
  numberOfTravelers: 1,
  travelers: [],
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
  },
  medicalAssessments: {},
  specialRequirements: '',
  totalPrice: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setBookingData(defaultBookingData);
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
