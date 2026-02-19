import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon, Badge } from '../components/ui';
import { format } from 'date-fns';
import { generateItineraryPDF, generateBookingConfirmationPDF } from '../lib/pdfGenerator';
import { ReviewForm } from '../components/reviews/ReviewForm';
import toast from '../lib/toast';

interface TravelerDetail {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone?: string;
}

interface MedicalAssessmentData {
  id: string;
  booking_id: string;
  medical_clearance: boolean;
  flagged_high_risk: boolean;
  medical_documents?: { name: string; url: string }[];
}

interface Booking {
  id: string;
  booking_reference: string;
  circuit_id: string;
  departure_date: string;
  return_date: string;
  number_of_travelers: number;
  total_price: number;
  payment_status: string;
  booking_status: string;
  traveler_details: TravelerDetail[];
  trip_id?: string | null;
  circuits: {
    name: string;
    duration_days: number;
    featured_image_url: string;
  };
}

// --- Trip Progress Indicator Component ---
const PROGRESS_STAGES = [
  { key: 'confirmed', label: 'Booking Confirmed', icon: 'confirmation_number' },
  { key: 'medical_review', label: 'Medical Review', icon: 'medical_services' },
  { key: 'medical_cleared', label: 'Medical Cleared', icon: 'verified' },
  { key: 'trip_assigned', label: 'Trip Assigned', icon: 'group' },
  { key: 'in_transit', label: 'In Transit', icon: 'directions_bus' },
  { key: 'completed', label: 'Completed', icon: 'check_circle' },
] as const;

function getProgressStageIndex(
  bookingStatus: string,
  medicalAssessment: MedicalAssessmentData | null
): number {
  if (bookingStatus === 'completed') return 5;
  if (bookingStatus === 'in_transit') return 4;

  if (medicalAssessment) {
    if (medicalAssessment.medical_clearance && bookingStatus === 'confirmed') {
      return 3; // Trip Assigned (cleared + confirmed)
    }
    if (medicalAssessment.medical_clearance) {
      return 2; // Medical Cleared
    }
    // Medical submitted but not yet cleared
    return 1; // Medical Review
  }

  // No medical assessment yet, but booking exists
  if (bookingStatus === 'confirmed' || bookingStatus === 'pending') {
    return 0; // Booking Confirmed
  }

  return 0;
}

