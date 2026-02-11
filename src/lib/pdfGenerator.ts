import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// ---------- Types ----------

interface TravelerDetail {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone?: string;
  name?: string;
  gender?: string;
  id_proof?: string;
}

interface BookingForPDF {
  id: string;
  booking_reference: string;
  departure_date: string;
  return_date: string;
  number_of_travelers: number;
  total_price: number;
  payment_status?: string;
  booking_status?: string;
  traveler_details: TravelerDetail[];
  special_requirements?: string;
  circuits: {
    name: string;
    starts_from_city?: string;
    duration_days: number;
    base_price?: number;
    medical_surcharge?: number;
  };
}

interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  locations?: string[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

interface CircuitForPDF {
  name: string;
  description?: string;
  duration_days: number;
  difficulty_level?: string;
  starts_from_city?: string;
  base_price?: number;
  medical_surcharge?: number;
  itinerary: ItineraryDay[];
  included_services?: string[];
  medical_support_details?: string;
}

// ---------- Constants ----------

const BRAND_COLOR: [number, number, number] = [209, 84, 0]; // #d15400
const DARK_TEXT: [number, number, number] = [24, 20, 16]; // #181410
const GRAY_TEXT: [number, number, number] = [107, 114, 128]; // gray-500
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [254, 247, 240]; // warm cream
const PAGE_WIDTH = 210; // A4 mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ---------- Helpers ----------

function drawHeader(doc: jsPDF, y: number): number {
  // Orange header bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

  // Brand name
  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Shravan Kumar Pilgrimage', MARGIN, 18);

  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sacred Journeys for Senior Citizens | Comfort & Care Guaranteed', MARGIN, 28);

  return y + 48;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(MARGIN, y, 4, 8, 'F');

  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN + 8, y + 6);

  return y + 14;
}

function drawKeyValue(doc: jsPDF, key: string, value: string, x: number, y: number, keyWidth: number = 45): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(key, x, y);

  doc.setTextColor(...DARK_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + keyWidth, y);

  return y + 6;
}

function drawFooter(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer line
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, pageHeight - 20, PAGE_WIDTH - MARGIN, pageHeight - 20);

  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Shravan Kumar Pilgrimage | support@shravankumar.com | +91 123 456 7890',
    PAGE_WIDTH / 2,
    pageHeight - 14,
    { align: 'center' }
  );
  doc.text(
    'This is a computer-generated document and does not require a signature.',
    PAGE_WIDTH / 2,
    pageHeight - 9,
    { align: 'center' }
  );
}

function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 30) {
    doc.addPage();
    drawFooter(doc);
    return 20;
  }
  return currentY;
}

function getTravelerName(t: TravelerDetail): string {
  if (t.firstName || t.lastName) {
    return `${t.firstName || ''} ${t.lastName || ''}`.trim();
  }
  return t.name || 'N/A';
}

// ---------- Booking Confirmation PDF ----------

