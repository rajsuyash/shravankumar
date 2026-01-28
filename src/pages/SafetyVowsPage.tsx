import React from 'react';
import { Icon } from '../components/ui/Icon';

export const SafetyVowsPage: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-16 lg:px-20 lg:py-24 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-fixed">
        <div className="mx-auto max-w-[960px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7E9F7A]/30 bg-[#E9F0E8] px-4 py-1.5 mb-8 shadow-sm">
            <Icon name="security" className="text-lg text-[#556B52]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#556B52]">Safety First Protocol</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-none tracking-tight text-[#2C1810] mb-8">
            Our Vow of Safety
          </h1>
          <p className="text-xl lg:text-2xl text-[#7E9F7A] font-medium max-w-3xl mx-auto mb-12 leading-relaxed italic">
            "Fulfilling your Dharma with uncompromising medical vigilance. We care for them as our own."
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-6 py-16 lg:px-20 lg:py-24 bg-[#FDFBF7] relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FDFBF7] to-white/50 pointer-events-none"></div>
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Medical Guardian Card */}
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white border border-[#EBE5D9] shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-[#E9F0E8] rounded-lg text-[#556B52]">
                  <Icon name="cardiology" className="text-3xl" />
                </div>
                <h3 className="text-3xl font-bold text-[#2C1810]">Medical Guardian</h3>
              </div>
              <div className="w-full aspect-[4/3] bg-[#F0EBE0] rounded-xl overflow-hidden relative shadow-inner">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800')",
                    filter: 'sepia(0.2)'
                  }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C1810]/80 to-transparent p-5">
                  <p className="text-[#FDFBF7] font-medium text-base italic tracking-wide">Compassionate care, always.</p>
                </div>
              </div>
              <p className="text-[#4A4A4A] leading-relaxed text-lg">
                Every yatra is accompanied by a qualified medical professional ensuring 24/7 health monitoring.
              </p>
              <ul className="flex flex-col gap-5 mt-auto">
                <li className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-[#7E9F7A] mt-1" />
                  <div>
                    <span className="block font-bold text-[#2C1810] text-lg">24/7 Paramedic Support</span>
                    <span className="text-base text-[#4A4A4A]">Certified professionals on every bus.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-[#7E9F7A] mt-1" />
                  <div>
                    <span className="block font-bold text-[#2C1810] text-lg">Daily Vitals Check</span>
                    <span className="text-base text-[#4A4A4A]">BP & sugar monitoring every morning.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-[#7E9F7A] mt-1" />
                  <div>
                    <span className="block font-bold text-[#2C1810] text-lg">Emergency Oxygen Kits</span>
                    <span className="text-base text-[#4A4A4A]">Portable cylinders at hand.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Golden Hour Protocol Card */}
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#FFFCF5] border border-[#C5A059]/20 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-[#C5A059]">
                <Icon name="hourglass_top" className="text-[200px]" />
              </div>
              <div className="flex items-center gap-4 mb-2 relative z-10">
                <div className="p-3 bg-[#E9F0E8] rounded-lg text-[#556B52]">
                  <Icon name="emergency" className="text-3xl" />
                </div>
                <h3 className="text-3xl font-bold text-[#2C1810]">Golden Hour Protocol</h3>
              </div>
              <p className="text-[#4A4A4A] leading-relaxed relative z-10 text-lg">
                Our rapid response system connects instantly to pre-vetted local hospitals.
              </p>
              <div className="relative flex-1 mt-6 px-2">
                <div className="absolute left-[23px] top-5 bottom-5 w-0.5 bg-[#E0D8C8]"></div>
                <div className="relative z-10 flex flex-col gap-8 h-full justify-between">
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 size-12 rounded-full bg-white border-2 border-[#7E9F7A] flex items-center justify-center shadow-sm">
                      <Icon name="clinical_notes" className="text-[#7E9F7A] text-xl" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-xl font-bold text-[#2C1810]">Immediate Triage</h4>
                      <p className="text-base text-[#4A4A4A] mt-1">On-site paramedic assesses condition within 2 minutes of alert.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 size-12 rounded-full bg-white border-2 border-[#7E9F7A] flex items-center justify-center shadow-sm">
                      <Icon name="ambulance" className="text-[#7E9F7A] text-xl" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-xl font-bold text-[#2C1810]">Rapid Transport</h4>
                      <p className="text-base text-[#4A4A4A] mt-1">Dedicated ambulance activation and route clearance.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 size-12 rounded-full bg-white border-2 border-[#7E9F7A] flex items-center justify-center shadow-sm">
                      <Icon name="local_hospital" className="text-[#7E9F7A] text-xl" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-xl font-bold text-[#2C1810]">Priority Admission</h4>
                      <p className="text-base text-[#4A4A4A] mt-1">Direct entry to ICU in our network of 50+ partner hospitals.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-dashed border-[#C5A059]/30">
                <div className="flex items-center gap-2 text-[#556B52] text-base italic">
                  <Icon name="verified_user" className="text-[#7E9F7A]" />
                  Average response time: &lt; 8 mins
                </div>
              </div>
            </div>

            {/* Physical Comfort Card */}
            <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white border border-[#EBE5D9] shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-[#E9F0E8] rounded-lg text-[#556B52]">
                  <Icon name="accessible" className="text-3xl" />
                </div>
                <h3 className="text-3xl font-bold text-[#2C1810]">Physical Comfort</h3>
              </div>
              <p className="text-[#4A4A4A] leading-relaxed text-lg">
                We eliminate physical strain through infrastructure specifically designed for seniors.
              </p>
              <div className="flex flex-col gap-5 mt-4">
                <div className="flex gap-5 p-5 bg-[#FDFBF7] rounded-xl border border-[#EBE5D9] shadow-sm hover:border-[#7E9F7A]/30 transition-colors">
                  <div className="flex-shrink-0 text-[#556B52] bg-[#E9F0E8] p-2.5 rounded-lg h-fit">
                    <Icon name="directions_bus" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#2C1810]">Low-Step Transport</h4>
                    <p className="text-base text-[#4A4A4A] mt-1">Hydraulic steps for effortless boarding.</p>
                  </div>
                </div>
                <div className="flex gap-5 p-5 bg-[#FDFBF7] rounded-xl border border-[#EBE5D9] shadow-sm hover:border-[#7E9F7A]/30 transition-colors">
                  <div className="flex-shrink-0 text-[#556B52] bg-[#E9F0E8] p-2.5 rounded-lg h-fit">
                    <Icon name="wheelchair_pickup" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#2C1810]">Wheelchair Access</h4>
                    <p className="text-base text-[#4A4A4A] mt-1">Sanctum-to-seat assistance available.</p>
                  </div>
                </div>
                <div className="flex gap-5 p-5 bg-[#FDFBF7] rounded-xl border border-[#EBE5D9] shadow-sm hover:border-[#7E9F7A]/30 transition-colors">
                  <div className="flex-shrink-0 text-[#556B52] bg-[#E9F0E8] p-2.5 rounded-lg h-fit">
                    <Icon name="emoji_people" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#2C1810]">Anti-Slip Safety</h4>
                    <p className="text-base text-[#4A4A4A] mt-1">Grip flooring in all aisles and washrooms.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accreditation Section */}
      <section className="bg-[#F4F1EA] border-t border-[#E0D8C8] py-14 px-6 lg:px-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h4 className="font-bold text-[#2C1810] text-2xl">Accredited by National Safety Boards</h4>
            <p className="text-[#4A4A4A] text-base max-w-md">Ensuring compliance with the highest standards of elder care and travel safety.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-3">
              <Icon name="health_and_safety" className="text-5xl text-[#C5A059]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[#2C1810]">Global<br/>Health</span>
            </div>
            <div className="h-12 w-px bg-[#D6CDBF] hidden md:block"></div>
            <div className="flex items-center gap-3">
              <Icon name="shield_person" className="text-5xl text-[#C5A059]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[#2C1810]">Safe<br/>Travels</span>
            </div>
            <div className="h-12 w-px bg-[#D6CDBF] hidden md:block"></div>
            <div className="flex items-center gap-3">
              <Icon name="medical_information" className="text-5xl text-[#C5A059]" />
              <span className="font-bold text-sm uppercase tracking-widest text-[#2C1810]">Medical<br/>Assoc.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
