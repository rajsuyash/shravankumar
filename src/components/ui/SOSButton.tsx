import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface SOSButtonProps {
  onEmergency: () => void;
  bookingId?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onEmergency }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (showConfirm && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showConfirm && countdown === 0 && !confirmed) {
      setConfirmed(true);
      onEmergency();
    }
  }, [showConfirm, countdown, confirmed, onEmergency]);

  const handleSOSClick = () => {
    setShowConfirm(true);
    setCountdown(10);
    setConfirmed(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setCountdown(10);
    setConfirmed(false);
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
              <p className="text-gray-700 mb-6">
                Emergency services will be contacted in <span className="text-3xl font-bold text-red-600">{countdown}</span> seconds
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Trip coordinator and emergency contacts will be notified immediately
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleCancel}
              >
                Cancel Alert
              </Button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="check_circle" className="text-green-600 text-6xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Alert Sent!</h2>
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
              </ul>
              <p className="text-sm font-medium text-gray-800 mb-6">
                Help is on the way. Please stay where you are if possible.
              </p>
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
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOSClick}
      className="fixed bottom-8 right-8 w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform hover:scale-110 animate-pulse"
      aria-label="Emergency SOS"
    >
      <div className="text-center">
        <Icon name="emergency" className="text-white text-4xl" />
        <p className="text-white text-xs font-bold mt-1">SOS</p>
      </div>
    </button>
  );
};
