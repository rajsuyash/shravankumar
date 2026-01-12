import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CircuitCard } from '../components/ui/CircuitCard';
import { Circuit } from '../types/database';
import { supabase } from '../lib/supabase';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircuits();
  }, [location.pathname]);

  const fetchCircuits = async () => {
    try {
      const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (error) throw error;
      setCircuits(data || []);
    } catch (error) {
      console.error('Error fetching circuits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="texture-overlay min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Spiritual Dream (Parent) */}
            <div className="relative group rounded-xl overflow-hidden shadow-xl aspect-[4/3] md:aspect-square lg:aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div
                className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDqaRkStTeG2d3DkuMVOOqtQXyKY9nCCMksAW6-zvwxv4YCUBdXlzv3MdbmdC6YzgKLp8PiFzJclTpoguf0JphcAaKcXtdNEi87W8q-mcy7k1vYsj7LOaDbxc8skZWq6I1buyppsnpz8LmB0dj4h_Cm4acaJUTj5VjGUGCHERe4_iGehyInvdLvbBu82-JL4YbzsXYJpfoh00o19Y8VjfZu-_92TVV_khCqGniz5jk7OgtwYHkVCVmDHwqwy7ZKdohPRVXFe5OIPGE")',
                }}
              ></div>
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-display font-light text-sm md:text-base tracking-wider uppercase mb-1 opacity-90">
                  Their Spiritual Dream
                </p>
                <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight">
                  A Lifetime of Devotion,
                  <br />
                  Finally Fulfilled.
                </h3>
              </div>
            </div>

            {/* Right: Peace of Mind (Child) */}
            <div className="flex flex-col justify-center space-y-8 md:pl-8">
              <div>
                <Badge variant="primary" className="mb-4">
                  The Premium Pilgrimage Service
                </Badge>
                <h1 className="text-[#181410] text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  Fulfill Their Vow. <span className="text-primary block mt-2">Ensure Their Safety.</span>
                </h1>
                <p className="text-[#63554d] mt-6 text-lg font-light leading-relaxed max-w-lg">
                  We bridge the gap between your parents' spiritual longing and your need for their safety. Real-time
                  medical monitoring, verified companions, and seamless logistics.
                </p>
              </div>

              {/* Trust / Safety Visual Indicator */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-[#e7dfda] max-w-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-100 p-2 rounded-full text-green-700">
                    <Icon name="health_and_safety" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#181410]">Active Monitoring</p>
                    <p className="text-xs text-gray-500">Live Dashboard View</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-green-600">SAFE</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1">
                    <Icon name="location_on" className="text-[16px]" /> Varanasi, Ghat 4
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ecg_heart" className="text-[16px]" /> Vitals Normal
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button variant="primary" size="lg" onClick={() => navigate('/circuits')}>
                  Explore Sacred Journeys
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="w-full bg-white border-y border-[#e7dfda]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center gap-2 p-2">
              <Icon name="medical_services" className="text-4xl text-primary mb-1" />
              <p className="text-[#181410] text-2xl font-bold">100%</p>
              <p className="text-gray-500 text-sm font-medium">Medical Staff Accompanied</p>
            </div>

            <div className="flex flex-col items-center text-center gap-2 p-2">
              <Icon name="verified_user" className="text-4xl text-primary mb-1" />
              <p className="text-[#181410] text-2xl font-bold">ISO 9001</p>
              <p className="text-gray-500 text-sm font-medium">Certified Safety Protocols</p>
            </div>

            <div className="flex flex-col items-center text-center gap-2 p-2">
              <Icon name="temple_buddhist" className="text-4xl text-primary mb-1" />
              <p className="text-[#181410] text-2xl font-bold">500+</p>
              <p className="text-gray-500 text-sm font-medium">Verified Pandits & Guides</p>
            </div>

            <div className="flex flex-col items-center text-center gap-2 p-2">
              <Icon name="diversity_1" className="text-4xl text-primary mb-1" />
              <p className="text-[#181410] text-2xl font-bold">10k+</p>
              <p className="text-gray-500 text-sm font-medium">Elders Blessed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sacred Circuits */}
      <section id="circuits" className="max-w-[1280px] mx-auto px-4 md:px-10 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-[#181410] text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
              Featured Sacred Circuits
            </h2>
            <p className="text-[#63554d] text-lg max-w-xl">
              Curated pilgrimages designed for comfort, darshan priority, and medical safety.
            </p>
          </div>
          <button onClick={() => navigate('/circuits')} className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All Circuits <Icon name="arrow_forward" className="text-sm" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg h-96 border border-[#e7dfda]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {circuits.map((circuit) => (
              <CircuitCard key={circuit.id} circuit={circuit} onDetailsClick={() => navigate(`/circuits/${circuit.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* The Shravan Kumar Promise */}
      <section className="bg-[#eceae5] py-16 md:py-24 border-t border-[#e7dfda]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
              Why families trust us
            </span>
            <h2 className="text-[#181410] text-3xl md:text-4xl font-bold mb-4">The Shravan Kumar Promise</h2>
            <p className="text-[#63554d]">
              We treat your parents with the same devotion as our namesake. Every journey is planned with meticulous
              attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e7dfda] hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Icon name="elderly" className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#181410] mb-3">Dharma-First Service</h3>
              <p className="text-[#63554d] text-sm leading-relaxed">
                Our staff is trained not just in logistics, but in 'Seva' (service). We ensure your parents feel honored
                and respected throughout their journey.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e7dfda] hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Icon name="map" className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#181410] mb-3">Accessible Routes</h3>
              <p className="text-[#63554d] text-sm leading-relaxed">
                We carefully select temples and paths that are wheelchair friendly or offer palki services, minimizing
                physical strain.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e7dfda] hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Icon name="smartphone" className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#181410] mb-3">You Are Always Connected</h3>
              <p className="text-[#63554d] text-sm leading-relaxed">
                Through our app, you can track their location, view their health stats, and even video call them during
                Darshan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
