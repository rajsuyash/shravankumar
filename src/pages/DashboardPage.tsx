import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';
import { format } from 'date-fns';

interface TravelerDetail {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone?: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  departure_date: string;
  return_date: string;
  number_of_travelers: number;
  total_price: number;
  payment_status: string;
  booking_status: string;
  traveler_details: TravelerDetail[];
  circuits: {
    name: string;
    duration_days: number;
    featured_image_url: string;
  };
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          circuits (
            name,
            duration_days,
            featured_image_url
          )
        `)
        .eq('customer_id', user?.id)
        .order('departure_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterBookings = (bookings: Booking[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b => new Date(b.departure_date) >= today && b.booking_status !== 'cancelled' && b.booking_status !== 'completed');
      case 'past':
        return bookings.filter(b => new Date(b.departure_date) < today || b.booking_status === 'completed');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings);

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="lock" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your bookings</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#181410] mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your pilgrimage journeys and bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="confirmation_number" className="text-primary text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">{bookings.length}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="flight_takeoff" className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {bookings.filter(b => b.booking_status === 'confirmed').length}
                </p>
                <p className="text-sm text-gray-600">Upcoming Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="check_circle" className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {bookings.filter(b => b.booking_status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Icon name="medical_services" className="text-amber-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {bookings.reduce((sum, b) => sum + b.number_of_travelers, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Travelers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#181410]">My Bookings</h2>
              <Button variant="primary" onClick={() => navigate('/circuits')}>
                <Icon name="add" className="mr-2" />
                Book New Journey
              </Button>
            </div>

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
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/booking/confirmation?ref=${booking.booking_reference}`)}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={booking.circuits.featured_image_url}
                        alt={booking.circuits.name}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-[#181410] mb-1">
                              {booking.circuits.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Booking Reference: <span className="font-mono font-medium">{booking.booking_reference}</span>
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Departure</p>
                            <p className="text-sm font-medium text-[#181410]">
                              {format(new Date(booking.departure_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-[#181410]">
                              {booking.circuits.duration_days} Days
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Travelers</p>
                            <p className="text-sm font-medium text-[#181410]">
                              {booking.number_of_travelers} {booking.number_of_travelers === 1 ? 'Person' : 'People'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-sm font-medium text-primary">
                              ₹{booking.total_price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/booking/confirmation?ref=${booking.booking_reference}`);
                            }}
                          >
                            View Details
                          </Button>
                          {booking.booking_status === 'confirmed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('Trip tracking will be available 3 days before departure');
                              }}
                            >
                              <Icon name="location_on" className="mr-1" />
                              Track Trip
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="explore_off" className="text-6xl text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No bookings found</p>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming trips"
                    : activeTab === 'past'
                    ? "You don't have any past trips"
                    : "You haven't booked any journeys yet"}
                </p>
                <Button onClick={() => navigate('/circuits')}>
                  Browse Sacred Circuits
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
