import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Icon, Button, Badge } from '../components/ui';
import { format } from 'date-fns';
import { uploadCircuitImage, deleteCircuitImage } from '../lib/imageUpload';
import { processEmailQueue, getEmailQueueStats, getRecentEmails } from '../lib/emailService';
import toast from '../lib/toast';

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
  difficulty_level?: string;
  medical_surcharge?: number;
  max_group_size?: number;
  min_age?: number;
  starts_from_city?: string;
  accessibility_rating?: number;
  itinerary?: { day: number; title: string; activities: string[] }[];
  included_services?: string[];
  excluded_services?: string[];
  accommodation_details?: string;
  transportation_details?: string;
  medical_support_details?: string;
  cancellation_policy?: string;
}

interface BookingItem {
  id: string;
  booking_reference: string;
  departure_date: string;
  number_of_travelers: number;
  total_price: number;
  booking_status: string;
  created_at?: string;
  circuit_id?: string;
  circuits?: {
    name: string;
  };
}

interface UserItem {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_type: string;
  created_at: string;
}

type UserRole = 'customer' | 'pilgrim' | 'coordinator' | 'medical' | 'admin';

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'pilgrim', label: 'Pilgrim' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'medical', label: 'Medical' },
  { value: 'admin', label: 'Admin' },
];

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'medical', label: 'Medical Team' },
  { value: 'admin', label: 'Admin' },
];

interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

interface BookingStatusCount {
  status: string;
  count: number;
}

interface CircuitPopularity {
  name: string;
  bookingCount: number;
  revenue: number;
}

interface VendorItem {
  id?: string;
  name: string;
  vendor_type: 'hotel' | 'transport' | 'food' | 'guide' | 'medical' | 'other';
  contact_person: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
}

