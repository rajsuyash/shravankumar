import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Icon, Button } from '../components/ui';
import { format } from 'date-fns';
import toast from '../lib/toast';

interface TravelerDetail {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone?: string;
}

interface Trip {
  id: string;
  departure_date: string;
  return_date: string;
  status: string;
  group_size: number;
  circuits: {
    id: string;
    name: string;
    duration_days: number;
  };
  bookings: Array<{
    id: string;
    booking_reference: string;
    traveler_details: TravelerDetail[];
  }>;
}

export const CoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          circuits (
            id,
            name,
            duration_days
          )
        `)
        .eq('coordinator_id', user?.id)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (tripId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: newStatus })
        .eq('id', tripId);

      if (error) throw error;
      fetchTrips();
      toast.success(`Trip status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating trip status:', error);
      toast.error('Failed to update trip status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterTrips = (trips: Trip[]) => {
    switch (activeTab) {
      case 'upcoming':
        return trips.filter(t => t.status === 'planned');
      case 'active':
        return trips.filter(t => t.status === 'in_progress');
      case 'completed':
        return trips.filter(t => t.status === 'completed');
      default:
        return trips;
    }
  };

  const filteredTrips = filterTrips(trips);

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#181410] mb-2">Trip Coordinator Dashboard</h1>
              <p className="text-gray-600">Manage and coordinate pilgrim journeys</p>
            </div>
            <Button variant="secondary" onClick={fetchTrips}>
              <Icon name="refresh" className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="schedule" className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {trips.filter(t => t.status === 'planned').length}
                </p>
                <p className="text-sm text-gray-600">Upcoming Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="explore" className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {trips.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600">Active Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="check_circle" className="text-gray-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {trips.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Icon name="groups" className="text-amber-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {trips.reduce((sum, t) => sum + t.group_size, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Pilgrims</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <h2 className="text-2xl font-bold text-[#181410] mb-4">Trips Management</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="space-y-4">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#181410] mb-1">
                          {trip.circuits.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(trip.departure_date), 'MMM dd, yyyy')} - {format(new Date(trip.return_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {trip.circuits.duration_days} Days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Group Size</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {trip.group_size} Pilgrims
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {trip.status === 'in_progress' ? 'Ongoing' : trip.status === 'planned' ? 'Scheduled' : 'Finished'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/trip-detail?tripId=${trip.id}`)}
                      >
                        <Icon name="dashboard" className="mr-1" />
                        Manage Trip
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/trip-updates?tripId=${trip.id}`)}
                      >
                        <Icon name="photo_library" className="mr-1" />
                        Updates
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/messages')}
                      >
                        <Icon name="chat" className="mr-1" />
                        Messages
                      </Button>
                      
                      {/* Status Update Buttons */}
                      {trip.status === 'planned' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateTripStatus(trip.id, 'in_progress')}
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <Icon name="play_arrow" className="mr-1" />
                          Start Trip
                        </Button>
                      )}
                      {trip.status === 'in_progress' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateTripStatus(trip.id, 'completed')}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Icon name="check" className="mr-1" />
                          Complete Trip
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="explore_off" className="text-6xl text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No trips found</p>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'upcoming' && "No upcoming trips scheduled"}
                  {activeTab === 'active' && "No trips currently in progress"}
                  {activeTab === 'completed' && "No completed trips"}
                </p>
                {activeTab === 'upcoming' && (
                  <p className="text-sm text-gray-400">Trips are assigned by the admin team</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
