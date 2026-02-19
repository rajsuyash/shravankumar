import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SOSButton } from './components/ui/SOSButton';
import { Icon } from './components/ui/Icon';
import { supabase } from './lib/supabase';

// Lazy-loaded page components for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const CircuitsPage = React.lazy(() => import('./pages/CircuitsPage').then(m => ({ default: m.CircuitsPage })));
const CircuitDetailPage = React.lazy(() => import('./pages/CircuitDetailPage').then(m => ({ default: m.CircuitDetailPage })));
const BookingPage = React.lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const MedicalAssessmentPage = React.lazy(() => import('./pages/MedicalAssessmentPage').then(m => ({ default: m.MedicalAssessmentPage })));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const BookingConfirmationPage = React.lazy(() => import('./pages/BookingConfirmationPage').then(m => ({ default: m.BookingConfirmationPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MessagingPage = React.lazy(() => import('./pages/MessagingPage').then(m => ({ default: m.MessagingPage })));
const CoordinatorDashboard = React.lazy(() => import('./pages/CoordinatorDashboard').then(m => ({ default: m.CoordinatorDashboard })));
const MedicalTeamDashboard = React.lazy(() => import('./pages/MedicalTeamDashboard').then(m => ({ default: m.MedicalTeamDashboard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TripUpdatesPage = React.lazy(() => import('./pages/TripUpdatesPage').then(m => ({ default: m.TripUpdatesPage })));
const TripDetailPage = React.lazy(() => import('./pages/TripDetailPage').then(m => ({ default: m.TripDetailPage })));
const SafetyVowsPage = React.lazy(() => import('./pages/SafetyVowsPage').then(m => ({ default: m.SafetyVowsPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const CancellationPolicyPage = React.lazy(() => import('./pages/CancellationPolicyPage').then(m => ({ default: m.CancellationPolicyPage })));
const MedicalDisclosurePage = React.lazy(() => import('./pages/MedicalDisclosurePage').then(m => ({ default: m.MedicalDisclosurePage })));
const MyTripUpdatesPage = React.lazy(() => import('./pages/MyTripUpdatesPage').then(m => ({ default: m.MyTripUpdatesPage })));

function LoadingSpinner() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
    </div>
  );
}

function SOSButtonWrapper() {
  const { user } = useAuth();

  const handleEmergency = async () => {
    if (!user) return;
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'sos_emergency',
      title: 'SOS Emergency Alert',
      message: 'Emergency alert triggered by pilgrim. Immediate assistance required.',
    });
  };

  if (!user) return null;
  return <SOSButton onEmergency={handleEmergency} />;
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BookingProvider>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-background-light">
          <Header />
          <main>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/circuits" element={<CircuitsPage />} />
              <Route path="/circuits/:id" element={<CircuitDetailPage />} />
              <Route path="/booking/new" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              <Route path="/booking/medical-assessment" element={<ProtectedRoute><MedicalAssessmentPage /></ProtectedRoute>} />
              <Route path="/booking/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
              <Route path="/coordinator" element={<ProtectedRoute allowedRoles={['coordinator', 'admin']}><CoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/medical" element={<ProtectedRoute allowedRoles={['medical', 'admin']}><MedicalTeamDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/trip-updates" element={<ProtectedRoute><TripUpdatesPage /></ProtectedRoute>} />
              <Route path="/trip-detail" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/my-trip-updates" element={<ProtectedRoute><MyTripUpdatesPage /></ProtectedRoute>} />
              <Route path="/safety-vows" element={<SafetyVowsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
              <Route path="/medical-disclosure" element={<MedicalDisclosurePage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          <SOSButtonWrapper />
        </div>
      </BookingProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
