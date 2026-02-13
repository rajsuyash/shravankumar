import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

export const TermsPage: React.FC = () => {
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
              <Icon name="gavel" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#181410]">Terms of Service</h1>
              <p className="text-sm text-[#63554d]">Last Updated: February 2026</p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed">
            Welcome to Shravan Kumar Pilgrimage Services. By accessing or using our platform, you agree
            to be bound by these Terms of Service. Please read them carefully before making any bookings
            or using our services.
          </p>
        </div>

        {/* 1. Service Description */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="info" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">1. Service Description</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Shravan Kumar Pilgrimage Services ("we," "us," or "the Company") provides organized
            pilgrimage tours specifically designed for senior citizens across sacred destinations
            in India. Our services include:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Pilgrimage Booking:</strong> Curated pilgrimage circuits covering major Hindu temples, Jyotirlingas, Char Dham, and other sacred destinations.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Support:</strong> Pre-trip medical assessments, on-trip paramedic support, daily vitals monitoring, and emergency medical response.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Transportation:</strong> Senior-friendly buses with low-step boarding, wheelchair accessibility, anti-slip flooring, and GPS tracking.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Accommodation & Meals:</strong> Senior-appropriate lodging and dietary-compliant meals at all destinations.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Trip Coordination:</strong> Dedicated coordinators, real-time trip updates, and family communication support.</span>
            </li>
          </ul>
        </div>

        {/* 2. Booking Terms & Eligibility */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="book_online" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">2. Booking Terms & Eligibility</h2>
          </div>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">2.1 Eligibility Requirements</h3>
          <ul className="space-y-2 text-[#63554d] mb-6">
            <li className="flex items-start gap-3">
              <Icon name="elderly" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Our pilgrimage services are primarily designed for senior citizens aged <strong className="text-[#181410]">60 years and above</strong>. Younger family members or caregivers may accompany pilgrims subject to availability and additional terms.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span>All pilgrims <strong className="text-[#181410]">must complete the mandatory medical assessment</strong> during the booking process. Incomplete assessments will result in booking being placed on hold.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="id_card" className="text-primary mt-0.5 flex-shrink-0" />
              <span>A valid government-issued photo ID (Aadhaar, Passport, or Voter ID) is required at the time of booking.</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">2.2 Payment Terms</h3>
          <ul className="space-y-2 text-[#63554d] mb-6">
            <li className="flex items-start gap-3">
              <Icon name="payments" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Full payment is required</strong> at the time of booking to confirm your reservation. Partial payments or installment options are not available unless explicitly offered for a specific circuit.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="receipt" className="text-primary mt-0.5 flex-shrink-0" />
              <span>All payments are processed securely through Razorpay. Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="event_busy" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Bookings are confirmed only upon successful payment and medical clearance. See our <Link to="/cancellation-policy" className="text-primary underline hover:no-underline">Cancellation Policy</Link> for refund details.</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">2.3 Medical Clearance</h3>
          <p className="text-[#63554d] leading-relaxed">
            Booking confirmation is contingent on medical clearance from our qualified medical team.
            If our medical team determines that a pilgrim's health condition poses a significant risk
            during the trip, we reserve the right to decline the booking with a full refund. Pilgrims
            flagged as high-risk may be required to provide a physician clearance letter. See our{' '}
            <Link to="/medical-disclosure" className="text-primary underline hover:no-underline">
              Medical Disclosure Agreement
            </Link>{' '}
            for complete details.
          </p>
        </div>

        {/* 3. User Obligations */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="assignment_ind" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">3. User Obligations</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            By using our services, you agree to the following obligations:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="fact_check" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Accurate Information:</strong> You must provide accurate, complete, and truthful personal, medical, and emergency contact information. Any misrepresentation may result in cancellation of your booking without refund.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="health_and_safety" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Safety Protocols:</strong> You must follow all safety protocols, coordinator instructions, and medical team guidance during the pilgrimage. This includes adhering to schedules, staying with the group, and following emergency procedures.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="medication" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Prescribed Medications:</strong> You must carry a sufficient supply of all prescribed medications for the entire duration of the trip, plus a 3-day buffer. Notify the medical team of your medication schedule.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="description" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Documents:</strong> Carry original copies of your medical reports, prescriptions, and any physician clearance letters. Digital copies should also be uploaded to your profile.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="groups" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Respectful Conduct:</strong> Maintain respectful behavior towards fellow pilgrims, coordinators, medical staff, and temple staff at all times.</span>
            </li>
          </ul>
        </div>

        {/* 4. Limitation of Liability */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="shield" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">4. Limitation of Liability</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            While we take every reasonable precaution to ensure the safety and well-being of our pilgrims,
            Shravan Kumar Pilgrimage Services shall not be held liable for:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="thunderstorm" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Weather & Natural Disasters:</strong> Disruptions, delays, or cancellations caused by adverse weather conditions, natural disasters, landslides, floods, or other acts of nature.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="personal_injury" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Pre-existing Health Conditions:</strong> Medical emergencies arising from pre-existing conditions that were not disclosed during the medical assessment, or deterioration of known conditions during the trip.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="warning" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Force Majeure:</strong> Events beyond our reasonable control, including but not limited to pandemics, government restrictions, civil unrest, strikes, road closures, and acts of terrorism.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="location_off" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Third-Party Services:</strong> Acts or omissions of third-party service providers including hotels, restaurants, local transport, and temple administrations.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="do_not_disturb_on" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Non-compliance:</strong> Injuries or losses resulting from a pilgrim's failure to follow safety protocols, coordinator instructions, or medical team guidance.</span>
            </li>
          </ul>
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Icon name="info" className="text-amber-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                Our total liability for any claim arising from our services shall not exceed
                the total amount paid by you for the specific booking in question.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Cancellation & Refunds */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="event_busy" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">5. Cancellation & Refunds</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed">
            Cancellations and refunds are governed by our detailed{' '}
            <Link to="/cancellation-policy" className="text-primary underline hover:no-underline font-medium">
              Cancellation & Refund Policy
            </Link>
            . We encourage you to review the full policy before booking. Key points include tiered
            refund schedules based on cancellation timing, medical emergency exceptions, and
            force majeure provisions.
          </p>
        </div>

        {/* 6. Intellectual Property */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="copyright" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">6. Intellectual Property</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            All content, design, logos, trademarks, text, images, and other materials on the Shravan Kumar
            Pilgrimage platform are the intellectual property of Shravan Kumar Pilgrimage Services or its
            licensors and are protected under applicable Indian intellectual property laws.
          </p>
          <ul className="space-y-2 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="block" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span>You may not reproduce, distribute, modify, or create derivative works from our content without prior written consent.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="block" className="text-[#63554d] mt-0.5 flex-shrink-0" />
              <span>Unauthorized use of our trademarks or branding may result in legal action.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>You may share links to our platform for personal, non-commercial purposes.</span>
            </li>
          </ul>
        </div>

        {/* 7. Dispute Resolution */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="balance" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">7. Dispute Resolution & Governing Law</h2>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="location_city" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Governing Law:</strong> These Terms of Service shall be governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, the Consumer Protection Act, 2019, and other applicable legislation.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="account_balance" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Jurisdiction:</strong> Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="handshake" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Amicable Resolution:</strong> We encourage resolving disputes amicably. Please contact our support team first at <strong>support@shravankumar.com</strong> before initiating any legal proceedings.</span>
            </li>
          </ul>
        </div>

        {/* 8. Modifications */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="edit_note" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">8. Modifications to Terms</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Shravan Kumar Pilgrimage Services reserves the right to modify, update, or revise these
            Terms of Service at any time. Changes will be effective upon posting to this page with an
            updated "Last Updated" date.
          </p>
          <ul className="space-y-2 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="notifications" className="text-primary mt-0.5 flex-shrink-0" />
              <span>We will make reasonable efforts to notify registered users of material changes via email or platform notifications.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="verified" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Continued use of our services after changes are posted constitutes your acceptance of the revised terms.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="history" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Prior versions of these terms may be requested by contacting our support team.</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="contact_support" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">9. Contact Us</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            If you have questions or concerns about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-[#63554d]">
            <p className="flex items-center gap-2">
              <Icon name="mail" className="text-primary" />
              <span>Email: <strong className="text-[#181410]">legal@shravankumar.com</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="phone" className="text-primary" />
              <span>Phone: <strong className="text-[#181410]">+91-11-4567-8900</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="location_on" className="text-primary" />
              <span>Address: <strong className="text-[#181410]">Shravan Kumar Pilgrimage Services Pvt. Ltd., New Delhi, India 110001</strong></span>
            </p>
          </div>
        </div>

        {/* Related Legal Pages Navigation */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <h2 className="text-lg font-bold text-[#181410] mb-4">Related Legal Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              to="/cancellation-policy"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#e7dfda] hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Icon name="event_busy" className="text-primary text-xl" />
              <div>
                <p className="font-medium text-[#181410]">Cancellation Policy</p>
                <p className="text-xs text-[#63554d]">Refunds and cancellations</p>
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
