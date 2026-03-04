'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, LogIn, LogOut, MapPin, RefreshCw } from 'lucide-react';

interface AttendanceStatus {
  isCheckedIn: boolean;
  attendance: {
    id: string;
    checkInTime: string;
    status: string;
    elapsedTime?: {
      hours: number;
      minutes: number;
      formatted: string;
    };
  } | null;
}

interface CheckInCardProps {
  className?: string;
}

export default function CheckInCard({ className = '' }: CheckInCardProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch current attendance status
  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationEnabled(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationEnabled(true);
      },
      () => {
        setLocationEnabled(false);
        setCurrentLocation(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    fetchStatus();
    getCurrentLocation();

    // Update elapsed time every minute
    const interval = setInterval(() => {
      if (status?.isCheckedIn) {
        fetchStatus();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStatus, getCurrentLocation, status?.isCheckedIn]);

  // Handle check-in
  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const body: { latitude?: number; longitude?: number } = {};
      if (currentLocation) {
        body.latitude = currentLocation.lat;
        body.longitude = currentLocation.lng;
      }

      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in');
      }

      // Refresh status
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const body: { latitude?: number; longitude?: number } = {};
      if (currentLocation) {
        body.latitude = currentLocation.lat;
        body.longitude = currentLocation.lng;
      }

      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check out');
      }

      // Refresh status
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  // Format check-in time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${status?.isCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Clock className={`h-6 w-6 ${status?.isCheckedIn ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-3">
            Attendance
          </h3>
        </div>
        <button
          onClick={fetchStatus}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status Display */}
      <div className="mb-6">
        {status?.isCheckedIn ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Currently Checked In
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Check-in Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {status.attendance?.checkInTime ? formatTime(status.attendance.checkInTime) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time Worked</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {status.attendance?.elapsedTime?.formatted || '0h 0m'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 mb-2">
              Not Checked In
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tap the button below to start your shift
            </p>
          </div>
        )}
      </div>

      {/* Location Indicator */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
        <MapPin className={`h-3 w-3 mr-1 ${locationEnabled ? 'text-green-500' : 'text-gray-400'}`} />
        {locationEnabled ? 'Location enabled' : 'Location not available'}
      </div>

      {/* Action Button */}
      {status?.isCheckedIn ? (
        <button
          onClick={handleCheckOut}
          disabled={actionLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {actionLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking Out...
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5 mr-2" />
              Check Out
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleCheckIn}
          disabled={actionLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {actionLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking In...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Check In
            </>
          )}
        </button>
      )}
    </div>
  );
}
