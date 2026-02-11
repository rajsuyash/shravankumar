import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Email Template Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps email body content in a branded Shravan Kumar HTML layout.
 */
function wrapInTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#d15400;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                Shravan Kumar Pilgrimage
              </h1>
              <p style="margin:6px 0 0;color:#ffe0c2;font-size:13px;">
                Sacred Journeys for Senior Citizens
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf7f4;padding:20px 32px;border-top:1px solid #e7dfda;text-align:center;">
              <p style="margin:0 0 4px;color:#888;font-size:12px;">
                &copy; ${new Date().getFullYear()} Shravan Kumar Pilgrimage. All rights reserved.
              </p>
              <p style="margin:0;color:#aaa;font-size:11px;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Queue helper
// ---------------------------------------------------------------------------

async function insertIntoEmailQueue(
  toEmail: string,
  subject: string,
  bodyHtml: string,
): Promise<void> {
  const { error } = await supabase.from('email_queue').insert({
    to_email: toEmail,
    subject,
    body_html: bodyHtml,
    status: 'pending',
  });

  if (error) {
    console.error('Failed to queue email:', error);
    // We intentionally do not throw here so the main flow is not disrupted
    // if the email queue insert fails.
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface BookingEmailData {
  bookingReference: string;
  customerEmail: string;
  customerName: string;
  circuitName: string;
  departureDate: string;
  returnDate: string;
  totalPrice: number;
  numberOfTravelers: number;
}

interface TravelerInfo {
  firstName: string;
  lastName: string;
  age: number;
}

/**
 * Queues a booking confirmation email after a successful payment.
 */
export async function queueBookingConfirmationEmail(
  booking: BookingEmailData,
  travelers: TravelerInfo[],
): Promise<void> {
  const travelerRows = travelers
    .map(
      (t, i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${t.firstName} ${t.lastName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${t.age} yrs</td>
        </tr>`,
    )
    .join('');

  const bodyContent = `
    <h2 style="margin:0 0 16px;color:#181410;font-size:20px;">Booking Confirmed!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear ${booking.customerName},<br/>
      Thank you for booking with Shravan Kumar Pilgrimage. Your pilgrimage journey has been confirmed.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background-color:#fdf8f4;border-radius:8px;border:1px solid #e7dfda;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;width:40%;">Booking Reference</td>
              <td style="padding:6px 0;color:#d15400;font-size:15px;font-weight:700;">${booking.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Circuit</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;font-weight:600;">${booking.circuitName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Departure</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${booking.departureDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Return</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${booking.returnDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Travelers</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${booking.numberOfTravelers}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Total Paid</td>
              <td style="padding:6px 0;color:#d15400;font-size:16px;font-weight:700;">&#8377;${booking.totalPrice.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <h3 style="margin:0 0 8px;color:#181410;font-size:16px;">Traveler Details</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e7dfda;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#d15400;">
        <th style="padding:10px 12px;color:#fff;font-size:13px;text-align:left;">#</th>
        <th style="padding:10px 12px;color:#fff;font-size:13px;text-align:left;">Name</th>
        <th style="padding:10px 12px;color:#fff;font-size:13px;text-align:left;">Age</th>
      </tr>
      ${travelerRows}
    </table>

    <div style="padding:16px 20px;background-color:#fff8e1;border-radius:8px;border:1px solid #ffe082;margin-bottom:16px;">
      <p style="margin:0;color:#795548;font-size:13px;line-height:1.5;">
        <strong>Important:</strong> Our medical team will review the submitted health assessments within 24 hours.
        You will receive a separate notification once clearance is granted.
      </p>
    </div>

    <p style="margin:0;color:#888;font-size:13px;">
      If you have any questions, please contact our support team.
    </p>
  `;

  await insertIntoEmailQueue(
    booking.customerEmail,
    `Booking Confirmed - ${booking.bookingReference} | Shravan Kumar Pilgrimage`,
    wrapInTemplate('Booking Confirmation', bodyContent),
  );
}

interface MedicalClearanceEmailData {
  pilgrimName: string;
  pilgrimEmail: string;
  bookingReference: string;
  circuitName: string;
  departureDate: string;
}

/**
 * Queues an email notifying the pilgrim that their medical assessment was approved.
 */
export async function queueMedicalClearanceEmail(
  data: MedicalClearanceEmailData,
): Promise<void> {
  const bodyContent = `
    <h2 style="margin:0 0 16px;color:#181410;font-size:20px;">Medical Clearance Approved</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear ${data.pilgrimName},<br/>
      Great news! Your medical assessment has been reviewed and approved by our medical team.
    </p>

    <div style="padding:20px;background-color:#e8f5e9;border-radius:8px;border:1px solid #a5d6a7;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:28px;">&#10003;</p>
      <p style="margin:0;color:#2e7d32;font-size:16px;font-weight:700;">Medically Cleared</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background-color:#fdf8f4;border-radius:8px;border:1px solid #e7dfda;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;width:40%;">Booking Reference</td>
              <td style="padding:6px 0;color:#d15400;font-size:15px;font-weight:700;">${data.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Circuit</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;font-weight:600;">${data.circuitName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Departure</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${data.departureDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;color:#555;font-size:14px;line-height:1.6;">
      You are all set for your pilgrimage journey. Please ensure you carry all prescribed medications
      and any medical documents referenced during the assessment.
    </p>

    <p style="margin:0;color:#888;font-size:13px;">
      If you have any questions, please contact our support team.
    </p>
  `;

  await insertIntoEmailQueue(
    data.pilgrimEmail,
    `Medical Clearance Approved - ${data.bookingReference} | Shravan Kumar Pilgrimage`,
    wrapInTemplate('Medical Clearance', bodyContent),
  );
}

interface TripReminderEmailData {
  pilgrimName: string;
  pilgrimEmail: string;
  bookingReference: string;
  circuitName: string;
  departureDate: string;
  departureCity?: string;
}

/**
 * Queues a trip reminder email (typically sent 7 days before departure).
 */
export async function queueTripReminderEmail(
  data: TripReminderEmailData,
): Promise<void> {
  const bodyContent = `
    <h2 style="margin:0 0 16px;color:#181410;font-size:20px;">Your Pilgrimage is Coming Up!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Dear ${data.pilgrimName},<br/>
      This is a friendly reminder that your pilgrimage journey departs in <strong>7 days</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background-color:#fdf8f4;border-radius:8px;border:1px solid #e7dfda;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;width:40%;">Booking Reference</td>
              <td style="padding:6px 0;color:#d15400;font-size:15px;font-weight:700;">${data.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Circuit</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;font-weight:600;">${data.circuitName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Departure Date</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${data.departureDate}</td>
            </tr>
            ${
              data.departureCity
                ? `<tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Departure City</td>
              <td style="padding:6px 0;color:#181410;font-size:14px;">${data.departureCity}</td>
            </tr>`
                : ''
            }
          </table>
        </td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;color:#181410;font-size:16px;">Pre-Departure Checklist</h3>
    <ul style="margin:0 0 24px;padding-left:20px;color:#555;font-size:14px;line-height:1.8;">
      <li>Carry all prescribed medications in their original packaging</li>
      <li>Keep a copy of your medical clearance document</li>
      <li>Pack comfortable walking shoes and weather-appropriate clothing</li>
      <li>Ensure your emergency contact details are up to date</li>
      <li>Carry a valid photo ID</li>
      <li>Stay hydrated and get adequate rest before the journey</li>
    </ul>

    <div style="padding:16px 20px;background-color:#e3f2fd;border-radius:8px;border:1px solid #90caf9;margin-bottom:16px;">
      <p style="margin:0;color:#1565c0;font-size:13px;line-height:1.5;">
        <strong>Contact us</strong> if you need to make any changes to your booking or have health concerns before departure.
      </p>
    </div>

    <p style="margin:0;color:#888;font-size:13px;">
      We look forward to serving you on this sacred journey. Jai Shree Ram!
    </p>
  `;

  await insertIntoEmailQueue(
    data.pilgrimEmail,
    `Departure Reminder - ${data.circuitName} on ${data.departureDate} | Shravan Kumar`,
    wrapInTemplate('Trip Reminder', bodyContent),
  );
}

// ---------------------------------------------------------------------------
// Email Queue Processing
// ---------------------------------------------------------------------------

interface ProcessEmailQueueResult {
  message: string;
  total?: number;
  sent?: number;
  failed?: number;
  error?: string;
}

/**
 * Invokes the Supabase Edge Function to process pending emails in the queue.
 */
export async function processEmailQueue(): Promise<ProcessEmailQueueResult> {
  try {
    const { data, error } = await supabase.functions.invoke('process-email-queue', {
      method: 'POST',
    });

    if (error) {
      console.error('Error invoking process-email-queue:', error);
      return { message: 'Failed to invoke email processor', error: error.message };
    }

    return data as ProcessEmailQueueResult;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('processEmailQueue error:', errorMessage);
    return { message: 'Failed to process email queue', error: errorMessage };
  }
}

/**
 * Fetches email queue statistics: counts by status.
 */
export async function getEmailQueueStats(): Promise<{
  pending: number;
  sent: number;
  failed: number;
}> {
  const stats = { pending: 0, sent: 0, failed: 0 };

  const { data, error } = await supabase
    .from('email_queue')
    .select('status');

  if (error || !data) return stats;

  data.forEach((row: { status: string }) => {
    if (row.status === 'pending') stats.pending++;
    else if (row.status === 'sent') stats.sent++;
    else if (row.status === 'failed') stats.failed++;
  });

  return stats;
}

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

/**
 * Fetches recent email queue entries.
 */
export async function getRecentEmails(limit = 20): Promise<EmailQueueItem[]> {
  const { data, error } = await supabase
    .from('email_queue')
    .select('id, to_email, subject, status, created_at, sent_at, error_message')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent emails:', error);
    return [];
  }

  return data || [];
}
