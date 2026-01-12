import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircuitCard, Icon, Badge } from '../components/ui';
import { Circuit } from '../types/database';
import { supabase } from '../lib/supabase';

export const CircuitsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    search: '',
  });

  useEffect(() => {
    fetchCircuits();
  }, [filters, location.pathname]);

  const fetchCircuits = async () => {
    try {
      setLoading(true);
      let query = supabase.from('circuits').select('*').eq('is_active', true);

      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters.minPrice) {
        query = query.gte('base_price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('base_price', parseFloat(filters.maxPrice));
      }

      if (filters.minDuration) {
        query = query.gte('duration_days', parseInt(filters.minDuration));
      }

      if (filters.maxDuration) {
        query = query.lte('duration_days', parseInt(filters.maxDuration));
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCircuits(data || []);
    } catch (error) {
      console.error('Error fetching circuits:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      search: '',
    });
  };

  return (
    <div className="texture-overlay min-h-screen bg-background-light">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[#181410] text-4xl md:text-5xl font-bold mb-4">Sacred Pilgrimage Circuits</h1>
          <p className="text-[#63554d] text-lg max-w-2xl">
            Discover our carefully curated pilgrimage journeys designed with elderly comfort, medical safety, and
            spiritual fulfillment in mind.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-[#e7dfda] sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#181410]">Filters</h3>
                <button onClick={clearFilters} className="text-primary text-sm font-medium hover:underline">
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#181410] mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search circuits..."
                  className="w-full px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Difficulty Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#181410] mb-2">Difficulty Level</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#181410] mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="Min"
                    className="px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Max"
                    className="px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#181410] mb-2">Duration (Days)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minDuration}
                    onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                    placeholder="Min"
                    className="px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    value={filters.maxDuration}
                    onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value })}
                    placeholder="Max"
                    className="px-4 py-2 border border-[#e7dfda] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Circuit Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(filters.difficulty || filters.minPrice || filters.maxPrice || filters.search) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.difficulty && (
                  <Badge variant="primary">
                    {filters.difficulty}
                    <button
                      onClick={() => setFilters({ ...filters, difficulty: '' })}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="primary">
                    Search: {filters.search}
                    <button onClick={() => setFilters({ ...filters, search: '' })} className="ml-2 hover:text-red-600">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg h-96 border border-[#e7dfda]"></div>
                ))}
              </div>
            ) : circuits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {circuits.map((circuit) => (
                  <CircuitCard key={circuit.id} circuit={circuit} onDetailsClick={() => navigate(`/circuits/${circuit.id}`)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-[#e7dfda]">
                <Icon name="search_off" className="text-6xl text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No circuits found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
                <button onClick={clearFilters} className="text-primary font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
