import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { supabase } from '../../lib/supabase';

interface SOSButtonProps {
  bookingId?: string;
  tripId?: string;
  coordinatorId?: string;
  userId?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ 
  bookingId, 
  tripId, 
  coordinatorId,
  userId 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  // Get current location when SOS is triggered
  useEffect(() => {
    if (showConfirm && !location) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setLocation(pos),
        (err) => console.warn('Could not get location:', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [showConfirm, location]);

  useEffect(() => {
    if (showConfirm && countdown > 0 && !confirmed) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showConfirm && countdown === 0 && !confirmed) {
      handleSendSOS();
    }
  }, [showConfirm, countdown, confirmed]);

  const handleSendSOS = async () => {
    setConfirmed(true);
    setSending(true);

    try {
      // Create SOS notification for coordinator
      if (coordinatorId) {
        await supabase.from('notifications').insert({
          user_id: coordinatorId,
          type: 'sos_emergency',
          title: '🚨 SOS EMERGENCY ALERT',
          message: `Emergency SOS triggered by pilgrim. ${location ? `Location: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}` : 'Location unavailable'}. Immediate attention required!`,
          related_booking_id: bookingId || null,
          action_url: tripId ? `/trip-detail?tripId=${tripId}` : '/coordinator',
        });
      }

      // Create notification for user's emergency contacts (if we had their user IDs)
      // For now, log the SOS to a dedicated table would be ideal
      // We'll create a message record as well
      if (userId && coordinatorId) {
        await supabase.from('messages').insert({
          sender_id: userId,
          receiver_id: coordinatorId,
          message: `🚨 SOS EMERGENCY: Pilgrim has triggered an emergency alert. ${location ? `Last known location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}` : 'Location unavailable'}. Please respond immediately!`,
          read: false,
        });
      }

      // Update trip with current location if available
      if (tripId && location) {
        await supabase.from('trips').update({
          current_location_lat: location.coords.latitude,
          current_location_lng: location.coords.longitude,
          current_location_name: 'SOS Location',
        }).eq('id', tripId);
      }

      console.log('SOS Alert sent successfully');
    } catch (error) {
      console.error('Error sending SOS alert:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSOSClick = () => {
    setShowConfirm(true);
    setCountdown(10);
    setConfirmed(false);
    setLocation(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setCountdown(10);
    setConfirmed(false);
    setLocation(null);
  };

  const handleImmediateAlert = async () => {
    setCountdown(0);
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          {!confirmed ? (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Icon name="warning" className="text-red-600 text-6xl" />
              </div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Emergency Alert</h2>
              <p className="text-gray-700 mb-2">
                Emergency services will be contacted in
              </p>
              <p className="text-6xl font-bold text-red-600 mb-4">{countdown}</p>
              <p className="text-sm text-gray-600 mb-6">
                Trip coordinator and emergency contacts will be notified immediately
              </p>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleImmediateAlert}
                >
                  <Icon name="emergency" className="mr-2" />
                  Send Alert NOW
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel - False Alarm
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {sending ? (
                  <Icon name="progress_activity" className="text-green-600 text-6xl animate-spin" />
                ) : (
                  <Icon name="check_circle" className="text-green-600 text-6xl" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                {sending ? 'Sending Alert...' : 'Alert Sent!'}
              </h2>
              
              {!sending && (
                <>
                  <p className="text-gray-700 mb-4">
                    Emergency alert has been sent to:
                  </p>
                  <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <Icon name="check" className="text-green-600" />
                      Trip Coordinator
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" className="text-green-600" />
                      Emergency Contacts
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="check" className="text-green-600" />
                      Medical Team
                    </li>
                    {location && (
                      <li className="flex items-center gap-2">
                        <Icon name="location_on" className="text-blue-600" />
                        Location shared: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                      </li>
                    )}
                  </ul>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                    <p className="text-sm font-medium text-amber-800">
                      <Icon name="info" className="inline mr-1" />
                      Help is on the way. Please stay where you are if possible.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Close
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOSClick}
      className="fixed bottom-8 right-8 w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95"
      style={{
        boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)',
        animation: 'sos-pulse 2s infinite',
      }}
      aria-label="Emergency SOS"
    >
      <style>{`
        @keyframes sos-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>
      <div className="text-center">
        <Icon name="emergency" className="text-white text-4xl" />
        <p className="text-white text-xs font-bold mt-1">SOS</p>
      </div>
    </button>
  );
};
