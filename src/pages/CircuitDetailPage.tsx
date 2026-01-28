import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Circuit } from '../types/database';
import { supabase } from '../lib/supabase';
import { Icon, Button } from '../components/ui';

export const CircuitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCircuit(id);
    }
  }, [id, location.pathname]);

  const fetchCircuit = async (circuitId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .eq('id', circuitId)
        .maybeSingle();

      if (error) throw error;
      setCircuit(data);
    } catch (error) {
      console.error('Error fetching circuit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
          <p className="mt-4 text-gray-600">Loading circuit details...</p>
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="error" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Circuit Not Found</h2>
          <p className="text-gray-600 mb-6">The circuit you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/circuits')}>View All Circuits</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section with Image */}
      <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden">
        {circuit.featured_image_url ? (
          <div
            className="w-full h-full bg-center bg-cover"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url('${circuit.featured_image_url}')`
            }}
          ></div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900 to-orange-800"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl text-center px-4 flex flex-col gap-6 items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium uppercase tracking-wider">
              <Icon name="auto_awesome" className="text-sm" />
              {circuit.difficulty_level}
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-lg">
              {circuit.name}
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl font-light leading-relaxed drop-shadow-md">
              {circuit.description}
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/booking/new?circuit=${circuit.id}`)}
                className="shadow-lg hover:scale-105 transition-transform"
              >
                Book Journey for Parents
              </Button>
              <button onClick={() => navigate(-1)} className="flex items-center justify-center h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-base font-bold transition-all">
                <Icon name="arrow_back" className="mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-10">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-[#e7dfda] shadow-sm">
              <div className="flex flex-1 min-w-[140px] flex-col gap-1 items-center justify-center text-center p-2 border-r last:border-r-0 border-[#e7dfda]">
                <Icon name="calendar_month" className="text-primary mb-1" />
                <p className="text-[#181410] text-xl font-bold">{circuit.duration_days} Days</p>
                <p className="text-[#8d715e] text-sm">Duration</p>
              </div>
              <div className="flex flex-1 min-w-[140px] flex-col gap-1 items-center justify-center text-center p-2 border-r last:border-r-0 border-[#e7dfda]">
                <Icon name="directions_walk" className="text-primary mb-1" />
                <p className="text-[#181410] text-xl font-bold">{circuit.difficulty_level}</p>
                <p className="text-[#8d715e] text-sm">Senior-Friendly Pace</p>
              </div>
              <div className="flex flex-1 min-w-[140px] flex-col gap-1 items-center justify-center text-center p-2 border-r last:border-r-0 border-[#e7dfda]">
                <Icon name="accessible" className="text-primary mb-1" />
                <p className="text-[#181410] text-xl font-bold">{circuit.accessibility_rating}/5</p>
                <p className="text-[#8d715e] text-sm">Accessibility Rating</p>
              </div>
              <div className="flex flex-1 min-w-[140px] flex-col gap-1 items-center justify-center text-center p-2">
                <Icon name="groups" className="text-primary mb-1" />
                <p className="text-[#181410] text-xl font-bold">Max {circuit.max_group_size}</p>
                <p className="text-[#8d715e] text-sm">Small Batch</p>
              </div>
            </div>

            {/* Photo Gallery */}
            {circuit.images && circuit.images.length > 0 && (
              <section>
                <h2 className="text-[#181410] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-6 border-b border-[#f5f2f0] mb-8">
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {circuit.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg aspect-video bg-gray-100 group cursor-pointer border border-[#e7dfda]"
                    >
                      <img
                        src={imageUrl}
                        alt={`${circuit.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Medical Safety Cocoon */}
            <section className="rounded-xl border border-[#c8e6c9] bg-[#f1f8f1] overflow-hidden">
              <div className="bg-[#e8f5e9] px-6 py-4 border-b border-[#c8e6c9] flex items-center gap-3">
                <Icon name="medical_services" className="text-[#2e7d32]" />
                <h2 className="text-[#1b5e20] text-xl font-bold">The Medical Safety Cocoon</h2>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-[#1b5e20]/80 mb-6 text-base leading-relaxed">
                  {circuit.medical_support_details}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#c8e6c9] flex items-center justify-center shrink-0 shadow-sm text-[#2e7d32]">
                      <Icon name="ecg_heart" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-[#181410] font-bold text-base">24/7 Doctor on Call</h3>
                      <p className="text-sm text-[#5d7a60] mt-1">Immediate access to medical specialists</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#c8e6c9] flex items-center justify-center shrink-0 shadow-sm text-[#2e7d32]">
                      <Icon name="local_hospital" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-[#181410] font-bold text-base">Emergency Support</h3>
                      <p className="text-sm text-[#5d7a60] mt-1">Portable medical equipment in all vehicles</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#c8e6c9] flex items-center justify-center shrink-0 shadow-sm text-[#2e7d32]">
                      <Icon name="accessible" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-[#181410] font-bold text-base">Mobility First</h3>
                      <p className="text-sm text-[#5d7a60] mt-1">Wheelchair assistance at all locations</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#c8e6c9] flex items-center justify-center shrink-0 shadow-sm text-[#2e7d32]">
                      <Icon name="person" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-[#181410] font-bold text-base">Shadow Guide</h3>
                      <p className="text-sm text-[#5d7a60] mt-1">Dedicated companion stays close at all times</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pilgrim Path Timeline */}
            <section>
              <h2 className="text-[#181410] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-6 border-b border-[#f5f2f0] mb-8">
                Pilgrim Path Itinerary
              </h2>
              <div className="relative pl-4 md:pl-8 space-y-12">
                {/* Connecting Line */}
                <div className="absolute top-4 left-[27px] md:left-[43px] bottom-10 w-[2px] border-l-2 border-dashed border-primary/40"></div>

                {circuit.itinerary.map((day, index) => (
                  <div key={index} className="relative flex gap-6 group">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-primary flex items-center justify-center text-primary shadow-sm bg-white">
                        <Icon name={index === 0 ? "temple_buddhist" : index === 1 ? "sunny" : "self_improvement"} />
                      </div>
                      <span className="mt-2 text-xs font-bold text-primary uppercase tracking-wider bg-background-light px-1">
                        Day {day.day}
                      </span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-[#e7dfda] p-5 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-[#181410] mb-2">{day.title}</h3>
                      <ul className="space-y-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx} className="text-sm text-[#4a4a4a] leading-relaxed flex items-start gap-2">
                            <Icon name="check_circle" className="text-primary text-[18px] mt-0.5 shrink-0" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section className="bg-white rounded-xl p-8 border border-[#e7dfda]">
              <h2 className="text-2xl font-bold text-[#181410] mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {circuit.included_services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-[#2e7d32] text-[20px] mt-0.5" />
                    <span className="text-[#63554d]">{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Family Stories */}
            <section>
              <h2 className="text-[#181410] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-6 mb-4">
                Family Stories
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#e7dfda] shadow-[4px_4px_0px_0px_rgba(231,223,218,1)] transform hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-[-2deg] shadow-sm z-10 border border-yellow-200/50"></div>
                  <div className="flex items-center gap-4 mb-4 mt-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-white shadow-sm flex items-center justify-center">
                      <Icon name="person" className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#181410]">Mrs. Iyer (72)</p>
                      <p className="text-xs text-[#8d715e]">Gifted by Son</p>
                    </div>
                  </div>
                  <p className="text-xl text-[#4a4a4a] leading-relaxed mb-4 italic">
                    "I never thought I could visit at this age. The team was like family, holding my hand at every step. A blessed journey."
                  </p>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" className="text-sm" />
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e7dfda] shadow-[4px_4px_0px_0px_rgba(231,223,218,1)] transform hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-blue-100/50 rotate-[1deg] shadow-sm z-10 border border-blue-200/50"></div>
                  <div className="flex items-center gap-4 mb-4 mt-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white shadow-sm flex items-center justify-center">
                      <Icon name="person" className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#181410]">Amit V.</p>
                      <p className="text-xs text-[#8d715e]">Booked for Parents</p>
                    </div>
                  </div>
                  <p className="text-xl text-[#4a4a4a] leading-relaxed mb-4 italic">
                    "The medical team assurance is real. My dad had a slight BP drop, and the doctor was there in 10 mins. Very professional."
                  </p>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" className="text-sm" />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:w-[380px]">
            <div className="sticky top-24 flex flex-col gap-4 rounded-xl border border-[#e7dfda] bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-1 border-b border-[#f5f2f0] pb-4">
                <h3 className="text-[#181410] text-lg font-bold leading-tight">All-Inclusive Senior Pilgrim Package</h3>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-primary text-3xl font-black leading-tight tracking-[-0.033em]">
                      ₹{circuit.base_price.toLocaleString()}
                    </span>
                    <span className="text-[#8d715e] text-sm font-medium">/ person</span>
                  </div>
                </div>
                <p className="text-xs text-[#8d715e] mt-1">+ ₹{circuit.medical_surcharge.toLocaleString()} medical surcharge</p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-md"
                  onClick={() => navigate(`/booking/new?circuit=${circuit.id}`)}
                >
                  Book Now
                </Button>
                <Button variant="secondary" size="md" className="w-full">
                  Request Callback
                </Button>
              </div>

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#f5f2f0]">
                <p className="text-xs font-bold text-[#181410] uppercase tracking-wider mb-1">Package Includes</p>
                {circuit.included_services.slice(0, 5).map((service, index) => (
                  <div key={index} className="text-[13px] font-normal leading-normal flex items-start gap-3 text-[#181410]">
                    <Icon name="check_circle" className="text-[#2e7d32] text-[20px] shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-center mt-2">
                <Icon name="verified_user" className="text-blue-600 text-xl shrink-0" />
                <p className="text-xs text-blue-800 font-medium">
                  100% Refund if cancelled 7 days prior due to health reasons.
                </p>
              </div>

              <div className="mt-2 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Need help deciding?</p>
                <button className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  <Icon name="call" className="text-[18px]" />
                  Speak to a Journey Advisor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
