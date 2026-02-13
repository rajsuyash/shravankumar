import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

export const CancellationPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1000px] mx-auto px-4 md:px-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
        >
          <Icon name="arrow_back" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-xl p-6 md:p-10 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="event_busy" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#181410]">Cancellation & Refund Policy</h1>
              <p className="text-sm text-[#63554d]">Last Updated: February 2026</p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed">
            We understand that plans may change. This policy outlines the cancellation and refund
            terms for all pilgrimage bookings made through Shravan Kumar Pilgrimage Services. Please
            review this policy carefully before making your booking.
          </p>
        </div>

        {/* 1. Refund Schedule */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="calendar_month" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">1. Standard Cancellation & Refund Schedule</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-6">
            Refund amounts are determined by when the cancellation request is received relative to the
            scheduled departure date:
          </p>

          {/* Refund Tiers */}
          <div className="space-y-4">
            {/* Tier 1: 14+ days */}
            <div className="flex items-stretch gap-4 p-5 rounded-lg border-2 border-green-200 bg-green-50">
              <div className="flex flex-col items-center justify-center px-4 border-r border-green-200">
                <span className="text-3xl font-bold text-green-700">100%</span>
                <span className="text-xs text-green-600 font-medium">REFUND</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#181410] mb-1">14 or More Days Before Departure</h3>
                <p className="text-[#63554d] text-sm">
                  Full refund of the booking amount, minus a processing fee of 2.5% (Razorpay transaction
                  charges). Refund will be credited to the original payment method.
                </p>
              </div>
              <div className="flex items-center">
                <Icon name="check_circle" className="text-green-600 text-3xl" />
              </div>
            </div>

            {/* Tier 2: 7-14 days */}
            <div className="flex items-stretch gap-4 p-5 rounded-lg border-2 border-amber-200 bg-amber-50">
              <div className="flex flex-col items-center justify-center px-4 border-r border-amber-200">
                <span className="text-3xl font-bold text-amber-700">50%</span>
                <span className="text-xs text-amber-600 font-medium">REFUND</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#181410] mb-1">7 to 13 Days Before Departure</h3>
                <p className="text-[#63554d] text-sm">
                  50% of the total booking amount will be refunded. The remaining 50% covers
                  pre-arranged accommodations, transport reservations, and administrative costs.
                </p>
              </div>
              <div className="flex items-center">
                <Icon name="info" className="text-amber-600 text-3xl" />
              </div>
            </div>

            {/* Tier 3: Less than 7 days */}
            <div className="flex items-stretch gap-4 p-5 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex flex-col items-center justify-center px-4 border-r border-red-200">
                <span className="text-3xl font-bold text-red-700">0%</span>
                <span className="text-xs text-red-600 font-medium">REFUND</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#181410] mb-1">Less Than 7 Days Before Departure</h3>
                <p className="text-[#63554d] text-sm">
                  No refund is available for cancellations made within 7 days of departure. At this stage,
                  all logistics, medical kits, accommodations, and transport have been finalized and paid for.
                </p>
              </div>
              <div className="flex items-center">
                <Icon name="cancel" className="text-red-600 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Medical Emergency Exception */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="emergency" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">2. Medical Emergency Exception</h2>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <div className="flex items-start gap-3">
              <Icon name="favorite" className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                We prioritize the health and well-being of our pilgrims. Medical emergencies are
                treated with compassion and flexibility.
              </p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            If a pilgrim experiences a genuine medical emergency that prevents travel, a{' '}
            <strong className="text-[#181410]">full refund</strong> will be issued regardless of timing,
            subject to the following conditions:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="clinical_notes" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Valid Medical Certificate:</strong> A medical certificate from a registered physician (MBBS or equivalent) must be provided, clearly stating the condition and the inability to travel.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="schedule" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Timely Submission:</strong> The medical certificate must be submitted within 7 days of the cancellation request.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="verified" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Verification:</strong> Our medical team may verify the certificate with the issuing physician. Fraudulent claims will result in denial of refund and potential account suspension.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="family_restroom" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Family Emergency:</strong> Medical emergencies of immediate family members (spouse, children, parents) are also covered under this exception with appropriate documentation.</span>
            </li>
          </ul>
        </div>

        {/* 3. Force Majeure */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="thunderstorm" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">3. Force Majeure</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            If a pilgrimage is cancelled or cannot proceed due to circumstances beyond our control
            (force majeure), the following options will be provided:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-5 rounded-lg border border-[#e7dfda] bg-[#FDFBF7]">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="currency_rupee" className="text-primary text-xl" />
                <h3 className="font-semibold text-[#181410]">Option A: Full Refund</h3>
              </div>
              <p className="text-sm text-[#63554d]">
                100% refund of the booking amount to the original payment method, processed within
                7-10 business days.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-[#e7dfda] bg-[#FDFBF7]">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="event_repeat" className="text-primary text-xl" />
                <h3 className="font-semibold text-[#181410]">Option B: Reschedule</h3>
              </div>
              <p className="text-sm text-[#63554d]">
                Transfer your booking to the next available departure date for the same circuit at
                no additional cost (subject to availability and price parity).
              </p>
            </div>
          </div>
          <p className="text-[#63554d] text-sm">
            Force majeure events include but are not limited to: natural disasters, pandemics, government
            travel restrictions, civil unrest, extreme weather events, and transportation infrastructure
            failures.
          </p>
        </div>

        {/* 4. How to Cancel */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="help" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">4. How to Request a Cancellation</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            You can request a cancellation through any of the following methods:
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-[#e7dfda]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="dashboard" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#181410] mb-1">Through Your Dashboard</h3>
                <p className="text-sm text-[#63554d]">
                  Log in to your account, go to "My Bookings" in the Dashboard, select the booking
                  you wish to cancel, and click "Request Cancellation." Follow the on-screen prompts
                  to complete the process.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border border-[#e7dfda]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="mail" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#181410] mb-1">Via Email</h3>
                <p className="text-sm text-[#63554d]">
                  Send a cancellation request to <strong className="text-[#181410]">cancellations@shravankumar.com</strong>{' '}
                  with your booking ID, registered name, and reason for cancellation. You will receive
                  an acknowledgment within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border border-[#e7dfda]">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="phone" className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#181410] mb-1">Contact Support</h3>
                <p className="text-sm text-[#63554d]">
                  Call our support line at <strong className="text-[#181410]">+91-11-4567-8900</strong>{' '}
                  (Mon-Sat, 9 AM - 6 PM IST) to speak with a representative who can process your
                  cancellation request.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Refund Processing */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="account_balance_wallet" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">5. Refund Processing</h2>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="schedule" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Processing Time:</strong> Approved refunds are processed within <strong>7-10 business days</strong> from the date of cancellation approval.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="credit_card" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Refund Method:</strong> Refunds are credited to the original payment method used at the time of booking. Bank processing times may add an additional 3-5 business days.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="notifications" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Confirmation:</strong> You will receive an email confirmation once the refund has been initiated, along with a transaction reference number.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="support_agent" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Delays:</strong> If you do not receive your refund within the stated timeframe, contact our support team with your cancellation reference number for assistance.</span>
            </li>
          </ul>
        </div>

        {/* 6. Non-Refundable Items */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="money_off" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">6. Non-Refundable Items</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            The following charges are non-refundable under all circumstances:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="do_not_disturb" className="text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Assessment Fees:</strong> The fee for the mandatory pre-trip medical assessment is non-refundable once the assessment has been completed and reviewed by our medical team.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="do_not_disturb" className="text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Travel Insurance:</strong> If you purchased travel insurance separately through our platform or a third-party provider, insurance premiums are non-refundable. Contact the insurance provider directly for insurance-specific claims.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="do_not_disturb" className="text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Payment Processing Fees:</strong> Third-party payment gateway processing fees (approximately 2.5%) are non-refundable as they are charged by Razorpay at the time of transaction.</span>
            </li>
          </ul>
        </div>

        {/* 7. Company-Initiated Cancellations */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="business" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">7. Company-Initiated Cancellations</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Shravan Kumar Pilgrimage Services may cancel a booking in the following situations:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Clearance Denied:</strong> If our medical team determines that a pilgrim's health condition poses an unacceptable risk, a full refund will be issued.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="group_off" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Minimum Group Size:</strong> If the minimum group size for a circuit is not met, you will be offered a full refund or the option to reschedule.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="report" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Safety Concerns:</strong> If safety conditions at any destination deteriorate, the trip may be cancelled with a full refund or partial refund based on services already rendered.</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="contact_support" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">Questions About Cancellations?</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            If you have any questions about this policy or need assistance with a cancellation:
          </p>
          <div className="space-y-2 text-[#63554d]">
            <p className="flex items-center gap-2">
              <Icon name="mail" className="text-primary" />
              <span>Email: <strong className="text-[#181410]">cancellations@shravankumar.com</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="phone" className="text-primary" />
              <span>Phone: <strong className="text-[#181410]">+91-11-4567-8900</strong> (Mon-Sat, 9 AM - 6 PM IST)</span>
            </p>
          </div>
        </div>

        {/* Related Legal Pages Navigation */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <h2 className="text-lg font-bold text-[#181410] mb-4">Related Legal Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/terms"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#e7dfda] hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Icon name="gavel" className="text-primary text-xl" />
              <div>
                <p className="font-medium text-[#181410]">Terms of Service</p>
                <p className="text-xs text-[#63554d]">Service agreement terms</p>
              </div>
            </Link>
            <Link
              to="/privacy-policy"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#e7dfda] hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Icon name="privacy_tip" className="text-primary text-xl" />
              <div>
                <p className="font-medium text-[#181410]">Privacy Policy</p>
                <p className="text-xs text-[#63554d]">How we handle your data</p>
              </div>
            </Link>
            <Link
              to="/medical-disclosure"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#e7dfda] hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Icon name="medical_information" className="text-primary text-xl" />
              <div>
                <p className="font-medium text-[#181410]">Medical Disclosure</p>
                <p className="text-xs text-[#63554d]">Medical data agreement</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
