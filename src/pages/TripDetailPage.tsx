import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Icon, Button, SOSButton } from '../components/ui';
import { PilgrimChecklist } from '../components/coordinator/PilgrimChecklist';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from '../lib/toast';

interface Trip {
  id: string;
  departure_date: string;
  return_date: string;
  status: string;
  group_size: number;
  coordinator_id: string;
  circuits: {
    name: string;
    duration_days: number;
    difficulty_level: string | null;
  };
}

type TabType = 'pilgrims' | 'vendors' | 'staff' | 'issues' | 'expenses' | 'updates';

export const TripDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tripId = searchParams.get('tripId');

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pilgrims');

  useEffect(() => {
    if (!tripId) {
      navigate('/coordinator-dashboard');
      return;
    }
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          circuits (
            name,
            duration_days,
            difficulty_level
          )
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast.error('Failed to load trip details');
      navigate('/coordinator-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      planned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' },
      in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const badge = badges[status] || badges.planned;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-sm font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  const tabs = [
    { id: 'pilgrims', label: 'Pilgrims', icon: 'groups' },
    { id: 'vendors', label: 'Vendors', icon: 'store', badge: 'Coming Soon' },
    { id: 'staff', label: 'Staff', icon: 'badge', badge: 'Coming Soon' },
    { id: 'issues', label: 'Issues', icon: 'error', badge: 'Coming Soon' },
    { id: 'expenses', label: 'Expenses', icon: 'payments', badge: 'Coming Soon' },
    { id: 'updates', label: 'Updates', icon: 'photo_library' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="error" className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600">Trip not found</h2>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/coordinator-dashboard')}>
            <Icon name="arrow_back" className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/coordinator-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <Icon name="arrow_back" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#181410]">{trip.circuits.name}</h1>
                  {getStatusBadge(trip.status)}
                </div>
                <p className="text-gray-600">
                  {format(new Date(trip.departure_date), 'MMM dd, yyyy')} - {format(new Date(trip.return_date), 'MMM dd, yyyy')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/trip-updates?tripId=${trip.id}`)}
                >
                  <Icon name="photo_library" className="mr-2" />
                  View Updates
                </Button>
                {trip.status === 'in_progress' && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/trip-updates?tripId=${trip.id}`)}
                  >
                    <Icon name="add_photo_alternate" className="mr-2" />
                    Post Update
                  </Button>
                )}
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e7dfda]">
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="text-lg font-semibold text-[#181410]">
                  {trip.circuits.duration_days} Days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Group Size</p>
                <p className="text-lg font-semibold text-[#181410]">
                  {trip.group_size} Pilgrims
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Difficulty</p>
                <p className="text-lg font-semibold text-[#181410] capitalize">
                  {trip.circuits.difficulty_level || 'Moderate'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-lg font-semibold text-[#181410] capitalize">
                  {trip.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.badge && setActiveTab(tab.id as TabType)}
                disabled={!!tab.badge}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : tab.badge
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <Icon name={tab.icon} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-[#e7dfda] p-6">
          {activeTab === 'pilgrims' && <PilgrimChecklist tripId={trip.id} />}

          {activeTab === 'vendors' && (
            <div className="text-center py-12">
              <Icon name="store" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Vendor Management</h3>
              <p className="text-gray-500 mb-4">This feature will be available in Week 1, Day 3-4</p>
              <p className="text-sm text-gray-400">
                Manage hotels, transport, restaurants, guides, and other vendors
              </p>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="text-center py-12">
              <Icon name="badge" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Staff Assignments</h3>
              <p className="text-gray-500 mb-4">This feature will be available in Week 1, Day 3-4</p>
              <p className="text-sm text-gray-400">
                Assign doctors, nurses, guides, drivers, and support staff to this trip
              </p>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="text-center py-12">
              <Icon name="error" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Issue Tracking</h3>
              <p className="text-gray-500 mb-4">This feature will be available in Week 2, Day 8-9</p>
              <p className="text-sm text-gray-400">
                Track and resolve medical, transport, accommodation, and other issues
              </p>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="text-center py-12">
              <Icon name="payments" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Financial Reconciliation</h3>
              <p className="text-gray-500 mb-4">This feature will be available in Week 2, Day 8-9</p>
              <p className="text-sm text-gray-400">
                Track expenses, vendor payments, and budget vs actual spending
              </p>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="text-center py-12">
              <Icon name="photo_library" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Trip Updates</h3>
              <p className="text-gray-500 mb-4">View and post daily trip updates with photos</p>
              <Button
                variant="primary"
                onClick={() => navigate(`/trip-updates?tripId=${trip.id}`)}
              >
                <Icon name="photo_library" className="mr-2" />
                Go to Trip Updates
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SOS Emergency Button - visible during active trips */}
      {trip.status === 'in_progress' && (
        <SOSButton
          tripId={trip.id}
          coordinatorId={trip.coordinator_id}
          userId={user?.id}
        />
      )}
    </div>
  );
};