const TripProgressIndicator: React.FC<{
  bookingStatus: string;
  medicalAssessment: MedicalAssessmentData | null;
}> = ({ bookingStatus, medicalAssessment }) => {
  const currentIndex = getProgressStageIndex(bookingStatus, medicalAssessment);

  if (bookingStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 rounded-lg">
        <Icon name="cancel" className="text-red-500 text-lg" />
        <span className="text-sm font-medium text-red-700">Booking Cancelled</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-3 left-3 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{
            width: `${(currentIndex / (PROGRESS_STAGES.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 24px)',
          }}
        />

        {PROGRESS_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div
              key={stage.key}
              className="flex flex-col items-center z-10 relative"
              title={stage.label}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Icon name="check" className="text-xs" />
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-white' : isFuture ? 'bg-gray-400' : ''
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 text-center leading-tight max-w-[60px] ${
                  isCompleted || isCurrent
                    ? 'text-primary font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Medical Status Badge Component ---
const MedicalStatusBadge: React.FC<{
  medicalAssessment: MedicalAssessmentData | null;
}> = ({ medicalAssessment }) => {
  if (!medicalAssessment) {
    return (
      <Badge variant="warning">
        <Icon name="schedule" className="text-xs mr-1" />
        Pending Review
      </Badge>
    );
  }

  if (medicalAssessment.flagged_high_risk) {
    return (
      <Badge variant="danger">
        <Icon name="warning" className="text-xs mr-1" />
        High Risk Flagged
      </Badge>
    );
  }

  if (medicalAssessment.medical_clearance) {
    return (
      <Badge variant="success">
        <Icon name="verified" className="text-xs mr-1" />
        Cleared
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      <Icon name="schedule" className="text-xs mr-1" />
      Pending Review
    </Badge>
  );
};

// --- Next Action Recommendations Component ---
const NextStepsCard: React.FC<{
  bookings: Booking[];
  medicalMap: Record<string, MedicalAssessmentData>;
  onBrowse: () => void;
}> = ({ bookings, medicalMap, onBrowse }) => {
  const recommendation = useMemo(() => {
    if (bookings.length === 0) {
      return {
        icon: 'explore',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        title: 'Start Your Sacred Journey',
        message: 'Browse our sacred circuits to plan your first pilgrimage.',
        actionLabel: 'Browse Circuits',
        actionFn: onBrowse,
      };
    }

    // Check for trips in progress
    const inTransit = bookings.find((b) => b.booking_status === 'in_transit');
    if (inTransit) {
      return {
        icon: 'directions_bus',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Trip In Progress',
        message:
          'Your trip is in progress. Use the SOS button in case of emergency.',
        actionLabel: null,
        actionFn: null,
      };
    }

    // Check for bookings pending medical review
    const pendingMedical = bookings.find((b) => {
      if (b.booking_status === 'cancelled' || b.booking_status === 'completed') return false;
      const med = medicalMap[b.id];
      return !med || (!med.medical_clearance && !med.flagged_high_risk);
    });
    if (pendingMedical) {
      return {
        icon: 'medical_services',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        title: 'Medical Assessment Under Review',
        message:
          'Your medical assessment is under review. Our team will contact you within 24 hours.',
        actionLabel: null,
        actionFn: null,
      };
    }

    // Check for medical cleared but trip not started
    const clearedNotStarted = bookings.find((b) => {
      if (b.booking_status === 'cancelled' || b.booking_status === 'completed') return false;
      const med = medicalMap[b.id];
      return med && med.medical_clearance && b.booking_status !== 'in_transit';
    });
    if (clearedNotStarted) {
      return {
        icon: 'event_available',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: "You're All Set!",
        message:
          "You're all set! Your trip coordinator will contact you 7 days before departure.",
        actionLabel: null,
        actionFn: null,
      };
    }

    // Default: encourage booking
    return {
      icon: 'explore',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      title: 'Plan Your Next Pilgrimage',
      message: 'Browse our sacred circuits to plan your next journey.',
      actionLabel: 'Browse Circuits',
      actionFn: onBrowse,
    };
  }, [bookings, medicalMap, onBrowse]);

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e7dfda] mb-6">
      <h2 className="text-lg font-bold text-[#181410] mb-4 flex items-center gap-2">
        <Icon name="lightbulb" className="text-primary" />
        Your Next Steps
      </h2>
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${recommendation.bgColor}`}
        >
          <Icon name={recommendation.icon} className={`text-2xl ${recommendation.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#181410] mb-1">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{recommendation.message}</p>
          {recommendation.actionLabel && recommendation.actionFn && (
            <Button variant="primary" size="sm" onClick={recommendation.actionFn}>
              {recommendation.actionLabel}
              <Icon name="arrow_forward" className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [medicalAssessments, setMedicalAssessments] = useState<
    Record<string, MedicalAssessmentData>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

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

      // Fetch medical assessments for all bookings (include medical_documents)
      if (data && data.length > 0) {
        const bookingIds = data.map((b: Booking) => b.id);
        const { data: medData, error: medError } = await supabase
          .from('medical_assessments')
          .select('id, booking_id, medical_clearance, flagged_high_risk, medical_documents')
          .in('booking_id', bookingIds);

        if (!medError && medData) {
          const medMap: Record<string, MedicalAssessmentData> = {};
          medData.forEach((m: MedicalAssessmentData) => {
            medMap[m.booking_id] = m;
          });
          setMedicalAssessments(medMap);
        }
      }

      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchBookings]);

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

  const [downloadingItinerary, setDownloadingItinerary] = useState<string | null>(null);

  const handleDownloadItinerary = async (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingItinerary(booking.id);

      // Fetch the full circuit data including itinerary
      const { data: circuitData, error: circuitError } = await supabase
        .from('circuits')
        .select('name, description, duration_days, difficulty_level, starts_from_city, base_price, medical_surcharge, itinerary, included_services, medical_support_details')
        .eq('name', booking.circuits.name)
        .maybeSingle();

      if (circuitError || !circuitData) {
        toast.error('Could not fetch circuit details. Please try again.');
        return;
      }

      generateItineraryPDF(circuitData, booking);
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      toast.error('Failed to generate itinerary PDF. Please try again.');
    } finally {
      setDownloadingItinerary(null);
    }
  };

  const handleDownloadConfirmation = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    generateBookingConfirmationPDF(booking);
  };

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

        {/* Next Steps Recommendation Card */}
        <NextStepsCard
          bookings={bookings}
          medicalMap={medicalAssessments}
          onBrowse={() => navigate('/circuits')}
        />

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#181410]">My Bookings</h2>
                <Button variant="ghost" size="sm" onClick={() => fetchBookings(true)} disabled={refreshing}>
                  <Icon name={refreshing ? 'progress_activity' : 'refresh'} className={refreshing ? 'animate-spin' : ''} />
                </Button>
                {lastRefreshed && (
                  <span className="text-xs text-gray-400">
                    Updated {format(lastRefreshed, 'h:mm a')}
                  </span>
                )}
              </div>
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
                          <div className="flex items-center gap-2">
                            <MedicalStatusBadge
                              medicalAssessment={medicalAssessments[booking.id] || null}
                            />
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.booking_status)}`}>
                              {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                            </div>
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

                        {/* Trip Progress Indicator */}
                        <TripProgressIndicator
                          bookingStatus={booking.booking_status}
                          medicalAssessment={medicalAssessments[booking.id] || null}
                        />

                        {/* Medical Documents */}
                        {medicalAssessments[booking.id]?.medical_documents &&
                          medicalAssessments[booking.id].medical_documents!.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
                              <Icon name="folder" className="text-sm" />
                              Medical Documents ({medicalAssessments[booking.id].medical_documents!.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {medicalAssessments[booking.id].medical_documents!.map((doc, i) => (
                                <a
                                  key={i}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-blue-200 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                  <Icon
                                    name={doc.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                                    className="text-sm"
                                  />
                                  <span className="truncate max-w-[120px]">{doc.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDownloadItinerary(booking, e)}
                            disabled={downloadingItinerary === booking.id}
                          >
                            {downloadingItinerary === booking.id ? (
                              <Icon name="progress_activity" className="mr-1 animate-spin" />
                            ) : (
                              <Icon name="description" className="mr-1" />
                            )}
                            Itinerary PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadConfirmation(booking, e)}
                          >
                            <Icon name="download" className="mr-1" />
                            Confirmation
                          </Button>
                          {booking.booking_status === 'confirmed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/trip-detail?bookingId=${booking.id}&ref=${booking.booking_reference}`);
                              }}
                            >
                              <Icon name="location_on" className="mr-1" />
                              Track Trip
                            </Button>
                          )}
                          {booking.trip_id && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/my-trip-updates?bookingId=${booking.id}`);
                              }}
                            >
                              <Icon name="photo_library" className="mr-1" />
                              Trip Updates
                            </Button>
                          )}
                          {booking.booking_status === 'completed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewBooking(booking);
                              }}
                            >
                              <Icon name="rate_review" className="mr-1" />
                              Write Review
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

      {reviewBooking && (
        <ReviewForm
          circuitId={reviewBooking.circuit_id}
          bookingId={reviewBooking.id}
          circuitName={reviewBooking.circuits.name}
          onSubmitted={() => setReviewBooking(null)}
          onCancel={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
};