export function generateBookingConfirmationPDF(booking: BookingForPDF): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 0;

  // Header
  y = drawHeader(doc, y);

  // Document title
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING CONFIRMATION', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // Booking reference box
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('Booking Reference', PAGE_WIDTH / 2, y + 7, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.booking_reference, PAGE_WIDTH / 2, y + 17, { align: 'center' });
  y += 30;

  // Status badge
  const statusText = (booking.booking_status || 'confirmed').toUpperCase();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34);
  doc.text(`Status: ${statusText}`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // ---------- Circuit Details ----------
  y = drawSectionTitle(doc, 'Journey Details', y);
  y += 2;

  y = drawKeyValue(doc, 'Circuit:', booking.circuits.name, MARGIN, y);
  if (booking.circuits.starts_from_city) {
    y = drawKeyValue(doc, 'Starting City:', booking.circuits.starts_from_city, MARGIN, y);
  }
  y = drawKeyValue(doc, 'Duration:', `${booking.circuits.duration_days} Days`, MARGIN, y);
  y = drawKeyValue(
    doc,
    'Departure:',
    format(new Date(booking.departure_date), 'dd MMMM yyyy (EEEE)'),
    MARGIN,
    y
  );
  y = drawKeyValue(
    doc,
    'Return:',
    format(new Date(booking.return_date), 'dd MMMM yyyy (EEEE)'),
    MARGIN,
    y
  );
  y = drawKeyValue(doc, 'Travelers:', `${booking.number_of_travelers}`, MARGIN, y);
  y += 6;

  // ---------- Traveler Details Table ----------
  y = drawSectionTitle(doc, 'Traveler Information', y);
  y += 2;

  const travelerRows = booking.traveler_details.map((t, i) => [
    String(i + 1),
    getTravelerName(t),
    t.age ? String(t.age) : '-',
    t.email || '-',
    t.phone || '-',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Name', 'Age', 'Email', 'Phone']],
    body: travelerRows,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: WHITE,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 245, 240],
    },
    theme: 'grid',
  });

  // Get Y position after the table
  const lastTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  y = (lastTable?.finalY ?? y + 30) + 10;

  // ---------- Payment Summary ----------
  y = checkPageBreak(doc, y, 50);
  y = drawSectionTitle(doc, 'Payment Summary', y);
  y += 2;

  const basePrice = booking.circuits.base_price ?? 0;
  const medSurcharge = booking.circuits.medical_surcharge ?? 0;
  const numTravelers = booking.number_of_travelers;

  const paymentRows: (string | number)[][] = [];

  if (basePrice > 0) {
    paymentRows.push([
      'Base Price',
      `${numTravelers} traveler(s)`,
      `Rs. ${(basePrice * numTravelers).toLocaleString()}`,
    ]);
  }

  if (medSurcharge > 0) {
    paymentRows.push([
      'Medical Surcharge',
      `${numTravelers} traveler(s)`,
      `Rs. ${(medSurcharge * numTravelers).toLocaleString()}`,
    ]);
  }

  paymentRows.push(['Total Amount Paid', '', `Rs. ${booking.total_price.toLocaleString()}`]);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Details', 'Amount']],
    body: paymentRows,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: WHITE,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: LIGHT_BG,
      textColor: DARK_TEXT,
      fontStyle: 'bold',
    },
    columnStyles: {
      2: { halign: 'right' },
    },
    theme: 'grid',
    didParseCell: (data) => {
      // Bold the total row
      if (data.section === 'body' && data.row.index === paymentRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = LIGHT_BG;
      }
    },
  });

  const paymentTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  y = (paymentTable?.finalY ?? y + 30) + 10;

  // ---------- What's Next Section ----------
  y = checkPageBreak(doc, y, 50);
  y = drawSectionTitle(doc, "What's Next", y);
  y += 2;

  const nextSteps = [
    'Confirmation email has been sent to all travelers with the detailed itinerary.',
    'Our medical team will review health assessments within 24 hours.',
    'Your Journey Coordinator will contact you 7 days before departure.',
    'A real-time tracking link will be shared with your emergency contact.',
  ];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);

  nextSteps.forEach((step) => {
    y = checkPageBreak(doc, y, 8);
    doc.setFillColor(...BRAND_COLOR);
    doc.circle(MARGIN + 2, y - 1.5, 1.2, 'F');
    const lines = doc.splitTextToSize(step, CONTENT_WIDTH - 10);
    doc.text(lines, MARGIN + 7, y);
    y += lines.length * 4.5 + 2;
  });

  y += 4;

  // ---------- Special Requirements ----------
  if (booking.special_requirements) {
    y = checkPageBreak(doc, y, 20);
    y = drawSectionTitle(doc, 'Special Requirements', y);
    y += 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    const reqLines = doc.splitTextToSize(booking.special_requirements, CONTENT_WIDTH);
    doc.text(reqLines, MARGIN, y);
    y += reqLines.length * 4.5 + 6;
  }

  // ---------- Support Contact ----------
  y = checkPageBreak(doc, y, 30);
  y = drawSectionTitle(doc, 'Need Help?', y);
  y += 2;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  y = drawKeyValue(doc, 'Phone:', '+91 123 456 7890', MARGIN, y);
  y = drawKeyValue(doc, 'Email:', 'support@shravankumar.com', MARGIN, y);
  y = drawKeyValue(doc, 'Hours:', 'Monday to Saturday, 9 AM - 6 PM IST', MARGIN, y);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      doc.internal.pageSize.getHeight() - 4,
      { align: 'right' }
    );
  }

  // Save the PDF
  doc.save(`Booking_${booking.booking_reference}.pdf`);
}

