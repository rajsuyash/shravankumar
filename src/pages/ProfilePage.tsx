import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Icon } from '../components/ui';

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  user_type: string;
  profile_photo_url: string | null;
  emergency_contacts: EmergencyContact[];
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'security'>('profile');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        age: data.age?.toString() || '',
      });
      setEmergencyContacts(data.emergency_contacts || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
        })
        .eq('id', user?.id);

      if (error) throw error;
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      alert('Please fill in name, phone, and relationship');
      return;
    }

    const updatedContacts = [...emergencyContacts, newContact];

    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ emergency_contacts: updatedContacts })
        .eq('id', user?.id);

      if (error) throw error;

      setEmergencyContacts(updatedContacts);
      setNewContact({ name: '', relationship: '', phone: '', email: '' });
      alert('Emergency contact added!');
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEmergencyContact = async (index: number) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);

    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ emergency_contacts: updatedContacts })
        .eq('id', user?.id);

      if (error) throw error;

      setEmergencyContacts(updatedContacts);
      alert('Contact removed!');
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Failed to remove contact.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Icon name="lock" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
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
      <div className="max-w-[900px] mx-auto px-4 md:px-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#181410] mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and emergency contacts</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="flex border-b border-[#e7dfda]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="person" className="mr-2 text-lg align-middle" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'emergency'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="emergency" className="mr-2 text-lg align-middle" />
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="lock" className="mr-2 text-lg align-middle" />
              Security
            </button>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    {profile?.profile_photo_url ? (
                      <img
                        src={profile.profile_photo_url}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Icon name="person" className="text-primary text-5xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#181410]">
                      {formData.first_name || formData.last_name
                        ? `${formData.first_name} ${formData.last_name}`
                        : 'Your Name'}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {profile?.user_type || 'Customer'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="55"
                      min="0"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Icon name="progress_activity" className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="save" className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Emergency Contacts Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon name="info" className="text-amber-600 text-xl mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Important</p>
                      <p className="text-sm text-amber-700">
                        Emergency contacts will be notified immediately in case of an SOS alert during your pilgrimage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Contacts */}
                {emergencyContacts.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-[#181410]">Your Emergency Contacts</h3>
                    {emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="person" className="text-primary text-xl" />
                          </div>
                          <div>
                            <p className="font-medium text-[#181410]">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.relationship}</p>
                            <p className="text-sm text-gray-500">{contact.phone}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEmergencyContact(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                          disabled={saving}
                        >
                          <Icon name="delete" className="text-xl" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Contact Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-[#181410] mb-4">Add New Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Contact's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Son, Daughter, Spouse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="contact@email.com"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="primary" onClick={handleAddEmergencyContact} disabled={saving}>
                      {saving ? (
                        <>
                          <Icon name="progress_activity" className="mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Icon name="add" className="mr-2" />
                          Add Contact
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[#181410] mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Icon name="mail" className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium text-[#181410]">Email Address</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <Icon name="check_circle" className="text-lg" />
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="key" className="text-primary text-xl" />
                        </div>
                        <div>
                          <p className="font-medium text-[#181410]">Password</p>
                          <p className="text-sm text-gray-600">Last changed: Never</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => alert('Password reset email sent!')}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-800 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => alert('Please contact support to delete your account.')}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
