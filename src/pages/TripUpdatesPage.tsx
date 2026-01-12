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
  created_by: string;
}

interface Trip {
  id: string;
  circuits: {
    name: string;
  };
  departure_date: string;
  return_date: string;
  status: string;
  current_location_name: string;
}

export const TripUpdatesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tripId = searchParams.get('tripId');

  const [trip, setTrip] = useState<Trip | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    activity_description: '',
    health_status_summary: '',
    incidents_or_issues: '',
  });

  useEffect(() => {
    if (tripId) {
      fetchTripAndUpdates();
    }
  }, [tripId]);

  const fetchTripAndUpdates = async () => {
    try {
      setLoading(true);

      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          circuits (name)
        `)
        .eq('id', tripId)
        .maybeSingle();

      if (tripError) throw tripError;
      setTrip(tripData);

      const { data: updatesData, error: updatesError } = await supabase
        .from('trip_daily_updates')
        .select('*')
        .eq('trip_id', tripId)
        .order('date', { ascending: false });

      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);
    } catch (error) {
      console.error('Error fetching trip updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !user) return;

    try {
      const { error } = await supabase.from('trip_daily_updates').insert({
        trip_id: tripId,
        date: new Date().toISOString().split('T')[0],
        activity_description: newUpdate.activity_description,
        health_status_summary: newUpdate.health_status_summary,
        incidents_or_issues: newUpdate.incidents_or_issues,
        photos: [],
        created_by: user.id,
      });

      if (error) throw error;

      setNewUpdate({
        activity_description: '',
        health_status_summary: '',
        incidents_or_issues: '',
      });
      setShowAddForm(false);
      fetchTripAndUpdates();
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update. Please try again.');
    }
  };

  if (!tripId) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="error" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">The trip ID is missing or invalid</p>
          <Button onClick={() => navigate('/coordinator')}>Back to Dashboard</Button>
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

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        {trip && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/coordinator')}
                className="w-10 h-10 rounded-full bg-white border border-[#e7dfda] flex items-center justify-center hover:bg-gray-50"
              >
                <Icon name="arrow_back" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-[#181410]">{trip.circuits.name}</h1>
                <p className="text-gray-600">
                  {format(new Date(trip.departure_date), 'MMM dd')} - {format(new Date(trip.return_date), 'MMM dd, yyyy')}
                  {trip.current_location_name && (
                    <span className="ml-4">
                      <Icon name="location_on" className="inline mr-1" />
                      {trip.current_location_name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
                <Icon name="add" className="mr-2" />
                {showAddForm ? 'Cancel' : 'Add Daily Update'}
              </Button>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-xl border border-[#e7dfda] p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#181410] mb-6">Add Daily Update</h2>
            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newUpdate.activity_description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, activity_description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe today's activities, places visited, and experiences..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Status Summary
                </label>
                <textarea
                  rows={3}
                  value={newUpdate.health_status_summary}
                  onChange={(e) => setNewUpdate({ ...newUpdate, health_status_summary: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Overall health status of the group..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incidents or Issues
                </label>
                <textarea
                  rows={2}
                  value={newUpdate.incidents_or_issues}
                  onChange={(e) => setNewUpdate({ ...newUpdate, incidents_or_issues: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any incidents, issues, or concerns..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="primary">
                  Post Update
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {updates.length > 0 ? (
            updates.map((update) => (
              <div key={update.id} className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-[#e7dfda]">
                  <div className="flex items-center justify-between">
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
              <p className="text-gray-600 mb-6">
                Start posting daily updates to keep families informed about the trip progress
              </p>
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                <Icon name="add" className="mr-2" />
                Add First Update
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
