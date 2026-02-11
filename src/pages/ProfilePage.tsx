import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon, Badge } from '../components/ui';

interface PersonalInfo {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
}

interface EmergencyContactEntry {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  is_primary: boolean;
}

interface HealthProfileData {
  blood_group: string;
  allergies: string;
  medications: string[];
  chronic_conditions: string[];
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const commonConditions = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Kidney Disease',
  'Thyroid Disorder',
  'Epilepsy',
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Personal Info state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_pincode: '',
  });
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalSaved, setPersonalSaved] = useState(false);

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactEntry[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<Omit<EmergencyContactEntry, 'id'>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    is_primary: false,
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Health profile state
  const [healthProfile, setHealthProfile] = useState<HealthProfileData>({
    blood_group: '',
    allergies: '',
    medications: [],
    chronic_conditions: [],
  });
  const [medicationInput, setMedicationInput] = useState('');
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthSaved, setHealthSaved] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Page loading
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      if (profile) {
        setPersonalInfo({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          address_street: profile.address_street || '',
          address_city: profile.address_city || '',
          address_state: profile.address_state || '',
          address_pincode: profile.address_pincode || '',
        });

        // Load emergency contacts from the user profile
        if (profile.emergency_contacts && Array.isArray(profile.emergency_contacts)) {
          setEmergencyContacts(
            profile.emergency_contacts.map((c: EmergencyContactEntry, index: number) => ({
              ...c,
              id: c.id || `contact-${index}`,
              is_primary: c.is_primary || false,
            }))
          );
        }

        // Load health profile
        if (profile.health_profile) {
          const hp = profile.health_profile;
          setHealthProfile({
            blood_group: hp.blood_group || '',
            allergies: hp.allergies || '',
            medications: hp.medications || [],
            chronic_conditions: hp.chronic_conditions || hp.chronicDiseases || [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setPageLoading(false);
    }
  };

  // --- Personal Info handlers ---
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    setPersonalSaved(false);
  };

  const savePersonalInfo = async () => {
    if (!user) return;
    setPersonalLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: personalInfo.full_name,
          phone: personalInfo.phone,
          date_of_birth: personalInfo.date_of_birth || null,
          gender: personalInfo.gender || null,
          address_street: personalInfo.address_street || null,
          address_city: personalInfo.address_city || null,
          address_state: personalInfo.address_state || null,
          address_pincode: personalInfo.address_pincode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setPersonalSaved(true);
      setTimeout(() => setPersonalSaved(false), 3000);
    } catch (error) {
      console.error('Error saving personal info:', error);
      alert('Failed to save personal information. Please try again.');
    } finally {
      setPersonalLoading(false);
    }
  };

  // --- Emergency Contact handlers ---
  const saveEmergencyContacts = async (contacts: EmergencyContactEntry[]) => {
    if (!user) return;
    setContactLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          emergency_contacts: contacts,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      alert('Failed to save emergency contacts. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const addEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      alert('Please fill in name, relationship, and phone number.');
      return;
    }
    const contact: EmergencyContactEntry = {
      ...newContact,
      id: `contact-${Date.now()}`,
      is_primary: emergencyContacts.length === 0,
    };
    const updatedContacts = [...emergencyContacts, contact];
    await saveEmergencyContacts(updatedContacts);
    setNewContact({ name: '', relationship: '', phone: '', email: '', is_primary: false });
    setShowAddContact(false);
  };

  const updateEmergencyContact = async (id: string, updatedContact: EmergencyContactEntry) => {
    const updatedContacts = emergencyContacts.map((c) =>
      c.id === id ? updatedContact : c
    );
    await saveEmergencyContacts(updatedContacts);
    setEditingContactId(null);
  };

  const deleteEmergencyContact = async (id: string) => {
    const updatedContacts = emergencyContacts.filter((c) => c.id !== id);
    // If deleted contact was primary, make first remaining contact primary
    if (updatedContacts.length > 0 && !updatedContacts.some((c) => c.is_primary)) {
      updatedContacts[0].is_primary = true;
    }
    await saveEmergencyContacts(updatedContacts);
    setDeleteConfirmId(null);
  };

  const markAsPrimary = async (id: string) => {
    const updatedContacts = emergencyContacts.map((c) => ({
      ...c,
      is_primary: c.id === id,
    }));
    await saveEmergencyContacts(updatedContacts);
  };

  // --- Health Profile handlers ---
  const handleConditionToggle = (condition: string) => {
    setHealthProfile((prev) => {
      const conditions = [...prev.chronic_conditions];
      const index = conditions.indexOf(condition);
      if (index > -1) {
        conditions.splice(index, 1);
      } else {
        conditions.push(condition);
      }
      return { ...prev, chronic_conditions: conditions };
    });
    setHealthSaved(false);
  };

  const addMedication = () => {
    if (medicationInput.trim()) {
      setHealthProfile((prev) => ({
        ...prev,
        medications: [...prev.medications, medicationInput.trim()],
      }));
      setMedicationInput('');
      setHealthSaved(false);
    }
  };

  const removeMedication = (index: number) => {
    setHealthProfile((prev) => {
      const medications = [...prev.medications];
      medications.splice(index, 1);
      return { ...prev, medications };
    });
    setHealthSaved(false);
  };

  const saveHealthProfile = async () => {
    if (!user) return;
    setHealthLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          health_profile: {
            blood_group: healthProfile.blood_group || null,
            allergies: healthProfile.allergies || null,
            medications: healthProfile.medications,
            chronic_conditions: healthProfile.chronic_conditions,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setHealthSaved(true);
      setTimeout(() => setHealthSaved(false), 3000);
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('Failed to save health profile. Please try again.');
    } finally {
      setHealthLoading(false);
    }
  };

  // --- Password change handler ---
  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordChanged(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Sign out handler ---
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[900px] mx-auto px-4 md:px-10">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
          >
            <Icon name="arrow_back" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-[#181410] mb-2">My Profile</h1>
          <p className="text-[#63554d]">
            Manage your personal information, emergency contacts, and health details
          </p>
        </div>

        {/* ===== PERSONAL INFORMATION SECTION ===== */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="person" className="text-primary text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#181410]">Personal Information</h2>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={personalInfo.full_name}
                onChange={(e) => handlePersonalInfoChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-[#63554d] cursor-not-allowed"
              />
              <p className="text-xs text-[#63554d] mt-1">
                Email is linked to your account and cannot be changed here.
              </p>
            </div>

            {/* Phone and DOB row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#181410] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#181410] mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={personalInfo.date_of_birth}
                  onChange={(e) => handlePersonalInfoChange('date_of_birth', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Gender
              </label>
              <select
                value={personalInfo.gender}
                onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410] bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                value={personalInfo.address_street}
                onChange={(e) => handlePersonalInfoChange('address_street', e.target.value)}
                placeholder="House No., Street, Locality"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#181410] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={personalInfo.address_city}
                  onChange={(e) => handlePersonalInfoChange('address_city', e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#181410] mb-1.5">
                  State
                </label>
                <select
                  value={personalInfo.address_state}
                  onChange={(e) => handlePersonalInfoChange('address_state', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410] bg-white"
                >
                  <option value="">Select state</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#181410] mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  value={personalInfo.address_pincode}
                  onChange={(e) => handlePersonalInfoChange('address_pincode', e.target.value)}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={savePersonalInfo}
                disabled={personalLoading}
              >
                {personalLoading ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin mr-2 text-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="mr-2 text-sm" />
                    Save Personal Info
                  </>
                )}
              </Button>
              {personalSaved && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Icon name="check_circle" className="text-sm" />
                  Saved successfully
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===== EMERGENCY CONTACTS SECTION ===== */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Icon name="emergency" className="text-red-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-[#181410]">Emergency Contacts</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddContact(true)}
              disabled={contactLoading}
            >
              <Icon name="add" className="mr-1 text-sm" />
              Add Contact
            </Button>
          </div>

          {/* Existing Contacts List */}
          {emergencyContacts.length === 0 && !showAddContact ? (
            <div className="text-center py-8">
              <Icon name="contacts" className="text-5xl text-gray-300 mb-3" />
              <p className="text-[#63554d] mb-1">No emergency contacts added yet</p>
              <p className="text-sm text-gray-400">
                Add at least one emergency contact for your safety during pilgrimages
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`border rounded-lg p-4 ${
                    contact.is_primary ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  {editingContactId === contact.id ? (
                    // Edit mode
                    <EditContactForm
                      contact={contact}
                      onSave={(updated) => updateEmergencyContact(contact.id, updated)}
                      onCancel={() => setEditingContactId(null)}
                      loading={contactLoading}
                    />
                  ) : (
                    // Display mode
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#181410]">{contact.name}</span>
                          <Badge variant={contact.is_primary ? 'primary' : 'default'}>
                            {contact.is_primary ? 'Primary' : contact.relationship}
                          </Badge>
                          {!contact.is_primary && (
                            <span className="text-xs text-[#63554d]">{contact.relationship}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#63554d]">
                          <span className="flex items-center gap-1">
                            <Icon name="phone" className="text-sm" />
                            {contact.phone}
                          </span>
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Icon name="mail" className="text-sm" />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!contact.is_primary && (
                          <button
                            onClick={() => markAsPrimary(contact.id)}
                            className="text-xs text-primary hover:underline"
                            disabled={contactLoading}
                          >
                            Set as Primary
                          </button>
                        )}
                        <button
                          onClick={() => setEditingContactId(contact.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-[#63554d]"
                          title="Edit"
                        >
                          <Icon name="edit" className="text-lg" />
                        </button>
                        {deleteConfirmId === contact.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteEmergencyContact(contact.id)}
                              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              disabled={contactLoading}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(contact.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Icon name="delete" className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Contact Form */}
          {showAddContact && (
            <div className="mt-4 border border-dashed border-primary rounded-lg p-4 bg-primary/5">
              <h4 className="font-bold text-[#181410] mb-4">Add Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#181410] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Contact name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#181410] mb-1">
                    Relationship *
                  </label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410] bg-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#181410] mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#181410] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addEmergencyContact}
                  disabled={contactLoading}
                >
                  {contactLoading ? (
                    <>
                      <Icon name="progress_activity" className="animate-spin mr-1 text-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="mr-1 text-sm" />
                      Add Contact
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContact({ name: '', relationship: '', phone: '', email: '', is_primary: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ===== HEALTH PROFILE SECTION ===== */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Icon name="health_and_safety" className="text-green-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#181410]">Health Profile</h2>
          </div>

          <div className="space-y-6">
            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Blood Group
              </label>
              <select
                value={healthProfile.blood_group}
                onChange={(e) => {
                  setHealthProfile((prev) => ({ ...prev, blood_group: e.target.value }));
                  setHealthSaved(false);
                }}
                className="w-full md:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410] bg-white"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Known Allergies
              </label>
              <textarea
                rows={3}
                value={healthProfile.allergies}
                onChange={(e) => {
                  setHealthProfile((prev) => ({ ...prev, allergies: e.target.value }));
                  setHealthSaved(false);
                }}
                placeholder="List any allergies to medications, foods, or environmental factors"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
              />
            </div>

            {/* Current Medications (tag-style) */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Current Medications
              </label>
              <p className="text-xs text-[#63554d] mb-3">
                Add medications you are currently taking
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  placeholder="e.g., Metformin 500mg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                />
                <Button variant="secondary" size="sm" onClick={addMedication}>
                  <Icon name="add" className="text-sm" />
                  Add
                </Button>
              </div>
              {healthProfile.medications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {healthProfile.medications.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                    >
                      <span className="text-sm text-green-900">{med}</span>
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronic Conditions (checkboxes) */}
            <div>
              <label className="block text-sm font-medium text-[#181410] mb-1.5">
                Chronic Conditions
              </label>
              <p className="text-xs text-[#63554d] mb-3">
                Select any conditions that apply
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonConditions.map((condition) => (
                  <label
                    key={condition}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                      healthProfile.chronic_conditions.includes(condition)
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-gray-200 text-[#63554d] hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={healthProfile.chronic_conditions.includes(condition)}
                      onChange={() => handleConditionToggle(condition)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </div>

            {/* Health Info Note */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="info" className="text-amber-600 text-xl mt-0.5" />
                <p className="text-sm text-[#63554d]">
                  Your health information helps our medical team provide appropriate support during
                  your pilgrimage. This data is kept strictly confidential.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={saveHealthProfile}
                disabled={healthLoading}
              >
                {healthLoading ? (
                  <>
                    <Icon name="progress_activity" className="animate-spin mr-2 text-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="mr-2 text-sm" />
                    Save Health Profile
                  </>
                )}
              </Button>
              {healthSaved && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Icon name="check_circle" className="text-sm" />
                  Saved successfully
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===== ACCOUNT ACTIONS SECTION ===== */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-[#e7dfda] mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon name="settings" className="text-gray-600 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#181410]">Account Actions</h2>
          </div>

          <div className="space-y-4">
            {/* Change Password */}
            {!showPasswordForm ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-[#181410]">Change Password</p>
                  <p className="text-sm text-[#63554d]">Update your account password</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPasswordForm(true)}
                  className="mt-3 md:mt-0"
                >
                  <Icon name="lock" className="mr-1 text-sm" />
                  Change Password
                </Button>
              </div>
            ) : (
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <h4 className="font-bold text-[#181410] mb-4">Change Password</h4>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[#181410] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#181410] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[#181410]"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="error" className="text-sm" />
                      {passwordError}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {passwordChanged && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <Icon name="check_circle" className="text-sm" />
                  Password changed successfully.
                </p>
              </div>
            )}

            {/* Sign Out */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-[#181410]">Sign Out</p>
                <p className="text-sm text-[#63554d]">Sign out of your account on this device</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="mt-3 md:mt-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Icon name="logout" className="mr-1 text-sm" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Inline Edit Contact Form ---
interface EditContactFormProps {
  contact: EmergencyContactEntry;
  onSave: (updated: EmergencyContactEntry) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditContactForm: React.FC<EditContactFormProps> = ({ contact, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({ ...contact });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#181410] mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-[#181410]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#181410] mb-1">Relationship</label>
          <select
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-[#181410] bg-white"
          >
            <option value="">Select</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Relative">Relative</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#181410] mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-[#181410]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#181410] mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-[#181410]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSave(form)}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
