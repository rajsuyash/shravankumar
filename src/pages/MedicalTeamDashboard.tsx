import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { queueMedicalClearanceEmail } from '../lib/emailService';
import { Icon, Button, Badge } from '../components/ui';
import { format } from 'date-fns';

interface MedicalAssessment {
  id: string;
  booking_id: string;
  chronic_diseases: string[];
  medications: string[];
  allergies: string;
  mobility_level: string;
  oxygen_required: boolean;
  dietary_restrictions: string;
  medical_clearance: boolean;
  flagged_high_risk: boolean;
  doctor_notes: string;
  created_at: string;
  bookings: {
    booking_reference: string;
    departure_date: string;
    circuits: {
      name: string;
    };
  };
  users: {
    first_name: string;
    last_name: string;
    age: number;
    email: string;
    phone: string;
  };
}

interface AuditEntry {
  id: string;
  assessment_id: string;
  action: string;
  performed_by: string;
  notes: string | null;
  created_at: string;
  performer?: {
    first_name: string;
    last_name: string;
  };
}

export const MedicalTeamDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<MedicalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'cleared' | 'flagged'>('pending');
  const [selectedAssessment, setSelectedAssessment] = useState<MedicalAssessment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_assessments')
        .select(`
          *,
          bookings (
            booking_reference,
            departure_date,
            circuits (
              name
            )
          ),
          users:pilgrim_id (
            first_name,
            last_name,
            age,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditHistory = useCallback(async (assessmentId: string) => {
    try {
      setAuditLoading(true);
      const { data, error } = await supabase
        .from('medical_audit_trail')
        .select(`
          *,
          performer:performed_by (
            first_name,
            last_name
          )
        `)
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuditHistory(data || []);
    } catch (error) {
      console.error('Error fetching audit history:', error);
      setAuditHistory([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const logAuditTrail = async (
    assessmentId: string,
    action: 'approved' | 'revoked' | 'flagged_high_risk' | 'note_added',
    notes?: string,
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from('medical_audit_trail').insert({
        assessment_id: assessmentId,
        action,
        performed_by: user.id,
        notes: notes || null,
      });

      if (error) {
        console.error('Error logging audit trail:', error);
      }
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  };

  const updateClearance = async (assessmentId: string, cleared: boolean) => {
    try {
      const { error } = await supabase
        .from('medical_assessments')
        .update({ medical_clearance: cleared })
        .eq('id', assessmentId);

      if (error) throw error;

      // Log to audit trail
      await logAuditTrail(assessmentId, cleared ? 'approved' : 'revoked');

      // If approving, send medical clearance email
      if (cleared) {
        const assessment = assessments.find((a) => a.id === assessmentId);
        if (assessment) {
          await queueMedicalClearanceEmail({
            pilgrimName: `${assessment.users.first_name} ${assessment.users.last_name}`,
            pilgrimEmail: assessment.users.email,
            bookingReference: assessment.bookings.booking_reference,
            circuitName: assessment.bookings.circuits.name,
            departureDate: format(new Date(assessment.bookings.departure_date), 'MMM dd, yyyy'),
          });
        }
      }

      fetchAssessments();
      alert(`Medical clearance ${cleared ? 'approved' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error updating clearance:', error);
      alert('Failed to update clearance');
    }
  };

  const flagHighRisk = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('medical_assessments')
        .update({ flagged_high_risk: true })
        .eq('id', assessmentId);

      if (error) throw error;

      await logAuditTrail(assessmentId, 'flagged_high_risk');

      // Update local state for the selected assessment
      if (selectedAssessment && selectedAssessment.id === assessmentId) {
        setSelectedAssessment({ ...selectedAssessment, flagged_high_risk: true });
      }

      fetchAssessments();
      // Refresh audit history if the modal is open
      fetchAuditHistory(assessmentId);
      alert('Patient flagged as high risk');
    } catch (error) {
      console.error('Error flagging high risk:', error);
      alert('Failed to flag patient');
    }
  };

  const saveDoctorNotes = async (assessmentId: string) => {
    if (!doctorNotes.trim()) return;

    try {
      setSavingNotes(true);
      const { error } = await supabase
        .from('medical_assessments')
        .update({ doctor_notes: doctorNotes })
        .eq('id', assessmentId);

      if (error) throw error;

      await logAuditTrail(assessmentId, 'note_added', doctorNotes);

      // Update local state
      if (selectedAssessment && selectedAssessment.id === assessmentId) {
        setSelectedAssessment({ ...selectedAssessment, doctor_notes: doctorNotes });
      }

      fetchAssessments();
      fetchAuditHistory(assessmentId);
      alert('Doctor notes saved');
    } catch (error) {
      console.error('Error saving doctor notes:', error);
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const openAssessmentDetail = (assessment: MedicalAssessment) => {
    setSelectedAssessment(assessment);
    setDoctorNotes(assessment.doctor_notes || '');
    fetchAuditHistory(assessment.id);
  };

  const closeAssessmentDetail = () => {
    setSelectedAssessment(null);
    setDoctorNotes('');
    setAuditHistory([]);
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'approved':
        return 'Clearance Approved';
      case 'revoked':
        return 'Clearance Revoked';
      case 'flagged_high_risk':
        return 'Flagged High Risk';
      case 'note_added':
        return 'Note Added';
      default:
        return action;
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'approved':
        return 'text-green-700 bg-green-50';
      case 'revoked':
        return 'text-red-700 bg-red-50';
      case 'flagged_high_risk':
        return 'text-orange-700 bg-orange-50';
      case 'note_added':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const filterAssessments = (list: MedicalAssessment[]) => {
    switch (filterStatus) {
      case 'pending':
        return list.filter(a => !a.medical_clearance);
      case 'cleared':
        return list.filter(a => a.medical_clearance);
      case 'flagged':
        return list.filter(a => a.flagged_high_risk);
      default:
        return list;
    }
  };

  const filteredAssessments = filterAssessments(assessments);

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#181410] mb-2">Medical Team Dashboard</h1>
          <p className="text-gray-600">Review and manage patient medical assessments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Icon name="schedule" className="text-amber-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {assessments.filter(a => !a.medical_clearance).length}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="check_circle" className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {assessments.filter(a => a.medical_clearance).length}
                </p>
                <p className="text-sm text-gray-600">Cleared</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="warning" className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">
                  {assessments.filter(a => a.flagged_high_risk).length}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="groups" className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#181410]">{assessments.length}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <h2 className="text-2xl font-bold text-[#181410] mb-4">Patient Assessments</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilterStatus('cleared')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'cleared'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cleared
              </button>
              <button
                onClick={() => setFilterStatus('flagged')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'flagged'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
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
            ) : filteredAssessments.length > 0 ? (
              <div className="space-y-4">
                {filteredAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="person" className="text-primary text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#181410] mb-1">
                            {assessment.users.first_name} {assessment.users.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {assessment.users.age} years old | {assessment.bookings.circuits.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Departure: {format(new Date(assessment.bookings.departure_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {assessment.flagged_high_risk && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                            <Icon name="warning" className="mr-1 text-sm" />
                            High Risk
                          </Badge>
                        )}
                        {assessment.medical_clearance ? (
                          <Badge variant="primary" className="bg-green-100 text-green-800 border-green-200">
                            <Icon name="check_circle" className="mr-1 text-sm" />
                            Cleared
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                            <Icon name="schedule" className="mr-1 text-sm" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Chronic Diseases</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {assessment.chronic_diseases.length > 0
                            ? assessment.chronic_diseases.join(', ')
                            : 'None reported'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mobility Level</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {assessment.mobility_level.charAt(0).toUpperCase() + assessment.mobility_level.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Oxygen Required</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {assessment.oxygen_required ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Medications</p>
                        <p className="text-sm font-medium text-[#181410]">
                          {assessment.medications.length} prescribed
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openAssessmentDetail(assessment)}
                      >
                        <Icon name="visibility" className="mr-1" />
                        View Full Assessment
                      </Button>
                      {!assessment.medical_clearance && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateClearance(assessment.id, true)}
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          <Icon name="check_circle" className="mr-1" />
                          Approve Clearance
                        </Button>
                      )}
                      {assessment.medical_clearance && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateClearance(assessment.id, false)}
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Icon name="close" className="mr-1" />
                          Revoke Clearance
                        </Button>
                      )}
                      {!assessment.flagged_high_risk && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => flagHighRisk(assessment.id)}
                          className="bg-orange-50 text-orange-700 hover:bg-orange-100"
                        >
                          <Icon name="warning" className="mr-1" />
                          Flag High Risk
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="medical_services" className="text-6xl text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No assessments found</p>
                <p className="text-gray-500">No medical assessments matching the selected filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#181410]">Medical Assessment Details</h2>
              <button onClick={closeAssessmentDetail} className="text-gray-500 hover:text-gray-700">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-[#181410] mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{selectedAssessment.users.first_name} {selectedAssessment.users.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Age:</p>
                    <p className="font-medium">{selectedAssessment.users.age} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{selectedAssessment.users.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{selectedAssessment.users.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#181410] mb-2">Chronic Diseases</h3>
                {selectedAssessment.chronic_diseases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAssessment.chronic_diseases.map((disease, i) => (
                      <Badge key={i} variant="secondary">{disease}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">None reported</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-[#181410] mb-2">Current Medications</h3>
                {selectedAssessment.medications.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedAssessment.medications.map((med, i) => (
                      <li key={i}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">None reported</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-[#181410] mb-2">Allergies</h3>
                <p className="text-gray-700">{selectedAssessment.allergies || 'None reported'}</p>
              </div>

              <div>
                <h3 className="font-bold text-[#181410] mb-2">Dietary Restrictions</h3>
                <p className="text-gray-700">{selectedAssessment.dietary_restrictions || 'None'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-[#181410] mb-2">Mobility Level</h3>
                  <p className="text-gray-700">{selectedAssessment.mobility_level}</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#181410] mb-2">Oxygen Support</h3>
                  <p className="text-gray-700">{selectedAssessment.oxygen_required ? 'Required' : 'Not required'}</p>
                </div>
              </div>

              {/* Doctor Notes Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-[#181410] mb-3">
                  <Icon name="edit_note" className="mr-1 text-lg align-text-bottom" />
                  Doctor Notes
                </h3>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add medical observations, recommendations, or follow-up instructions..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveDoctorNotes(selectedAssessment.id)}
                    disabled={savingNotes || !doctorNotes.trim()}
                  >
                    {savingNotes ? (
                      <>
                        <Icon name="progress_activity" className="mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="save" className="mr-1" />
                        Save Notes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Audit History Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-[#181410] mb-3">
                  <Icon name="history" className="mr-1 text-lg align-text-bottom" />
                  Audit History
                </h3>
                {auditLoading ? (
                  <div className="flex justify-center py-6">
                    <Icon name="progress_activity" className="text-3xl text-primary animate-spin" />
                  </div>
                ) : auditHistory.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {auditHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                      >
                        <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getActionColor(entry.action)}`}>
                          {getActionLabel(entry.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">
                            by{' '}
                            <span className="font-medium">
                              {entry.performer
                                ? `${entry.performer.first_name} ${entry.performer.last_name}`
                                : 'Unknown'}
                            </span>
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate" title={entry.notes}>
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No audit records yet</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <Button variant="secondary" onClick={closeAssessmentDetail} className="flex-1">
                Close
              </Button>
              {!selectedAssessment.flagged_high_risk && (
                <Button
                  variant="secondary"
                  onClick={() => flagHighRisk(selectedAssessment.id)}
                  className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  <Icon name="warning" className="mr-1" />
                  Flag High Risk
                </Button>
              )}
              {!selectedAssessment.medical_clearance ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    updateClearance(selectedAssessment.id, true);
                    closeAssessmentDetail();
                  }}
                  className="flex-1"
                >
                  Approve Clearance
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    updateClearance(selectedAssessment.id, false);
                    closeAssessmentDetail();
                  }}
                  className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Icon name="close" className="mr-1" />
                  Revoke Clearance
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
