import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

export const PrivacyPolicyPage: React.FC = () => {
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
              <Icon name="privacy_tip" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#181410]">Privacy Policy</h1>
              <p className="text-sm text-[#63554d]">Last Updated: February 2026</p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Shravan Kumar Pilgrimage Services ("we," "us," or "the Company") is committed to
            protecting your privacy and personal data. This Privacy Policy explains how we collect,
            use, store, and protect your information in compliance with the Information Technology Act,
            2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive
            Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="verified_user" className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                This policy is compliant with Indian data protection regulations and outlines your
                rights regarding your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Data Collection */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="database" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">1. Information We Collect</h2>
          </div>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">1.1 Personal Information</h3>
          <p className="text-[#63554d] leading-relaxed mb-3">
            When you register and book a pilgrimage, we collect the following personal data:
          </p>
          <ul className="space-y-2 text-[#63554d] mb-6">
            <li className="flex items-start gap-3">
              <Icon name="person" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Full name, date of birth, gender, and government ID details</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="phone" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Phone number, email address, and residential address</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="photo_camera" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Photograph (for identification during the pilgrimage)</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">1.2 Medical Information</h3>
          <p className="text-[#63554d] leading-relaxed mb-3">
            Given the nature of our services for senior citizens, we collect sensitive medical data including:
          </p>
          <ul className="space-y-2 text-[#63554d] mb-6">
            <li className="flex items-start gap-3">
              <Icon name="cardiology" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Chronic conditions (diabetes, hypertension, heart disease, etc.)</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="medication" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Current medications and dosage schedules</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="accessible" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Mobility level and special assistance requirements</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="air" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Oxygen requirements and respiratory conditions</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="warning" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Allergies (medication, food, and environmental)</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="description" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Medical documents, prescriptions, and physician clearance letters</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="bloodtype" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Blood group and vital statistics</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">1.3 Emergency Contact Information</h3>
          <ul className="space-y-2 text-[#63554d] mb-6">
            <li className="flex items-start gap-3">
              <Icon name="emergency" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Names, phone numbers, email addresses, and relationship of designated emergency contacts</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#181410] mb-3">1.4 Payment Information</h3>
          <ul className="space-y-2 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="credit_card" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Transaction records, payment amounts, and booking references (processed through Razorpay)</span>
            </li>
          </ul>
        </div>

        {/* 2. How We Use Your Data */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="settings" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">2. How We Use Your Data</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            We use your information strictly for the following purposes:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="book_online" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Booking & Reservation:</strong> Processing your pilgrimage bookings, managing itineraries, and confirming reservations.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Assessments:</strong> Evaluating fitness for travel, flagging high-risk conditions, and preparing medical support plans for the trip.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="route" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Trip Coordination:</strong> Coordinating logistics, accommodations, transportation, and meal preferences based on your medical needs.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="emergency" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Emergency Services:</strong> Sharing relevant medical data with emergency responders and hospital staff during medical emergencies.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="notifications" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Communication:</strong> Sending booking confirmations, trip updates, safety alerts, and important notifications.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="trending_up" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Service Improvement:</strong> Analyzing anonymized data to improve our services, safety protocols, and pilgrim experience.</span>
            </li>
          </ul>
        </div>

        {/* 3. Medical Data Handling */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="enhanced_encryption" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">3. Medical Data Handling</h2>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="lock" className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                Medical data is treated with the highest level of security and confidentiality
                as classified Sensitive Personal Data under Indian law.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="encrypted" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Storage:</strong> All medical data is stored with AES-256 encryption at rest and TLS 1.3 encryption in transit. Data is hosted on secure, certified cloud infrastructure.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="group" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Access:</strong> Medical data is accessible only to our qualified medical team and authorized emergency services personnel. It is never shared for marketing or commercial purposes.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="schedule" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Retention:</strong> Medical records are retained for <strong>5 years</strong> from the date of the last trip, in compliance with applicable medical record retention regulations. After this period, data is securely deleted.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="delete_forever" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Deletion:</strong> You may request early deletion of medical data, subject to legal retention requirements. See "Your Rights" below.</span>
            </li>
          </ul>
        </div>

        {/* 4. Payment Data */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="payment" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">4. Payment Data</h2>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="credit_card" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Payment Processor:</strong> All payments are processed by <strong>Razorpay</strong>, a PCI-DSS Level 1 compliant payment gateway. We do not directly handle or store your credit/debit card details.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="verified_user" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">PCI-DSS Compliance:</strong> Razorpay adheres to the Payment Card Industry Data Security Standard, ensuring your payment information is processed in a secure environment.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="receipt_long" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">What We Store:</strong> We retain only transaction references, payment amounts, dates, and booking IDs for accounting and refund processing purposes. No card numbers, CVVs, or bank credentials are stored on our servers.</span>
            </li>
          </ul>
        </div>

        {/* 5. Data Sharing */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="share" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">5. Data Sharing</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            We share your data only with the following parties and only to the extent necessary:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Medical Team:</strong> Our qualified medical professionals who review assessments, provide on-trip care, and manage emergency response.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="supervisor_account" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Trip Coordinators:</strong> Assigned coordinators receive relevant information (name, contact, special requirements) needed to manage logistics and ensure pilgrim welfare.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="contacts" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Emergency Contacts:</strong> Your designated emergency contacts are notified in case of medical emergencies or significant trip disruptions.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="local_hospital" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Emergency Services:</strong> Medical data may be shared with hospital staff and emergency responders during a medical emergency to facilitate timely treatment.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="account_balance" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Law Enforcement:</strong> We may disclose data if required by law, court order, or governmental authority, or to protect the safety of our pilgrims and staff.</span>
            </li>
          </ul>
          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Icon name="block" className="text-amber-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                We <strong>never</strong> sell, rent, or trade your personal data to third parties
                for marketing, advertising, or any commercial purpose.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Your Rights */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="admin_panel_settings" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">6. Your Rights</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Under applicable Indian data protection laws, you have the following rights:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="visibility" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Right to Access:</strong> Request a copy of all personal data we hold about you, including medical records and booking history.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="edit" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Right to Correction:</strong> Request correction of any inaccurate or incomplete personal data through your profile or by contacting us.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="delete" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Right to Deletion:</strong> Request deletion of your personal data, subject to legal retention obligations (e.g., medical records must be retained for the mandated period).</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="download" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Right to Data Export:</strong> Request a machine-readable export of your personal data for portability purposes.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="cancel" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Right to Withdraw Consent:</strong> Withdraw your consent for data processing at any time. Note that withdrawing consent for medical data may affect your ability to participate in pilgrimages.</span>
            </li>
          </ul>
          <p className="text-[#63554d] mt-4">
            To exercise any of these rights, contact our Data Protection Officer at{' '}
            <strong className="text-[#181410]">privacy@shravankumar.com</strong>. We will respond to
            your request within 30 days.
          </p>
        </div>

        {/* 7. Data Security */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="security" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">7. Data Security Measures</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            We implement robust technical and organizational measures to protect your data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="encrypted" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Encryption</h3>
              </div>
              <p className="text-sm text-[#63554d]">AES-256 encryption at rest, TLS 1.3 in transit for all data transmissions.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="shield" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Row-Level Security</h3>
              </div>
              <p className="text-sm text-[#63554d]">Database RLS ensures users can only access their own data at the database level.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="history" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Audit Trails</h3>
              </div>
              <p className="text-sm text-[#63554d]">All data access and modifications are logged with timestamps for accountability.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="key" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Access Control</h3>
              </div>
              <p className="text-sm text-[#63554d]">Role-based access control limits data visibility to authorized personnel only.</p>
            </div>
          </div>
        </div>

        {/* 8. Cookie Policy */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="cookie" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">8. Cookie Policy</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Our platform uses only <strong className="text-[#181410]">essential cookies</strong> required for the proper functioning of the service:
          </p>
          <ul className="space-y-2 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Authentication Cookies:</strong> To keep you signed in securely during your session.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Session Cookies:</strong> To maintain your session state and preferences while using the platform.</span>
            </li>
          </ul>
          <p className="text-[#63554d] mt-4">
            We do <strong className="text-[#181410]">not</strong> use tracking cookies, advertising
            cookies, or third-party analytics cookies.
          </p>
        </div>

        {/* 9. Contact */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="contact_support" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">9. Data Protection Contact</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            For any data-related inquiries, concerns, or to exercise your rights, please contact:
          </p>
          <div className="space-y-2 text-[#63554d]">
            <p className="flex items-center gap-2">
              <Icon name="badge" className="text-primary" />
              <span>Data Protection Officer: <strong className="text-[#181410]">Shravan Kumar Pilgrimage Services</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="mail" className="text-primary" />
              <span>Email: <strong className="text-[#181410]">privacy@shravankumar.com</strong></span>
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
          <p className="text-sm text-[#63554d] mt-4">
            You may also file a complaint with the relevant data protection authority if you believe
            your data rights have been violated.
          </p>
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
