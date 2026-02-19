import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';

interface TripUpdate {
  id: string;
  trip_id: string;
  date: string;
  activity_description: string;
  photos: string[];
  health_status_summary: string;
  incidents_or_issues: string;
  created_at: string;
}

interface TripInfo {
  id: string;
  departure_date: string;
  return_date: string;
  status: string;
  current_location_name: string;
  circuits: { name: string };
}

export const MyTripUpdatesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookingId = searchParams.get('bookingId');

  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId && user) {
      fetchTripUpdates();
    }
  }, [bookingId, user]);

  const fetchTripUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch booking to get trip_id
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, trip_id, booking_reference')
        .eq('id', bookingId)
        .eq('customer_id', user?.id)
        .maybeSingle();

      if (bookingError) throw bookingError;
      if (!booking) {
        setError('Booking not found');
        return;
      }
      if (!booking.trip_id) {
        setError('No trip has been assigned to this booking yet');
        return;
      }

      // 2. Fetch trip details
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('id, departure_date, return_date, status, current_location_name, circuits (name)')
        .eq('id', booking.trip_id)
        .maybeSingle();

      if (tripError) throw tripError;
      if (!tripData) {
        setError('Trip not found');
        return;
      }
      setTrip(tripData as TripInfo);

      // 3. Fetch daily updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('trip_daily_updates')
        .select('*')
        .eq('trip_id', booking.trip_id)
        .order('date', { ascending: false });

      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);
    } catch (err) {
      console.error('Error fetching trip updates:', err);
      setError('Failed to load trip updates');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!trip?.id) return;

    const channel = supabase
      .channel(`trip-updates-${trip.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_daily_updates', filter: `trip_id=eq.${trip.id}` },
        (payload) => {
          setUpdates((prev) => [payload.new as TripUpdate, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip?.id]);

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="error" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Missing Booking</h2>
          <p className="text-gray-600 mb-6">No booking ID was provided</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="info" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Updates</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1000px] mx-auto px-4 md:px-10">
        {/* Header */}
        {trip && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 rounded-full bg-white border border-[#e7dfda] flex items-center justify-center hover:bg-gray-50"
              >
                <Icon name="arrow_back" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#181410]">{trip.circuits.name}</h1>
                <p className="text-gray-600">
                  {format(new Date(trip.departure_date), 'MMM dd')} - {format(new Date(trip.return_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                {getStatusLabel(trip.status)}
              </span>
            </div>

            {trip.current_location_name && (
              <div className="bg-white rounded-xl p-4 border border-[#e7dfda] flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="location_on" className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Location</p>
                  <p className="font-medium text-[#181410]">{trip.current_location_name}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Updates */}
        <div className="space-y-6">
          {updates.length > 0 ? (
            updates.map((update) => (
              <div key={update.id} className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-[#e7dfda]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="calendar_today" className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#181410]">
                        {format(new Date(update.date), 'EEEE, MMMM dd, yyyy')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Posted at {format(new Date(update.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                      <Icon name="explore" />
                      Today's Activities
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{update.activity_description}</p>
                  </div>

                  {update.health_status_summary && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Icon name="medical_services" />
                        Health Status
                      </h4>
                      <p className="text-gray-700">{update.health_status_summary}</p>
                    </div>
                  )}

                  {update.incidents_or_issues && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
                        <Icon name="warning" />
                        Incidents / Issues
                      </h4>
                      <p className="text-gray-700">{update.incidents_or_issues}</p>
                    </div>
                  )}

                  {update.photos && update.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        <Icon name="photo_library" />
                        Photos ({update.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {update.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Update photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-[#e7dfda] p-12 text-center">
              <Icon name="photo_library" className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Updates Yet</h3>
              <p className="text-gray-600">
                {trip?.status === 'planned'
                  ? 'Updates will appear here once your trip begins. Stay tuned!'
                  : 'The coordinator has not posted any updates yet. Check back later.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
