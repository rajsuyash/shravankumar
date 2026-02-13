import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, Button } from '../ui';
import { format } from 'date-fns';
import toast from '../../lib/toast';

interface PilgrimChecklistItem {
  id: string;
  booking_id: string;
  trip_id: string;
  pilgrim_index: number;
  pilgrim_name: string;
  pilgrim_age: number | null;
  checked_in: boolean;
  checked_in_at: string | null;
  medical_clearance_verified: boolean;
  medical_clearance_verified_at: string | null;
  documents_verified: boolean;
  documents_verified_at: string | null;
  payment_verified: boolean;
  special_needs_flagged: boolean;
  special_needs_notes: string | null;
  notes: string | null;
  bookings: {
    booking_reference: string;
    customer_id: string;
  };
}

interface PilgrimChecklistProps {
  tripId: string;
}

export const PilgrimChecklist: React.FC<PilgrimChecklistProps> = ({ tripId }) => {
  const { user } = useAuth();
  const [pilgrims, setPilgrims] = useState<PilgrimChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked-in' | 'issues'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPilgrims();
    setupRealtimeSubscription();
  }, [tripId]);

  const fetchPilgrims = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('pilgrim_checklist')
        .select(`
          *,
          bookings (
            booking_reference,
            customer_id
          )
        `)
        .eq('trip_id', tripId)
        .order('booking_id', { ascending: true })
        .order('pilgrim_index', { ascending: true });

      if (error) throw error;
      setPilgrims(data || []);
    } catch (error) {
      console.error('Error fetching pilgrims:', error);
      setError('Failed to load pilgrims. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('pilgrim-checklist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pilgrim_checklist',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchPilgrims();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updatePilgrimStatus = async (
    pilgrimId: string,
    field: 'checked_in' | 'medical_clearance_verified' | 'documents_verified',
    value: boolean
  ) => {
    try {
      setUpdatingId(pilgrimId);
      const updateData: Record<string, boolean | string | null> = { [field]: value };

      if (value) {
        updateData[`${field}_at`] = new Date().toISOString();
        // Add audit trail for checked_in and medical_clearance_verified
        if (field === 'checked_in' && user) {
          updateData['checked_in_by'] = user.id;
        } else if (field === 'medical_clearance_verified' && user) {
          updateData['medical_clearance_verified_by'] = user.id;
        } else if (field === 'documents_verified') {
          // No *_by field for documents_verified, but set timestamp
        }
      } else {
        updateData[`${field}_at`] = null;
        // Clear the *_by field when unchecking
        if (field === 'checked_in') {
          updateData['checked_in_by'] = null;
        } else if (field === 'medical_clearance_verified') {
          updateData['medical_clearance_verified_by'] = null;
        }
      }

      const { error } = await supabase
        .from('pilgrim_checklist')
        .update(updateData)
        .eq('id', pilgrimId);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field.replace(/_/g, ' ')}. Please try again.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSpecialNeeds = async (pilgrimId: string, currentValue: boolean) => {
    try {
      setUpdatingId(pilgrimId);
      const { error } = await supabase
        .from('pilgrim_checklist')
        .update({ special_needs_flagged: !currentValue })
        .eq('id', pilgrimId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling special needs:', error);
      toast.error('Failed to update special needs flag.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (pilgrim: PilgrimChecklistItem) => {
    if (!pilgrim.checked_in) return 'border-yellow-400 bg-yellow-50';
    if (pilgrim.special_needs_flagged) return 'border-red-400 bg-red-50';
    if (!pilgrim.medical_clearance_verified || !pilgrim.documents_verified) {
      return 'border-orange-400 bg-orange-50';
    }
    return 'border-green-400 bg-green-50';
  };

  const getStatusIcon = (pilgrim: PilgrimChecklistItem) => {
    if (!pilgrim.checked_in) return { icon: 'schedule', color: 'text-yellow-600' };
    if (pilgrim.special_needs_flagged) return { icon: 'warning', color: 'text-red-600' };
    if (!pilgrim.medical_clearance_verified || !pilgrim.documents_verified) {
      return { icon: 'info', color: 'text-orange-600' };
    }
    return { icon: 'check_circle', color: 'text-green-600' };
  };

  const filteredPilgrims = pilgrims.filter((pilgrim) => {
    // Search filter
    const matchesSearch = pilgrim.pilgrim_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilgrim.bookings.booking_reference.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    switch (filterStatus) {
      case 'pending':
        return !pilgrim.checked_in;
      case 'checked-in':
        return pilgrim.checked_in;
      case 'issues':
        return pilgrim.special_needs_flagged || !pilgrim.medical_clearance_verified || !pilgrim.documents_verified;
      default:
        return true;
    }
  });

  const stats = {
    total: pilgrims.length,
    checkedIn: pilgrims.filter(p => p.checked_in).length,
    medicalCleared: pilgrims.filter(p => p.medical_clearance_verified).length,
    issues: pilgrims.filter(p =>
      p.special_needs_flagged ||
      !p.medical_clearance_verified ||
      !p.documents_verified ||
      !p.checked_in
    ).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="error" className="text-6xl text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-600 mb-2">Error Loading Pilgrims</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button variant="primary" onClick={fetchPilgrims}>
          <Icon name="refresh" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-[#e7dfda]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="groups" className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#181410]">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Pilgrims</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e7dfda]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="check_circle" className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#181410]">{stats.checkedIn}</p>
              <p className="text-xs text-gray-600">Checked In</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e7dfda]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="medical_services" className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#181410]">{stats.medicalCleared}</p>
              <p className="text-xs text-gray-600">Medical Cleared</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#e7dfda]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="warning" className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#181410]">{stats.issues}</p>
              <p className="text-xs text-gray-600">Special Needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-4 border border-[#e7dfda]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or booking reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'checked-in', 'issues'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as typeof filterStatus)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pilgrim List */}
      <div className="space-y-3">
        {filteredPilgrims.length > 0 ? (
          filteredPilgrims.map((pilgrim) => {
            const statusInfo = getStatusIcon(pilgrim);
            return (
              <div
                key={pilgrim.id}
                className={`bg-white rounded-lg p-4 border-2 ${getStatusColor(pilgrim)} transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pilgrim.checked_in ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon name={statusInfo.icon} className={`${statusInfo.color} text-xl`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#181410]">{pilgrim.pilgrim_name}</h3>
                      <p className="text-sm text-gray-600">
                        Booking: {pilgrim.bookings.booking_reference}
                        {pilgrim.pilgrim_age && ` • Age: ${pilgrim.pilgrim_age}`}
                      </p>
                    </div>
                  </div>
                  {pilgrim.special_needs_flagged && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Special Needs
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`check-in-${pilgrim.id}`}
                      checked={pilgrim.checked_in}
                      onChange={(e) => updatePilgrimStatus(pilgrim.id, 'checked_in', e.target.checked)}
                      disabled={updatingId === pilgrim.id}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`check-in-${pilgrim.id}`} className="text-sm text-gray-700">
                      Checked In
                      {pilgrim.checked_in_at && (
                        <span className="block text-xs text-gray-500">
                          {format(new Date(pilgrim.checked_in_at), 'MMM dd, HH:mm')}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`medical-${pilgrim.id}`}
                      checked={pilgrim.medical_clearance_verified}
                      onChange={(e) => updatePilgrimStatus(pilgrim.id, 'medical_clearance_verified', e.target.checked)}
                      disabled={updatingId === pilgrim.id}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`medical-${pilgrim.id}`} className="text-sm text-gray-700">
                      Medical Cleared
                      {pilgrim.medical_clearance_verified_at && (
                        <span className="block text-xs text-gray-500">
                          {format(new Date(pilgrim.medical_clearance_verified_at), 'MMM dd, HH:mm')}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`docs-${pilgrim.id}`}
                      checked={pilgrim.documents_verified}
                      onChange={(e) => updatePilgrimStatus(pilgrim.id, 'documents_verified', e.target.checked)}
                      disabled={updatingId === pilgrim.id}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`docs-${pilgrim.id}`} className="text-sm text-gray-700">
                      Docs Verified
                      {pilgrim.documents_verified_at && (
                        <span className="block text-xs text-gray-500">
                          {format(new Date(pilgrim.documents_verified_at), 'MMM dd, HH:mm')}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`payment-${pilgrim.id}`}
                      checked={pilgrim.payment_verified}
                      disabled
                      className="w-4 h-4 text-gray-400 border-gray-300 rounded"
                    />
                    <label htmlFor={`payment-${pilgrim.id}`} className="text-sm text-gray-700">
                      Payment
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => toggleSpecialNeeds(pilgrim.id, pilgrim.special_needs_flagged)}
                    disabled={updatingId === pilgrim.id}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                      pilgrim.special_needs_flagged
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon name={pilgrim.special_needs_flagged ? 'flag' : 'outlined_flag'} className="text-base" />
                    {pilgrim.special_needs_flagged ? 'Clear Flag' : 'Flag Special Needs'}
                  </button>
                </div>

                {pilgrim.special_needs_notes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                    <strong>Special Needs:</strong> {pilgrim.special_needs_notes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-[#e7dfda]">
            <Icon name="groups" className="text-6xl text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-600 mb-2">No pilgrims found</p>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Pilgrims will appear here once bookings are confirmed for this trip'}
            </p>
          </div>
        )}
      </div>

      {filteredPilgrims.length > 0 && (
        <div className="flex justify-between items-center bg-white rounded-lg p-4 border border-[#e7dfda]">
          <p className="text-sm text-gray-600">
            Showing {filteredPilgrims.length} of {pilgrims.length} pilgrims
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const csv = [
                  ['Name', 'Age', 'Booking Ref', 'Checked In', 'Medical Cleared', 'Docs Verified', 'Special Needs'].join(','),
                  ...filteredPilgrims.map(p => [
                    p.pilgrim_name,
                    p.pilgrim_age || '',
                    p.bookings.booking_reference,
                    p.checked_in ? 'Yes' : 'No',
                    p.medical_clearance_verified ? 'Yes' : 'No',
                    p.documents_verified ? 'Yes' : 'No',
                    p.special_needs_flagged ? 'Yes' : 'No'
                  ].join(','))
                ].join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pilgrim-checklist-${tripId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                a.click();
              }}
            >
              <Icon name="download" className="mr-1" />
              Export List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
