import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

export const MedicalDisclosurePage: React.FC = () => {
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
              <Icon name="medical_information" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#181410]">Medical Disclosure Agreement</h1>
              <p className="text-sm text-[#63554d]">Last Updated: February 2026</p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            At Shravan Kumar Pilgrimage Services, the safety and well-being of our pilgrims is our
            highest priority. This Medical Disclosure Agreement explains how and why we collect medical
            information, how it is reviewed and used, and your rights regarding your medical data.
          </p>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Icon name="favorite" className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                Our medical protocols are designed with compassion and care. Every decision we make
                is rooted in ensuring your safe and fulfilling pilgrimage experience.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Purpose of Medical Assessment */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="target" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">1. Purpose of Medical Assessment</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Our mandatory medical assessment exists to protect you. Pilgrimages often involve:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="terrain" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Demanding Terrain:</strong> Temple complexes with steep steps, uneven surfaces, and long walking distances that may challenge mobility.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="landscape" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">High-Altitude Destinations:</strong> Sacred sites such as Kedarnath, Badrinath, and Amarnath located at altitudes that can affect oxygen levels and cardiovascular function.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="thermostat" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Extreme Weather Conditions:</strong> Varying temperatures, humidity, and weather patterns across different pilgrimage circuits.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="directions_bus" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Extended Travel:</strong> Long-duration bus journeys, early morning schedules, and physically active itineraries.</span>
            </li>
          </ul>
          <p className="text-[#63554d] leading-relaxed mt-4">
            The medical assessment helps our team understand your health profile so we can provide
            appropriate support, prepare emergency medical kits, and ensure your pilgrimage is both
            safe and comfortable.
          </p>
        </div>

        {/* 2. Medical Data Collected */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="clinical_notes" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">2. Medical Data We Collect</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            During the booking process, you will be asked to provide the following medical information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="cardiology" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Chronic Diseases</h3>
              </div>
              <p className="text-sm text-[#63554d]">Diabetes, hypertension, heart disease, kidney disease, thyroid disorders, asthma, arthritis, epilepsy, and other conditions.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="medication" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Current Medications</h3>
              </div>
              <p className="text-sm text-[#63554d]">All prescribed medications, dosages, frequency, and timing schedules to ensure continuity of care during the trip.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="accessible" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Mobility Assessment</h3>
              </div>
              <p className="text-sm text-[#63554d]">Walking ability, wheelchair requirements, assistance needs, and any physical limitations that affect movement.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="air" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Oxygen Requirements</h3>
              </div>
              <p className="text-sm text-[#63554d]">Supplemental oxygen needs, respiratory conditions, and altitude sensitivity for high-elevation destinations.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="warning" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Allergies</h3>
              </div>
              <p className="text-sm text-[#63554d]">Drug allergies, food allergies, and environmental allergies that could pose risks during the journey.</p>
            </div>
            <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#e7dfda]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="upload_file" className="text-primary" />
                <h3 className="font-semibold text-[#181410]">Medical Documents</h3>
              </div>
              <p className="text-sm text-[#63554d]">Recent medical reports, prescriptions, ECG reports, and any specialist consultation notes relevant to travel fitness.</p>
            </div>
          </div>
        </div>

        {/* 3. Who Reviews Your Data */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="groups" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">3. Who Reviews Your Medical Data</h2>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-start gap-3">
              <Icon name="person" className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                Your medical data is reviewed <strong className="text-[#181410]">exclusively by qualified human medical professionals</strong>.
                We do not use AI, automated systems, or algorithms to make medical clearance decisions.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Qualified Medical Team:</strong> Our medical team consists of licensed physicians (MBBS or equivalent), registered nurses, and certified paramedics with experience in geriatric and travel medicine.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="lock" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Confidentiality:</strong> All medical team members are bound by strict confidentiality agreements. Your data is never discussed with or accessible to non-medical staff, marketing teams, or third parties.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="badge" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Professional Standards:</strong> All reviews follow established medical ethics guidelines and the principles of patient confidentiality as mandated by the Indian Medical Council.</span>
            </li>
          </ul>
        </div>

        {/* 4. High-Risk Flagging Process */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="flag" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">4. High-Risk Flagging Process</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Based on the medical assessment, some pilgrims may be flagged as high-risk. This is not
            a rejection -- it is an additional safety measure:
          </p>
          <div className="relative ml-6 border-l-2 border-primary/30 pl-8 space-y-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[41px] w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <h3 className="text-lg font-semibold text-[#181410] mb-2">Initial Assessment Review</h3>
              <p className="text-[#63554d] text-sm">
                Our medical team reviews your submitted health data and medical documents. Conditions
                such as recent heart surgery, uncontrolled diabetes, severe respiratory issues, or
                recent stroke may trigger a high-risk flag.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-[41px] w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <h3 className="text-lg font-semibold text-[#181410] mb-2">Additional Review</h3>
              <p className="text-[#63554d] text-sm">
                A senior physician conducts a more detailed review. You may be contacted for additional
                information or to clarify specific health concerns.
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-[41px] w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <h3 className="text-lg font-semibold text-[#181410] mb-2">Physician Clearance Letter</h3>
              <p className="text-[#63554d] text-sm">
                You may be required to provide a clearance letter from your treating physician,
                confirming that you are fit to undertake the specific pilgrimage circuit. This letter
                should address the specific risks of the chosen circuit (e.g., altitude, walking distance).
              </p>
            </div>
            {/* Step 4 */}
            <div className="relative">
              <div className="absolute -left-[41px] w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
              <h3 className="text-lg font-semibold text-[#181410] mb-2">Final Decision</h3>
              <p className="text-[#63554d] text-sm">
                Based on all available information, our medical team will either clear you for travel
                (with any special precautions noted), recommend a less demanding circuit, or advise
                against travel with a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* 5. How Medical Data Is Used During the Trip */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="route" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">5. Medical Data Usage During the Trip</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Your medical data is actively used during the pilgrimage to ensure your safety:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="route" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Trip Coordination:</strong> Coordinators are informed of special requirements (wheelchair access, dietary restrictions, rest stops) without accessing detailed medical records.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="medical_services" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Emergency Medical Kits:</strong> Custom medical kits are prepared based on the group's collective health profile, including specific medications, oxygen cylinders, and glucose supplies.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="monitor_heart" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">On-Trip Medical Support:</strong> The accompanying paramedic has access to your medical summary for daily health checks and to respond effectively in case of medical events.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="local_hospital" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Hospital Coordination:</strong> In case of hospitalization, relevant medical data is shared with the treating hospital to facilitate accurate and timely treatment.</span>
            </li>
          </ul>
        </div>

        {/* 6. Medical Clearance Timeline */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="schedule" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">6. Medical Clearance Process & Timeline</h2>
          </div>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="hourglass_top" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Review Timeline:</strong> Your medical assessment is reviewed within <strong>24 hours</strong> of submission during business days (Mon-Sat).</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="notifications" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Clearance Notification:</strong> You will receive a notification via email and in-app message once your medical assessment has been reviewed, indicating clearance status.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="description" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Additional Documents:</strong> If additional documents are required, you will be notified with specific instructions on what is needed. A 7-day window is provided to submit additional documents.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="replay" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Re-assessment:</strong> If your health condition changes between booking and departure, you may request a re-assessment. Notify us at least 7 days before departure.</span>
            </li>
          </ul>
        </div>

        {/* 7. Consent */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="handshake" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">7. Your Consent</h2>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
            <div className="flex items-start gap-3">
              <Icon name="info" className="text-amber-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                By completing the booking process and submitting your medical assessment, you provide
                explicit consent to the collection, review, and use of your medical data as described
                in this agreement.
              </p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            Specifically, by booking a pilgrimage with Shravan Kumar, you consent to:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Collection and storage of your medical data as described in Section 2.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Review of your medical data by our qualified medical team for fitness assessment.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Use of your medical data for trip coordination, medical kit preparation, and on-trip care.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Sharing of medical data with the on-trip paramedic and medical support staff.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="check_circle" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Retention of medical records for 5 years per regulatory requirements.</span>
            </li>
          </ul>
        </div>

        {/* 8. Emergency Data Sharing */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="emergency" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">8. Emergency Data Sharing</h2>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <div className="flex items-start gap-3">
              <Icon name="emergency" className="text-red-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#63554d]">
                <strong className="text-[#181410]">Critical:</strong> By booking a pilgrimage, you
                consent to your medical data being shared with emergency services (hospitals, ambulance
                services, emergency responders) during a medical emergency on the trip.
              </p>
            </div>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            In a medical emergency during your pilgrimage:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="local_hospital" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Relevant medical data (conditions, medications, allergies, blood group) will be shared immediately with the treating hospital and emergency medical team.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="contacts" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Your designated emergency contacts will be notified immediately of the situation.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="description" className="text-primary mt-0.5 flex-shrink-0" />
              <span>Medical documents you have uploaded may be provided to the treating hospital for reference.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="security" className="text-primary mt-0.5 flex-shrink-0" />
              <span>All emergency data sharing is logged and audited. Data shared in emergencies is limited to what is medically necessary.</span>
            </li>
          </ul>
        </div>

        {/* 9. Right to Withdraw */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="undo" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">9. Right to Withdraw Consent</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            You have the right to withdraw your consent for medical data collection and processing at
            any time. However, please be aware of the following implications:
          </p>
          <ul className="space-y-3 text-[#63554d]">
            <li className="flex items-start gap-3">
              <Icon name="warning" className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Booking Cancellation:</strong> Withdrawing consent for medical data processing will result in the cancellation of your booking, as medical assessment is a mandatory requirement for all pilgrimages.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="currency_rupee" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Refund Terms:</strong> Cancellations due to consent withdrawal are subject to the standard <Link to="/cancellation-policy" className="text-primary underline hover:no-underline">Cancellation & Refund Policy</Link> based on the timing of the withdrawal relative to departure.</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="delete_forever" className="text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-[#181410]">Data Deletion:</strong> Upon consent withdrawal, your medical data will be deleted from our systems within 30 days, except where legal retention obligations require us to maintain certain records.</span>
            </li>
          </ul>
          <p className="text-[#63554d] mt-4">
            To withdraw consent, contact our Data Protection Officer at{' '}
            <strong className="text-[#181410]">privacy@shravankumar.com</strong> or call{' '}
            <strong className="text-[#181410]">+91-11-4567-8900</strong>.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="contact_support" className="text-primary text-xl" />
            <h2 className="text-xl font-bold text-[#181410]">Questions About Medical Data?</h2>
          </div>
          <p className="text-[#63554d] leading-relaxed mb-4">
            If you have questions or concerns about how your medical data is handled:
          </p>
          <div className="space-y-2 text-[#63554d]">
            <p className="flex items-center gap-2">
              <Icon name="mail" className="text-primary" />
              <span>Medical Inquiries: <strong className="text-[#181410]">medical@shravankumar.com</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="mail" className="text-primary" />
              <span>Data Protection: <strong className="text-[#181410]">privacy@shravankumar.com</strong></span>
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
              to="/cancellation-policy"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#e7dfda] hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Icon name="event_busy" className="text-primary text-xl" />
              <div>
                <p className="font-medium text-[#181410]">Cancellation Policy</p>
                <p className="text-xs text-[#63554d]">Refunds and cancellations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