// ---------- Itinerary PDF ----------

export function generateItineraryPDF(circuit: CircuitForPDF, booking: BookingForPDF): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 0;

  // Header
  y = drawHeader(doc, y);

  // Document title
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('JOURNEY ITINERARY', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // Circuit name
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFont('helvetica', 'bold');
  const circuitNameLines = doc.splitTextToSize(circuit.name, CONTENT_WIDTH);
  doc.text(circuitNameLines, PAGE_WIDTH / 2, y, { align: 'center' });
  y += circuitNameLines.length * 7 + 4;

  // Booking reference
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref: ${booking.booking_reference}`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // ---------- Trip Overview ----------
  y = drawSectionTitle(doc, 'Trip Overview', y);
  y += 2;

  if (circuit.starts_from_city) {
    y = drawKeyValue(doc, 'Starting City:', circuit.starts_from_city, MARGIN, y);
  }
  y = drawKeyValue(doc, 'Duration:', `${circuit.duration_days} Days`, MARGIN, y);
  if (circuit.difficulty_level) {
    y = drawKeyValue(doc, 'Difficulty:', circuit.difficulty_level, MARGIN, y);
  }
  y = drawKeyValue(
    doc,
    'Departure:',
    format(new Date(booking.departure_date), 'dd MMMM yyyy (EEEE)'),
    MARGIN,
    y
  );
  y = drawKeyValue(
    doc,
    'Return:',
    format(new Date(booking.return_date), 'dd MMMM yyyy (EEEE)'),
    MARGIN,
    y
  );
  y = drawKeyValue(doc, 'Travelers:', `${booking.number_of_travelers}`, MARGIN, y);
  y += 4;

  // ---------- Circuit Description ----------
  if (circuit.description) {
    y = checkPageBreak(doc, y, 20);
    y = drawSectionTitle(doc, 'About This Journey', y);
    y += 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    const descLines = doc.splitTextToSize(circuit.description, CONTENT_WIDTH);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 4.5 + 6;
  }

  // ---------- Day-by-Day Itinerary ----------
  if (circuit.itinerary && circuit.itinerary.length > 0) {
    y = checkPageBreak(doc, y, 20);
    y = drawSectionTitle(doc, 'Day-by-Day Itinerary', y);
    y += 4;

    circuit.itinerary.forEach((day) => {
      y = checkPageBreak(doc, y, 35);

      // Day header bar
      doc.setFillColor(...BRAND_COLOR);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 9, 2, 2, 'F');

      doc.setTextColor(...WHITE);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${day.day}: ${day.title}`, MARGIN + 5, y + 6);
      y += 13;

      // Description
      if (day.description) {
        doc.setTextColor(...DARK_TEXT);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(day.description, CONTENT_WIDTH - 6);
        doc.text(descLines, MARGIN + 3, y);
        y += descLines.length * 4.5 + 2;
      }

      // Locations
      if (day.locations && day.locations.length > 0) {
        y = checkPageBreak(doc, y, 10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_COLOR);
        doc.text('Locations:', MARGIN + 3, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        day.locations.forEach((loc) => {
          y = checkPageBreak(doc, y, 6);
          doc.text(`  - ${loc}`, MARGIN + 5, y);
          y += 4.5;
        });
        y += 1;
      }

      // Activities
      if (day.activities && day.activities.length > 0) {
        y = checkPageBreak(doc, y, 10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_COLOR);
        doc.text('Activities:', MARGIN + 3, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        day.activities.forEach((act) => {
          y = checkPageBreak(doc, y, 6);
          doc.text(`  - ${act}`, MARGIN + 5, y);
          y += 4.5;
        });
        y += 1;
      }

      // Accommodation
      if (day.accommodation) {
        y = checkPageBreak(doc, y, 8);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_COLOR);
        doc.text('Accommodation:', MARGIN + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        doc.text(day.accommodation, MARGIN + 32, y);
        y += 5;
      }

      // Meals
      if (day.meals && day.meals.length > 0) {
        y = checkPageBreak(doc, y, 8);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_COLOR);
        doc.text('Meals:', MARGIN + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        doc.text(day.meals.join(', '), MARGIN + 18, y);
        y += 5;
      }

      // Separator line
      y += 2;
      doc.setDrawColor(230, 225, 220);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += 6;
    });
  }

  // ---------- Included Services ----------
  if (circuit.included_services && circuit.included_services.length > 0) {
    y = checkPageBreak(doc, y, 20);
    y = drawSectionTitle(doc, 'Included Services', y);
    y += 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);

    circuit.included_services.forEach((service) => {
      y = checkPageBreak(doc, y, 6);
      doc.setTextColor(34, 139, 34); // green checkmark
      doc.text('\u2713', MARGIN + 2, y);
      doc.setTextColor(...DARK_TEXT);
      doc.text(service, MARGIN + 8, y);
      y += 5;
    });
    y += 4;
  }

  // ---------- Medical Support ----------
  if (circuit.medical_support_details) {
    y = checkPageBreak(doc, y, 20);
    y = drawSectionTitle(doc, 'Medical Support', y);
    y += 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    const medLines = doc.splitTextToSize(circuit.medical_support_details, CONTENT_WIDTH);
    doc.text(medLines, MARGIN, y);
    y += medLines.length * 4.5 + 6;
  }

  // ---------- Important Notes ----------
  y = checkPageBreak(doc, y, 40);
  y = drawSectionTitle(doc, 'Important Notes', y);
  y += 2;

  const notes = [
    'Carry a valid government-issued photo ID at all times during the journey.',
    'Wear comfortable walking shoes and carry weather-appropriate clothing.',
    'All medications should be carried in original packaging with prescriptions.',
    'Stay hydrated and inform the medical team immediately if you feel unwell.',
    'Follow the coordinator\'s instructions at all pilgrimage sites for safety.',
    'Emergency medical support is available 24/7 during the journey.',
  ];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);

  notes.forEach((note, i) => {
    y = checkPageBreak(doc, y, 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLOR);
    doc.text(`${i + 1}.`, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    const noteLines = doc.splitTextToSize(note, CONTENT_WIDTH - 10);
    doc.text(noteLines, MARGIN + 7, y);
    y += noteLines.length * 4.5 + 2;
  });

  y += 4;

  // ---------- Emergency Contacts ----------
  y = checkPageBreak(doc, y, 30);
  y = drawSectionTitle(doc, 'Emergency Numbers', y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [['Contact', 'Number']],
    body: [
      ['Shravan Kumar Support', '+91 123 456 7890'],
      ['Emergency Helpline', '112'],
      ['Medical Emergency', '108'],
      ['Email Support', 'support@shravankumar.com'],
    ],
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: WHITE,
      fontStyle: 'bold',
    },
    theme: 'grid',
    tableWidth: CONTENT_WIDTH / 2,
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc);

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      doc.internal.pageSize.getHeight() - 4,
      { align: 'right' }
    );
  }

  // Save the PDF
  const safeCircuitName = circuit.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Itinerary_${safeCircuitName}_${booking.booking_reference}.pdf`);
}