const VENDOR_TYPES = [
  { value: 'hotel', label: 'Hotel / Accommodation' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food / Catering' },
  { value: 'guide', label: 'Guide' },
  { value: 'medical', label: 'Medical Support' },
  { value: 'other', label: 'Other' },
];

type ActiveSection = 'overview' | 'users' | 'vendors' | 'reports' | 'reviews' | 'trips';

interface ReviewItem {
  id: string;
  circuit_id: string;
  user_id: string;
  overall_rating: number;
  review_text: string;
  status: string;
  created_at: string;
  users?: { first_name?: string; last_name?: string; email?: string };
  circuits?: { name: string };
}

interface AdminTrip {
  id: string;
  circuit_id: string;
  departure_date: string;
  return_date: string;
  status: string;
  group_size: number;
  coordinator_id: string | null;
  circuits: { name: string; duration_days: number };
  coordinator?: { first_name?: string; last_name?: string; email: string } | null;
  bookings: { id: string; booking_reference: string; number_of_travelers: number }[];
}

interface CoordinatorOption {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UnlinkedBooking {
  id: string;
  booking_reference: string;
  number_of_travelers: number;
  departure_date: string;
  circuit_id: string;
  customer_id: string;
  circuits?: { name: string };
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
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
  const [loading, setLoading] = useState(true);
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

  // User Management state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [userUpdateFeedback, setUserUpdateFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

  // Add Staff Modal state
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({ email: '', role: 'coordinator' as UserRole, fullName: '' });
  const [staffFormLoading, setStaffFormLoading] = useState(false);
  const [staffFormFeedback, setStaffFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reports state
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Vendor state
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [vendorFormData, setVendorFormData] = useState<VendorItem>({
    name: '',
    vendor_type: 'hotel',
    contact_person: '',
    phone: '',
    email: '',
    status: 'active',
    notes: '',
  });

  // Email Queue state
  const [emailStats, setEmailStats] = useState({ pending: 0, sent: 0, failed: 0 });
  const [recentEmails, setRecentEmails] = useState<{ id: string; to_email: string; subject: string; status: string; created_at: string; sent_at?: string; error_message?: string }[]>([]);
  const [emailQueueLoading, setEmailQueueLoading] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Trip Management state
  const [adminTrips, setAdminTrips] = useState<AdminTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [coordinators, setCoordinators] = useState<CoordinatorOption[]>([]);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [createTripForm, setCreateTripForm] = useState({ circuit_id: '', departure_date: '', coordinator_id: '' });
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [isLinkBookingsModalOpen, setIsLinkBookingsModalOpen] = useState(false);
  const [linkingTripId, setLinkingTripId] = useState<string | null>(null);
  const [unlinkedBookings, setUnlinkedBookings] = useState<UnlinkedBooking[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [linkingBookings, setLinkingBookings] = useState(false);

  // Enhanced circuit form fields
  const [circuitTab, setCircuitTab] = useState<'basic' | 'itinerary' | 'services' | 'policies'>('basic');
  const [extendedFormData, setExtendedFormData] = useState({
    difficulty_level: 'Moderate' as string,
    medical_surcharge: 0,
    max_group_size: 20,
    min_age: 60,
    starts_from_city: '',
    accessibility_rating: 3,
    itinerary: [] as { day: number; title: string; activities: string[] }[],
    included_services: [] as string[],
    excluded_services: [] as string[],
    accommodation_details: '',
    transportation_details: '',
    medical_support_details: '',
    cancellation_policy: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  // Fetch users for the User Management section
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, user_type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch all bookings for reports
  const fetchAllBookingsForReports = async () => {
    try {
      setReportsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_reference, departure_date, number_of_travelers, total_price, booking_status, created_at, circuit_id, circuits (name)');

      if (error) throw error;
      setAllBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings for reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleOpenVendorModal = (vendor?: VendorItem) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorFormData({ ...vendor });
    } else {
      setEditingVendor(null);
      setVendorFormData({
        name: '',
        vendor_type: 'hotel',
        contact_person: '',
        phone: '',
        email: '',
        status: 'active',
        notes: '',
      });
    }
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: vendorFormData.name,
        vendor_type: vendorFormData.vendor_type,
        contact_person: vendorFormData.contact_person,
        phone: vendorFormData.phone,
        email: vendorFormData.email,
        status: vendorFormData.status,
        notes: vendorFormData.notes || null,
      };

      if (editingVendor?.id) {
        const { error } = await supabase
          .from('vendors')
          .update(payload)
          .eq('id', editingVendor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert(payload);
        if (error) throw error;
      }

      setIsVendorModalOpen(false);
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor. Please try again.');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);
      if (error) throw error;
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor.');
    }
  };

  // Fetch email queue data
  const fetchEmailQueueData = async () => {
    try {
      setEmailQueueLoading(true);
      const [stats, emails] = await Promise.all([
        getEmailQueueStats(),
        getRecentEmails(20),
      ]);
      setEmailStats(stats);
      setRecentEmails(emails);
    } catch (error) {
      console.error('Error fetching email queue data:', error);
    } finally {
      setEmailQueueLoading(false);
    }
  };

  const handleProcessEmailQueue = async () => {
    try {
      setProcessingQueue(true);
      const result = await processEmailQueue();
      toast.info(`Email queue processed: ${result.sent || 0} sent, ${result.failed || 0} failed`);
      fetchEmailQueueData();
    } catch (error) {
      console.error('Error processing email queue:', error);
      toast.error('Failed to process email queue.');
    } finally {
      setProcessingQueue(false);
    }
  };

  // Reviews management
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(first_name, last_name, email), circuits(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews((data || []) as ReviewItem[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
      toast.success(`Review ${status}`);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  // ========== TRIP MANAGEMENT FUNCTIONS ==========
  const fetchAdminTrips = async () => {
    try {
      setTripsLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          circuits (name, duration_days),
          bookings (id, booking_reference, number_of_travelers)
        `)
        .order('departure_date', { ascending: false });

      if (error) throw error;

      // Fetch coordinator details separately for each trip that has one
      const tripsData = data || [];
      const coordIds = [...new Set(tripsData.filter(t => t.coordinator_id).map(t => t.coordinator_id))];
      let coordMap: Record<string, { first_name?: string; last_name?: string; email: string }> = {};

      if (coordIds.length > 0) {
        const { data: coordData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', coordIds);

        if (coordData) {
          coordData.forEach(c => {
            coordMap[c.id] = { first_name: c.first_name, last_name: c.last_name, email: c.email };
          });
        }
      }

      const enriched: AdminTrip[] = tripsData.map(t => ({
        ...t,
        coordinator: t.coordinator_id ? coordMap[t.coordinator_id] || null : null,
      }));

      setAdminTrips(enriched);
    } catch (error) {
      console.error('Error fetching admin trips:', error);
    } finally {
      setTripsLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('user_type', 'coordinator')
        .order('first_name');

      if (error) throw error;
      setCoordinators(data || []);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
    }
  };

  const handleAdminCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTripForm.circuit_id || !createTripForm.departure_date) {
      toast.error('Circuit and departure date are required');
      return;
    }

    const selectedCircuit = circuits.find(c => c.id === createTripForm.circuit_id);
    if (!selectedCircuit) {
      toast.error('Please select a valid circuit');
      return;
    }

    setCreatingTrip(true);
    try {
      const returnDate = format(
        new Date(new Date(createTripForm.departure_date).getTime() + (selectedCircuit.duration_days - 1) * 86400000),
        'yyyy-MM-dd'
      );

      const { error } = await supabase.from('trips').insert({
        circuit_id: createTripForm.circuit_id,
        departure_date: createTripForm.departure_date,
        return_date: returnDate,
        coordinator_id: createTripForm.coordinator_id || null,
        status: 'planned',
        group_size: 0,
      });

      if (error) throw error;

      setIsCreateTripModalOpen(false);
      setCreateTripForm({ circuit_id: '', departure_date: '', coordinator_id: '' });
      fetchAdminTrips();
      toast.success('Trip created successfully!');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip');
    } finally {
      setCreatingTrip(false);
    }
  };

  const assignCoordinator = async (tripId: string, coordinatorId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ coordinator_id: coordinatorId || null })
        .eq('id', tripId);

      if (error) throw error;
      fetchAdminTrips();
      toast.success('Coordinator assigned successfully');
    } catch (error) {
      console.error('Error assigning coordinator:', error);
      toast.error('Failed to assign coordinator');
    }
  };

  const fetchUnlinkedBookings = async (tripId: string) => {
    const trip = adminTrips.find(t => t.id === tripId);
    if (!trip) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_reference, number_of_travelers, departure_date, circuit_id, customer_id, circuits (name)')
        .eq('circuit_id', trip.circuit_id)
        .eq('booking_status', 'confirmed')
        .is('trip_id', null);

      if (error) throw error;
      setUnlinkedBookings((data || []) as UnlinkedBooking[]);
    } catch (error) {
      console.error('Error fetching unlinked bookings:', error);
    }
  };

  const linkBookingToTrip = async () => {
    if (!linkingTripId || selectedBookingIds.length === 0) return;

    setLinkingBookings(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ trip_id: linkingTripId })
        .in('id', selectedBookingIds);

      if (error) throw error;

      // Update group_size on the trip
      const trip = adminTrips.find(t => t.id === linkingTripId);
      const addedTravelers = unlinkedBookings
        .filter(b => selectedBookingIds.includes(b.id))
        .reduce((sum, b) => sum + b.number_of_travelers, 0);

      const newGroupSize = (trip?.group_size || 0) + addedTravelers;
      await supabase
        .from('trips')
        .update({ group_size: newGroupSize })
        .eq('id', linkingTripId);

      setIsLinkBookingsModalOpen(false);
      setSelectedBookingIds([]);
      setLinkingTripId(null);
      fetchAdminTrips();
      toast.success(`${selectedBookingIds.length} booking(s) linked to trip`);
    } catch (error) {
      console.error('Error linking bookings:', error);
      toast.error('Failed to link bookings');
    } finally {
      setLinkingBookings(false);
    }
  };

  // Load data when section changes
  useEffect(() => {
    if (activeSection === 'users' && users.length === 0) {
      fetchUsers();
    }
    if (activeSection === 'reports') {
      if (allBookings.length === 0) fetchAllBookingsForReports();
      fetchEmailQueueData();
    }
    if (activeSection === 'vendors' && vendors.length === 0) {
      fetchVendors();
    }
    if (activeSection === 'reviews' && reviews.length === 0) {
      fetchReviews();
    }
    if (activeSection === 'trips') {
      fetchAdminTrips();
      fetchCoordinators();
    }
  }, [activeSection]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase();
    return users.filter((u) => {
      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      return (
        u.email.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [users, userSearchQuery]);

  // Handle role change for a user
  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      setUserUpdateFeedback(null);

      const targetUser = users.find((u) => u.id === userId);
      const previousRole = targetUser?.user_type || 'unknown';

      const { error } = await supabase
        .from('users')
        .update({ user_type: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Log role change to audit trail
      await supabase.from('medical_audit_trail').insert({
        action: 'role_change',
        performed_by: user?.id,
        details: {
          target_user_id: userId,
          target_user_email: targetUser?.email,
          previous_role: previousRole,
          new_role: newRole,
        },
      }).then(({ error: auditErr }) => {
        if (auditErr) console.error('Audit log failed (non-blocking):', auditErr);
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, user_type: newRole } : u))
      );
      setUserUpdateFeedback({ id: userId, type: 'success', message: 'Role updated' });

      setTimeout(() => setUserUpdateFeedback(null), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setUserUpdateFeedback({ id: userId, type: 'error', message: 'Failed to update role' });
      setTimeout(() => setUserUpdateFeedback(null), 4000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle Add Staff form submission
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStaffFormLoading(true);
      setStaffFormFeedback(null);

      if (!staffFormData.email.trim()) {
        setStaffFormFeedback({ type: 'error', message: 'Email is required' });
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', staffFormData.email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        // Update existing user's role
        const { error } = await supabase
          .from('users')
          .update({ user_type: staffFormData.role })
          .eq('id', existingUser.id);

        if (error) throw error;

        setStaffFormFeedback({
          type: 'success',
          message: `User ${staffFormData.email} already exists. Role updated to ${staffFormData.role}.`,
        });
      } else {
        // Create new user record
        const { error } = await supabase.from('users').insert({
          email: staffFormData.email.trim().toLowerCase(),
          first_name: staffFormData.fullName.trim() || null,
          user_type: staffFormData.role,
        });

        if (error) throw error;

        setStaffFormFeedback({
          type: 'success',
          message: `Staff member ${staffFormData.email} added as ${staffFormData.role}. They will need to create an account to sign in.`,
        });
      }

      // Refresh users list if it was loaded
      if (users.length > 0) {
        fetchUsers();
      }

      // Reset form after success
      setStaffFormData({ email: '', role: 'coordinator', fullName: '' });
    } catch (error: unknown) {
      console.error('Error adding staff:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStaffFormFeedback({ type: 'error', message: `Failed to add staff: ${errorMessage}` });
    } finally {
      setStaffFormLoading(false);
    }
  };

  // Report computations
  const monthlyRevenue: MonthlyRevenue[] = useMemo(() => {
    if (allBookings.length === 0) return [];
    const grouped: Record<string, { revenue: number; count: number }> = {};
    allBookings.forEach((b) => {
      const date = b.created_at || b.departure_date;
      if (!date) return;
      const monthKey = format(new Date(date), 'yyyy-MM');
      if (!grouped[monthKey]) {
        grouped[monthKey] = { revenue: 0, count: 0 };
      }
      grouped[monthKey].revenue += b.total_price || 0;
      grouped[monthKey].count += 1;
    });
    return Object.entries(grouped)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);
  }, [allBookings]);

  const bookingStatusCounts: BookingStatusCount[] = useMemo(() => {
    if (allBookings.length === 0) return [];
    const grouped: Record<string, number> = {};
    allBookings.forEach((b) => {
      const status = b.booking_status || 'unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [allBookings]);

  const popularCircuits: CircuitPopularity[] = useMemo(() => {
    if (allBookings.length === 0) return [];
    const grouped: Record<string, { name: string; bookingCount: number; revenue: number }> = {};
    allBookings.forEach((b) => {
      const circuitName = b.circuits?.name || 'Unknown';
      const key = b.circuit_id || circuitName;
      if (!grouped[key]) {
        grouped[key] = { name: circuitName, bookingCount: 0, revenue: 0 };
      }
      grouped[key].bookingCount += 1;
      grouped[key].revenue += b.total_price || 0;
    });
    return Object.values(grouped).sort((a, b) => b.bookingCount - a.bookingCount);
  }, [allBookings]);

  // Helper to get display name for a user
  const getUserDisplayName = (user: UserItem): string => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '--';
  };

  // Helper to get role badge variant
  const getRoleBadgeVariant = (role: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (role) {
      case 'admin': return 'danger';
      case 'coordinator': return 'primary';
      case 'medical': return 'warning';
      case 'pilgrim': return 'success';
      default: return 'default';
    }
  };

  // Helper to get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    setExtendedFormData({
      difficulty_level: circuit.difficulty_level || 'Moderate',
      medical_surcharge: circuit.medical_surcharge || 0,
      max_group_size: circuit.max_group_size || 20,
      min_age: circuit.min_age || 60,
      starts_from_city: circuit.starts_from_city || '',
      accessibility_rating: circuit.accessibility_rating || 3,
      itinerary: Array.isArray(circuit.itinerary) ? circuit.itinerary : [],
      included_services: Array.isArray(circuit.included_services) ? circuit.included_services : [],
      excluded_services: Array.isArray(circuit.excluded_services) ? circuit.excluded_services : [],
      accommodation_details: circuit.accommodation_details || '',
      transportation_details: circuit.transportation_details || '',
      medical_support_details: circuit.medical_support_details || '',
      cancellation_policy: circuit.cancellation_policy || '',
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
      toast.error('Failed to delete image');
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
        // Extended fields
        difficulty_level: extendedFormData.difficulty_level,
        medical_surcharge: extendedFormData.medical_surcharge,
        max_group_size: extendedFormData.max_group_size,
        min_age: extendedFormData.min_age,
        starts_from_city: extendedFormData.starts_from_city,
        accessibility_rating: extendedFormData.accessibility_rating,
        itinerary: extendedFormData.itinerary,
        included_services: extendedFormData.included_services,
        excluded_services: extendedFormData.excluded_services,
        accommodation_details: extendedFormData.accommodation_details,
        transportation_details: extendedFormData.transportation_details,
        medical_support_details: extendedFormData.medical_support_details,
        cancellation_policy: extendedFormData.cancellation_policy,
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

      toast.success(`Circuit ${editingCircuit ? 'updated' : 'created'} successfully!`);
    } catch (error: unknown) {
      console.error('Error saving circuit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to ${editingCircuit ? 'update' : 'create'} circuit: ${errorMessage}`);
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

        {/* Section Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={activeSection === 'overview' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('overview')}
          >
            <Icon name="dashboard" className="mr-2" />
            Overview
          </Button>
          <Button
            variant={activeSection === 'users' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('users')}
          >
            <Icon name="group" className="mr-2" />
            User Management
          </Button>
          <Button
            variant={activeSection === 'vendors' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('vendors')}
          >
            <Icon name="business" className="mr-2" />
            Vendors
          </Button>
          <Button
            variant={activeSection === 'reports' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('reports')}
          >
            <Icon name="analytics" className="mr-2" />
            Reports
          </Button>
          <Button
            variant={activeSection === 'reviews' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('reviews')}
          >
            <Icon name="rate_review" className="mr-2" />
            Reviews
          </Button>
          <Button
            variant={activeSection === 'trips' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveSection('trips')}
          >
            <Icon name="hiking" className="mr-2" />
            Trips
          </Button>
        </div>

        {/* ========== OVERVIEW SECTION ========== */}
        {activeSection === 'overview' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#e7dfda]">
            <h2 className="text-xl font-bold text-[#181410] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="primary" size="sm" onClick={handleAddCircuit}>
                <Icon name="add" className="mr-2" />
                Add Circuit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsAddStaffModalOpen(true)}>
                <Icon name="person_add" className="mr-2" />
                Add Staff
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveSection('vendors')}>
                <Icon name="business" className="mr-2" />
                Manage Vendors
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveSection('reports')}>
                <Icon name="analytics" className="mr-2" />
                View Reports
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveSection('trips')}>
                <Icon name="hiking" className="mr-2" />
                Manage Trips
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

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="border-b border-[#e7dfda] p-6">
            <h2 className="text-2xl font-bold text-[#181410]">Recent Bookings</h2>
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
        </>
        )}

        {/* ========== USER MANAGEMENT SECTION ========== */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#181410]">User Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {users.length} total users {userSearchQuery && `(${filteredUsers.length} matching)`}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="close" className="text-lg" />
                    </button>
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsAddStaffModalOpen(true)}>
                  <Icon name="person_add" className="mr-2" />
                  Add Staff
                </Button>
                <Button variant="secondary" size="sm" onClick={fetchUsers}>
                  <Icon name="refresh" className="mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
              {usersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Icon name="person_off" className="text-5xl mb-3" />
                  <p className="text-lg font-medium">
                    {userSearchQuery ? 'No users match your search' : 'No users found'}
                  </p>
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="mt-2 text-primary hover:underline text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#181410]">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {getUserDisplayName(user)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {user.phone || '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getRoleBadgeVariant(user.user_type)}>
                              {user.user_type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <select
                                value={user.user_type}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value as UserRole)}
                                disabled={updatingUserId === user.id}
                                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:opacity-50"
                              >
                                {USER_ROLES.map((role) => (
                                  <option key={role.value} value={role.value}>
                                    {role.label}
                                  </option>
                                ))}
                              </select>
                              {updatingUserId === user.id && (
                                <Icon name="progress_activity" className="text-lg text-primary animate-spin" />
                              )}
                              {userUpdateFeedback?.id === user.id && (
                                <span className={`text-xs font-medium ${
                                  userUpdateFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {userUpdateFeedback.message}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== VENDORS SECTION ========== */}
        {activeSection === 'vendors' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#181410]">Vendor Management</h2>
                <p className="text-sm text-gray-600 mt-1">{vendors.length} vendors registered</p>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={() => handleOpenVendorModal()}>
                  <Icon name="add" className="mr-2" />
                  Add Vendor
                </Button>
                <Button variant="secondary" size="sm" onClick={fetchVendors}>
                  <Icon name="refresh" className="mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
                </div>
              ) : vendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Icon name="business" className="text-5xl mb-3" />
                  <p className="text-lg font-medium">No vendors added yet</p>
                  <p className="text-sm mt-1">Add your first vendor to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#181410]">
                            {vendor.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                            {vendor.vendor_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {vendor.contact_person}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {vendor.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              vendor.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {vendor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleOpenVendorModal(vendor)}
                                className="text-primary hover:text-[#A04000] font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => vendor.id && handleDeleteVendor(vendor.id)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== REPORTS SECTION ========== */}
        {activeSection === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#181410]">Reports & Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Revenue, bookings, and circuit performance data</p>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
              </div>
            ) : allBookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e7dfda] p-12 flex flex-col items-center justify-center">
                <Icon name="bar_chart_off" className="text-5xl text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-500">No booking data available for reports</p>
              </div>
            ) : (
              <>
                {/* Booking Status Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bookingStatusCounts.map((item) => (
                    <div key={item.status} className="bg-white rounded-xl p-5 border border-[#e7dfda]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-[#181410]">{item.count}</p>
                      <p className="text-sm text-gray-500 mt-1">bookings</p>
                    </div>
                  ))}
                </div>

                {/* Monthly Revenue Table */}
                <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                  <div className="border-b border-[#e7dfda] p-6">
                    <h3 className="text-xl font-bold text-[#181410]">Monthly Revenue</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg per Booking
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monthlyRevenue.map((item) => (
                          <tr key={item.month} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#181410]">
                              {format(new Date(item.month + '-01'), 'MMMM yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {item.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                              ₹{item.revenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              ₹{item.count > 0 ? Math.round(item.revenue / item.count).toLocaleString() : 0}
                            </td>
                          </tr>
                        ))}
                        {monthlyRevenue.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              No monthly data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Most Popular Circuits */}
                <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                  <div className="border-b border-[#e7dfda] p-6">
                    <h3 className="text-xl font-bold text-[#181410]">Most Popular Circuits</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Circuit Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {popularCircuits.map((item, index) => (
                          <tr key={item.name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                index === 2 ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#181410]">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {item.bookingCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                              ₹{item.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {popularCircuits.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              No circuit data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Email Queue Section */}
                <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                  <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#181410]">Email Queue</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage outbound email notifications</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleProcessEmailQueue}
                        disabled={processingQueue || emailStats.pending === 0}
                      >
                        {processingQueue ? (
                          <>
                            <Icon name="progress_activity" className="mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Icon name="send" className="mr-1" />
                            Process Queue ({emailStats.pending})
                          </>
                        )}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={fetchEmailQueueData} disabled={emailQueueLoading}>
                        <Icon name="refresh" className={emailQueueLoading ? 'animate-spin' : ''} />
                      </Button>
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{emailStats.pending}</p>
                      <p className="text-xs text-yellow-600 font-medium">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{emailStats.sent}</p>
                      <p className="text-xs text-green-600 font-medium">Sent</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-700">{emailStats.failed}</p>
                      <p className="text-xs text-red-600 font-medium">Failed</p>
                    </div>
                  </div>

                  {/* Recent emails list */}
                  {emailQueueLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
                    </div>
                  ) : recentEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Icon name="mail" className="text-4xl mb-2" />
                      <p className="text-sm">No emails in the queue</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentEmails.map((email) => (
                            <tr key={email.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-[#181410]">
                                {email.to_email}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-700 max-w-xs truncate">
                                {email.subject}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  email.status === 'sent'
                                    ? 'bg-green-100 text-green-800'
                                    : email.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {email.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                {email.created_at ? format(new Date(email.created_at), 'MMM dd, h:mm a') : '--'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

        {/* ========== REVIEWS SECTION ========== */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#181410]">Review Moderation</h2>
                <p className="text-sm text-gray-600 mt-1">Approve or reject pilgrim reviews</p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchReviews}>
                <Icon name="refresh" className="mr-1" />
                Refresh
              </Button>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-[#e7dfda] text-center">
                <Icon name="rate_review" className="text-gray-300 text-5xl" />
                <p className="text-gray-400 mt-3">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['pending', 'approved', 'rejected'].map((statusGroup) => {
                  const groupReviews = reviews.filter((r) => r.status === statusGroup);
                  if (groupReviews.length === 0) return null;
                  return (
                    <div key={statusGroup}>
                      <h3 className="text-lg font-semibold text-[#181410] mb-3 capitalize flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          statusGroup === 'pending' ? 'bg-yellow-400' : statusGroup === 'approved' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {statusGroup} ({groupReviews.length})
                      </h3>
                      <div className="space-y-3">
                        {groupReviews.map((review) => (
                          <div key={review.id} className="bg-white rounded-xl p-5 border border-[#e7dfda]">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-[#181410]">
                                  {[review.users?.first_name, review.users?.last_name].filter(Boolean).join(' ') || review.users?.email || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {review.circuits?.name || 'Unknown circuit'} &middot;{' '}
                                  {format(new Date(review.created_at), 'dd MMM yyyy')}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="star" className="text-amber-400 text-lg" />
                                <span className="font-bold">{review.overall_rating}</span>
                              </div>
                            </div>
                            {review.review_text && (
                              <p className="text-sm text-gray-700 mb-3">{review.review_text}</p>
                            )}
                            {statusGroup === 'pending' && (
                              <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => updateReviewStatus(review.id, 'approved')}
                                >
                                  <Icon name="check" className="mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => updateReviewStatus(review.id, 'rejected')}
                                >
                                  <Icon name="close" className="mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== TRIPS MANAGEMENT SECTION ========== */}
        {activeSection === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#181410]">Trip Management</h2>
                <p className="text-sm text-gray-600 mt-1">Create trips, assign coordinators, and link bookings</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={fetchAdminTrips}>
                  <Icon name="refresh" className="mr-1" />
                  Refresh
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsCreateTripModalOpen(true)}>
                  <Icon name="add" className="mr-1" />
                  Create Trip
                </Button>
              </div>
            </div>

            {tripsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
              </div>
            ) : adminTrips.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-[#e7dfda] text-center">
                <Icon name="hiking" className="text-gray-300 text-5xl" />
                <p className="text-gray-400 mt-3">No trips created yet</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={() => setIsCreateTripModalOpen(true)}>
                  <Icon name="add" className="mr-1" />
                  Create First Trip
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#e7dfda]">
                        <th className="text-left p-4 font-semibold text-gray-700">Circuit</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Dates</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Coordinator</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Bookings</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Group Size</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminTrips.map((trip) => (
                        <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-medium text-[#181410]">
                            {trip.circuits?.name || 'Unknown'}
                          </td>
                          <td className="p-4 text-gray-600">
                            {format(new Date(trip.departure_date), 'MMM dd')} - {format(new Date(trip.return_date), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                              trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                              trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {trip.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={trip.coordinator_id || ''}
                              onChange={(e) => assignCoordinator(trip.id, e.target.value)}
                              className={`text-sm border rounded-lg px-2 py-1 ${
                                trip.coordinator_id
                                  ? 'border-gray-300 text-gray-700'
                                  : 'border-red-300 text-red-600 bg-red-50'
                              }`}
                            >
                              <option value="">Unassigned</option>
                              {coordinators.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-gray-600">
                            {trip.bookings?.length || 0} booking(s)
                          </td>
                          <td className="p-4 text-gray-600">
                            {trip.group_size} pilgrims
                          </td>
                          <td className="p-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setLinkingTripId(trip.id);
                                setSelectedBookingIds([]);
                                fetchUnlinkedBookings(trip.id);
                                setIsLinkBookingsModalOpen(true);
                              }}
                            >
                              <Icon name="link" className="mr-1" />
                              Link Bookings
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      {/* ========== CREATE TRIP MODAL ========== */}
      {isCreateTripModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#181410]">Create New Trip</h2>
              <button onClick={() => setIsCreateTripModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleAdminCreateTrip} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Circuit *</label>
                <select
                  value={createTripForm.circuit_id}
                  onChange={(e) => setCreateTripForm({ ...createTripForm, circuit_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a circuit</option>
                  {circuits.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date *</label>
                <input
                  type="date"
                  value={createTripForm.departure_date}
                  onChange={(e) => setCreateTripForm({ ...createTripForm, departure_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Coordinator (optional)</label>
                <select
                  value={createTripForm.coordinator_id}
                  onChange={(e) => setCreateTripForm({ ...createTripForm, coordinator_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">None (assign later)</option>
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsCreateTripModalOpen(false)} className="flex-1" disabled={creatingTrip}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={creatingTrip}>
                  {creatingTrip ? (
                    <span className="flex items-center gap-2">
                      <Icon name="progress_activity" className="animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LINK BOOKINGS MODAL ========== */}
      {isLinkBookingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#181410]">Link Bookings to Trip</h2>
              <button onClick={() => { setIsLinkBookingsModalOpen(false); setLinkingTripId(null); }} className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {unlinkedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="check_circle" className="text-4xl text-green-400 mb-3" />
                  <p className="text-gray-600">No unlinked confirmed bookings found for this circuit.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select bookings to link to this trip ({unlinkedBookings.length} available):
                  </p>
                  {unlinkedBookings.map((booking) => (
                    <label
                      key={booking.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBookingIds.includes(booking.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBookingIds.includes(booking.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookingIds([...selectedBookingIds, booking.id]);
                          } else {
                            setSelectedBookingIds(selectedBookingIds.filter(id => id !== booking.id));
                          }
                        }}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#181410]">{booking.booking_reference}</p>
                        <p className="text-xs text-gray-500">
                          {booking.number_of_travelers} traveler(s) &middot; Departs {format(new Date(booking.departure_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {unlinkedBookings.length > 0 && (
              <div className="border-t border-gray-200 p-6 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setIsLinkBookingsModalOpen(false); setLinkingTripId(null); }}
                  className="flex-1"
                  disabled={linkingBookings}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={selectedBookingIds.length === 0 || linkingBookings}
                  onClick={linkBookingToTrip}
                >
                  {linkingBookings ? (
                    <span className="flex items-center gap-2">
                      <Icon name="progress_activity" className="animate-spin" />
                      Linking...
                    </span>
                  ) : (
                    `Link ${selectedBookingIds.length} Booking(s)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== ADD STAFF MODAL ========== */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#181410]">Add Staff Member</h2>
              <button
                onClick={() => {
                  setIsAddStaffModalOpen(false);
                  setStaffFormFeedback(null);
                  setStaffFormData({ email: '', role: 'coordinator', fullName: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="staff@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  value={staffFormData.fullName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={staffFormData.role}
                  onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {staffFormFeedback && (
                <div className={`p-3 rounded-lg text-sm ${
                  staffFormFeedback.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-start gap-2">
                    <Icon
                      name={staffFormFeedback.type === 'success' ? 'check_circle' : 'error'}
                      className="text-lg flex-shrink-0 mt-0.5"
                    />
                    <span>{staffFormFeedback.message}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddStaffModalOpen(false);
                    setStaffFormFeedback(null);
                    setStaffFormData({ email: '', role: 'coordinator', fullName: '' });
                  }}
                  className="flex-1"
                  disabled={staffFormLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={staffFormLoading}>
                  {staffFormLoading ? (
                    <span className="flex items-center gap-2">
                      <Icon name="progress_activity" className="animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Staff'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== VENDOR EDIT MODAL ========== */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#e7dfda] p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-[#181410]">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSaveVendor} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                <input
                  type="text"
                  value={vendorFormData.name}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Type *</label>
                <select
                  value={vendorFormData.vendor_type}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_type: e.target.value as VendorItem['vendor_type'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  {VENDOR_TYPES.map((vt) => (
                    <option key={vt.value} value={vt.value}>{vt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  value={vendorFormData.contact_person}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, contact_person: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={vendorFormData.phone}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={vendorFormData.email}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={vendorFormData.status}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={vendorFormData.notes || ''}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Contract details, special arrangements, etc."
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== CIRCUIT EDIT MODAL ========== */}
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

              {/* Extended Fields Tabs */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {(['basic', 'itinerary', 'services', 'policies'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCircuitTab(tab)}
                      className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        circuitTab === tab ? 'bg-white text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'basic' ? 'Details' : tab}
                    </button>
                  ))}
                </div>
                <div className="p-4 space-y-4">
                  {circuitTab === 'basic' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty Level</label>
                          <select
                            value={extendedFormData.difficulty_level}
                            onChange={(e) => setExtendedFormData({ ...extendedFormData, difficulty_level: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Challenging">Challenging</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Medical Surcharge (₹)</label>
                          <input type="number" min="0" value={extendedFormData.medical_surcharge}
                            onChange={(e) => setExtendedFormData({ ...extendedFormData, medical_surcharge: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max Group Size</label>
                          <input type="number" min="1" value={extendedFormData.max_group_size}
                            onChange={(e) => setExtendedFormData({ ...extendedFormData, max_group_size: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min Age</label>
                          <input type="number" min="0" value={extendedFormData.min_age}
                            onChange={(e) => setExtendedFormData({ ...extendedFormData, min_age: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Accessibility (1-5)</label>
                          <input type="number" min="1" max="5" value={extendedFormData.accessibility_rating}
                            onChange={(e) => setExtendedFormData({ ...extendedFormData, accessibility_rating: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Starts From City</label>
                        <input type="text" value={extendedFormData.starts_from_city}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, starts_from_city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="e.g., New Delhi" />
                      </div>
                    </>
                  )}
                  {circuitTab === 'itinerary' && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">Add day-by-day itinerary</p>
                      {extendedFormData.itinerary.map((day, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">Day {day.day}</span>
                            <button type="button" onClick={() => setExtendedFormData({
                              ...extendedFormData,
                              itinerary: extendedFormData.itinerary.filter((_, idx) => idx !== i),
                            })} className="text-red-500 text-xs hover:underline">Remove</button>
                          </div>
                          <input type="text" value={day.title} placeholder="Day title"
                            onChange={(e) => {
                              const updated = [...extendedFormData.itinerary];
                              updated[i] = { ...updated[i], title: e.target.value };
                              setExtendedFormData({ ...extendedFormData, itinerary: updated });
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
                          <textarea value={day.activities.join('\n')} placeholder="Activities (one per line)"
                            onChange={(e) => {
                              const updated = [...extendedFormData.itinerary];
                              updated[i] = { ...updated[i], activities: e.target.value.split('\n') };
                              setExtendedFormData({ ...extendedFormData, itinerary: updated });
                            }}
                            rows={3}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setExtendedFormData({
                        ...extendedFormData,
                        itinerary: [...extendedFormData.itinerary, { day: extendedFormData.itinerary.length + 1, title: '', activities: [] }],
                      })} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                        <Icon name="add" className="text-sm" /> Add Day
                      </button>
                    </>
                  )}
                  {circuitTab === 'services' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Included Services (one per line)</label>
                        <textarea value={extendedFormData.included_services.join('\n')}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, included_services: e.target.value.split('\n').filter(Boolean) })}
                          rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="AC Transport&#10;Meals included&#10;Medical team on standby" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Excluded Services (one per line)</label>
                        <textarea value={extendedFormData.excluded_services.join('\n')}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, excluded_services: e.target.value.split('\n').filter(Boolean) })}
                          rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Personal expenses&#10;Travel insurance&#10;Tips" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Accommodation Details</label>
                        <textarea value={extendedFormData.accommodation_details}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, accommodation_details: e.target.value })}
                          rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Transportation Details</label>
                        <textarea value={extendedFormData.transportation_details}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, transportation_details: e.target.value })}
                          rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </>
                  )}
                  {circuitTab === 'policies' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Medical Support Details</label>
                        <textarea value={extendedFormData.medical_support_details}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, medical_support_details: e.target.value })}
                          rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Describe the medical support infrastructure..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Cancellation Policy</label>
                        <textarea value={extendedFormData.cancellation_policy}
                          onChange={(e) => setExtendedFormData({ ...extendedFormData, cancellation_policy: e.target.value })}
                          rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Cancellation terms for this circuit..." />
                      </div>
                    </>
                  )}
                </div>
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
