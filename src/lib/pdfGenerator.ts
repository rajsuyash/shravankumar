import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: string;
  headStyles?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  columnStyles?: Record<number, Record<string, unknown>>;
  margin?: { left?: number; right?: number };
}

interface BookingData {
  bookingReference: string;
  circuitName: string;
  departureDate: string;
  returnDate: string;
  numberOfTravelers: number;
  totalPrice: number;
  travelers: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
  }>;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  specialRequirements?: string;
}

interface CircuitItinerary {
  day: number;
  title: string;
  activities: string[];
  accommodation?: string;
}

export const generateBookingConfirmationPDF = (booking: BookingData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(196, 85, 0); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Shravan Kumar', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sacred Pilgrimage Services', 20, 33);
  
  // Booking Reference Box
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - 70, 10, 60, 25, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Booking Reference', pageWidth - 65, 20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.bookingReference, pageWidth - 65, 30);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Confirmation', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, 62);
  
  // Circuit Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Journey Details', 20, 80);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const journeyDetails = [
    ['Circuit', booking.circuitName],
    ['Departure Date', new Date(booking.departureDate).toLocaleDateString('en-IN', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })],
    ['Return Date', new Date(booking.returnDate).toLocaleDateString('en-IN', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })],
    ['Number of Travelers', String(booking.numberOfTravelers)],
    ['Total Amount Paid', `₹${booking.totalPrice.toLocaleString('en-IN')}`],
  ];
  
  doc.autoTable({
    startY: 85,
    head: [],
    body: journeyDetails,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Traveler Details
  const currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 130;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Traveler Information', 20, currentY + 15);
  
  const travelerData = booking.travelers.map((t, i) => [
    String(i + 1),
    `${t.firstName} ${t.lastName}`,
    String(t.age),
    t.gender,
    t.phone,
    t.email,
  ]);
  
  doc.autoTable({
    startY: currentY + 20,
    head: [['#', 'Name', 'Age', 'Gender', 'Phone', 'Email']],
    body: travelerData,
    theme: 'striped',
    headStyles: { fillColor: [196, 85, 0] },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 20, right: 20 },
  });
  
  // Emergency Contact
  const travelerTableY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 180;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Emergency Contact', 20, travelerTableY + 15);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${booking.emergencyContact.name}`, 20, travelerTableY + 25);
  doc.text(`Relationship: ${booking.emergencyContact.relationship}`, 20, travelerTableY + 32);
  doc.text(`Phone: ${booking.emergencyContact.phone}`, 20, travelerTableY + 39);
  if (booking.emergencyContact.email) {
    doc.text(`Email: ${booking.emergencyContact.email}`, 20, travelerTableY + 46);
  }
  
  // Special Requirements
  if (booking.specialRequirements) {
    const emergencyY = travelerTableY + (booking.emergencyContact.email ? 56 : 49);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Special Requirements', 20, emergencyY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(booking.specialRequirements, pageWidth - 40);
    doc.text(splitText, 20, emergencyY + 8);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Shravan Kumar Pilgrimage Services', 20, pageHeight - 18);
  doc.text('24/7 Support: +91-XXXXXXXXXX | support@shravankumar.com', 20, pageHeight - 12);
  doc.text('www.shravankumar.com', 20, pageHeight - 6);
  
  return doc;
};

export const generateItineraryPDF = (
  circuitName: string,
  itinerary: CircuitItinerary[],
  departureDate: string
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(196, 85, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Shravan Kumar', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sacred Pilgrimage Services', 20, 33);
  
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${circuitName} - Detailed Itinerary`, 20, 55);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Departure: ${new Date(departureDate).toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })}`, 20, 63);
  
  // Itinerary
  let currentY = 80;
  const startDate = new Date(departureDate);
  
  itinerary.forEach((day, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + index);
    
    // Day header
    doc.setFillColor(196, 85, 0);
    doc.rect(20, currentY, pageWidth - 40, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Day ${day.day}: ${day.title} - ${dayDate.toLocaleDateString('en-IN', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      })}`,
      25,
      currentY + 7
    );
    
    currentY += 15;
    
    // Activities
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    day.activities.forEach((activity) => {
      const lines = doc.splitTextToSize(`• ${activity}`, pageWidth - 50);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 5 + 2;
    });
    
    // Accommodation
    if (day.accommodation) {
      doc.setFont('helvetica', 'bold');
      doc.text(`🏨 Stay: ${day.accommodation}`, 25, currentY);
      currentY += 8;
    }
    
    currentY += 10;
  });
  
  // Footer on last page
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('This itinerary is subject to change based on weather and local conditions.', 20, pageHeight - 15);
  doc.text('Shravan Kumar Pilgrimage Services | www.shravankumar.com', 20, pageHeight - 8);
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
