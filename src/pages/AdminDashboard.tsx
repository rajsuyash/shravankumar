import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Button } from '../components/ui';
import { format } from 'date-fns';
import { uploadCircuitImage, deleteCircuitImage } from '../lib/imageUpload';

interface CircuitItem {
  id: string;
  name: string;
  description?: string;
  duration_days: number;
  base_price: number;
  destinations?: string[];
  departure_cities?: string[];
  display_order?: number;
  is_active: boolean;
  featured_image_url?: string;
  images?: string[];
}

interface BookingItem {
  id: string;
  booking_reference: string;
  departure_date: string;
  number_of_travelers: number;
  total_price: number;
  booking_status: string;
  circuits?: {
    name: string;
  };
}

interface UserItem {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  user_type: string;
  created_at: string;
}

type AdminTab = 'overview' | 'circuits' | 'users' | 'bookings';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeCircuits: 0,
    totalPilgrims: 0,
    pendingAssessments: 0,
    activeTrips: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<CircuitItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 0,
    base_price: 0,
    destinations: '',
    departure_cities: '',
    display_order: 999,
    is_active: true,
    featured_image_url: '',
    images: [] as string[],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, user_type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ user_type: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, user_type: newRole } : u
      ));
      
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [bookingsRes, circuitsRes, assessmentsRes, tripsRes, allCircuitsRes] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('circuits').select('*').eq('is_active', true),
        supabase.from('medical_assessments').select('*').eq('medical_clearance', false),
        supabase.from('trips').select('*').eq('status', 'in_progress'),
        supabase.from('circuits').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false }),
      ]);

      const bookings = bookingsRes.data || [];
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const totalPilgrims = bookings.reduce((sum, b) => sum + (b.number_of_travelers || 0), 0);

      setStats({
        totalBookings: bookings.length,
        totalRevenue,
        activeCircuits: circuitsRes.data?.length || 0,
        totalPilgrims,
        pendingAssessments: assessmentsRes.data?.length || 0,
        activeTrips: tripsRes.data?.length || 0,
      });

      setCircuits(allCircuitsRes.data || []);

      const { data: recent } = await supabase
        .from('bookings')
        .select(`
          *,
          circuits (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentBookings(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCircuit = () => {
    setEditingCircuit(null);
    setFormData({
      name: '',
      description: '',
      duration_days: 1,
      base_price: 0,
      destinations: '',
      departure_cities: '',
      display_order: 999,
      is_active: true,
      featured_image_url: '',
      images: [],
    });
    setFeaturedImageFile(null);
    setAdditionalImageFiles([]);
    setIsEditModalOpen(true);
  };

  const handleEditCircuit = (circuit: CircuitItem) => {
    setEditingCircuit(circuit);
    setFormData({
      name: circuit.name,
      description: circuit.description || '',
      duration_days: circuit.duration_days,
      base_price: circuit.base_price,
      destinations: Array.isArray(circuit.destinations) ? circuit.destinations.join(', ') : '',
      departure_cities: Array.isArray(circuit.departure_cities) ? circuit.departure_cities.join(', ') : '',
      display_order: circuit.display_order || 999,
      is_active: circuit.is_active,
      featured_image_url: circuit.featured_image_url || '',
      images: Array.isArray(circuit.images) ? circuit.images : [],
    });
    setFeaturedImageFile(null);
    setAdditionalImageFiles([]);
    setIsEditModalOpen(true);
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    try {
      await deleteCircuitImage(imageUrl);
      setFormData({
        ...formData,
        images: formData.images.filter(url => url !== imageUrl),
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleRemoveFeaturedImage = async () => {
    if (formData.featured_image_url) {
      try {
        await deleteCircuitImage(formData.featured_image_url);
        setFormData({ ...formData, featured_image_url: '' });
      } catch (error) {
        console.error('Error deleting featured image:', error);
      }
    }
    setFeaturedImageFile(null);
  };

  const handleSaveCircuit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadingImage(true);

      let featuredImageUrl = formData.featured_image_url;
      let additionalImages = [...formData.images];

      if (featuredImageFile) {
        featuredImageUrl = await uploadCircuitImage(featuredImageFile, editingCircuit?.id);
      }

      if (additionalImageFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          additionalImageFiles.map(file => uploadCircuitImage(file, editingCircuit?.id))
        );
        additionalImages = [...additionalImages, ...uploadedUrls];
      }

      const circuitData = {
        name: formData.name,
        description: formData.description,
        duration_days: parseInt(String(formData.duration_days), 10),
        base_price: parseFloat(String(formData.base_price)),
        destinations: formData.destinations.split(',').map(d => d.trim()).filter(Boolean),
        departure_cities: formData.departure_cities.split(',').map(c => c.trim()).filter(Boolean),
        display_order: parseInt(String(formData.display_order), 10),
        is_active: formData.is_active,
        featured_image_url: featuredImageUrl,
        images: additionalImages,
      };

      if (editingCircuit) {
        const { data, error } = await supabase
          .from('circuits')
          .update(circuitData)
          .eq('id', editingCircuit.id)
          .select();

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('Failed to update circuit. You may not have permission to modify this circuit.');
        }
      } else {
        const { data, error } = await supabase
          .from('circuits')
          .insert([circuitData])
          .select();

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('Failed to create circuit. You may not have permission to create circuits.');
        }
      }

      setIsEditModalOpen(false);
      setEditingCircuit(null);
      setFeaturedImageFile(null);
      setAdditionalImageFiles([]);

      await fetchDashboardData();

      alert(`Circuit ${editingCircuit ? 'updated' : 'created'} successfully!`);
    } catch (error: unknown) {
      console.error('Error saving circuit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to ${editingCircuit ? 'update' : 'create'} circuit: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#181410] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="confirmation_number" className="text-primary text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">{stats.totalBookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="currency_rupee" className="text-green-600 text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="temple_hindu" className="text-primary text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">{stats.activeCircuits}</p>
              <p className="text-sm text-gray-600">Active Circuits</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="groups" className="text-blue-600 text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">{stats.totalPilgrims}</p>
              <p className="text-sm text-gray-600">Total Pilgrims</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="medical_services" className="text-amber-600 text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">{stats.pendingAssessments}</p>
              <p className="text-sm text-gray-600">Pending Assessments</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <div className="flex flex-col gap-2">
              <Icon name="explore" className="text-green-600 text-3xl" />
              <p className="text-3xl font-bold text-[#181410]">{stats.activeTrips}</p>
              <p className="text-sm text-gray-600">Active Trips</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'circuits', label: 'Circuits', icon: 'temple_hindu' },
              { id: 'users', label: 'User Management', icon: 'people' },
              { id: 'bookings', label: 'Bookings', icon: 'confirmation_number' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <Icon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
                <h2 className="text-xl font-bold text-[#181410] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="primary" size="sm" onClick={handleAddCircuit}>
                    <Icon name="add" className="mr-2" />
                    Add Circuit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('users')}>
                    <Icon name="person_add" className="mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('circuits')}>
                    <Icon name="temple_hindu" className="mr-2" />
                    View Circuits
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('bookings')}>
                    <Icon name="confirmation_number" className="mr-2" />
                    View Bookings
                  </Button>
                </div>
              </div>

          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <h2 className="text-xl font-bold text-[#181410] mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>
            </div>
          </>
        )}

        {/* Circuits Tab */}
        {activeTab === 'circuits' && (
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden mb-8">
          <div className="border-b border-[#e7dfda] p-6">
            <h2 className="text-2xl font-bold text-[#181410]">Manage Sacred Circuits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Circuit Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {circuits.map((circuit) => (
                  <tr key={circuit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {circuit.display_order}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#181410]">
                      {circuit.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {circuit.duration_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      ₹{circuit.base_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        circuit.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {circuit.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditCircuit(circuit)}
                        className="text-primary hover:text-[#A04000] font-medium flex items-center gap-1"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
            <div className="border-b border-[#e7dfda] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#181410]">User Management</h2>
                <span className="text-sm text-gray-500">{users.length} total users</span>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#181410]">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : 'Name not set'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.phone || 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.user_type === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.user_type === 'staff'
                            ? 'bg-blue-100 text-blue-800'
                            : user.user_type === 'medical_team'
                            ? 'bg-red-100 text-red-800'
                            : user.user_type === 'coordinator'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.user_type}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary"
                        >
                          <option value="customer">Customer</option>
                          <option value="pilgrim">Pilgrim</option>
                          <option value="staff">Staff</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="medical_team">Medical Team</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="search_off" className="text-5xl text-gray-300 mb-2" />
                  <p className="text-gray-500">No users found matching your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <h2 className="text-2xl font-bold text-[#181410]">All Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Ref
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Circuit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travelers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#181410]">
                      {booking.booking_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.circuits?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(booking.departure_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.number_of_travelers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      ₹{booking.total_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.booking_status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.booking_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-[#181410]">
                {editingCircuit ? 'Edit Circuit' : 'Add New Circuit'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSaveCircuit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Circuit Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first on the home page (e.g., 1, 2, 3)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinations (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.destinations}
                  onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Rishikesh, Haridwar, Badrinath"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Cities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.departure_cities}
                  onChange={(e) => setFormData({ ...formData, departure_cities: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Delhi, Mumbai, Bangalore"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image (Home Page)
                </label>
                <div className="space-y-3">
                  {formData.featured_image_url && !featuredImageFile && (
                    <div className="relative inline-block">
                      <img
                        src={formData.featured_image_url}
                        alt="Featured"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFeaturedImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  )}
                  {featuredImageFile && (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(featuredImageFile)}
                        alt="Featured preview"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImageFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFeaturedImageFile(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-[#A04000] cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Main image shown on circuit cards</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (Detail Page)
                </label>
                <div className="space-y-3">
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative inline-block">
                          <img
                            src={url}
                            alt={`Additional ${index + 1}`}
                            className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Icon name="close" className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {additionalImageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {additionalImageFiles.map((file, index) => (
                        <div key={index} className="relative inline-block">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalImageFiles(additionalImageFiles.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Icon name="close" className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAdditionalImageFiles([...additionalImageFiles, ...files]);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-[#A04000] cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Multiple images shown in the detail page gallery</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active Circuit
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                  disabled={uploadingImage}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={uploadingImage}>
                  {uploadingImage ? (
                    <span className="flex items-center gap-2">
                      <Icon name="progress_activity" className="animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    editingCircuit ? 'Update Circuit' : 'Create Circuit'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
