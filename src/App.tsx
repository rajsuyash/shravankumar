import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SOSButton } from './components/ui/SOSButton';
import { HomePage } from './pages/HomePage';
import { CircuitsPage } from './pages/CircuitsPage';
import { CircuitDetailPage } from './pages/CircuitDetailPage';
import { BookingPage } from './pages/BookingPage';
import { MedicalAssessmentPage } from './pages/MedicalAssessmentPage';
import { PaymentPage } from './pages/PaymentPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MessagingPage } from './pages/MessagingPage';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { MedicalTeamDashboard } from './pages/MedicalTeamDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TripUpdatesPage } from './pages/TripUpdatesPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { SafetyVowsPage } from './pages/SafetyVowsPage';
import { ProfilePage } from './pages/ProfilePage';
import { supabase } from './lib/supabase';

function SOSButtonWrapper() {
  const { user } = useAuth();

  const handleEmergency = async () => {
    if (!user) return;
    // Create an emergency notification in the database
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
    <AuthProvider>
      <BookingProvider>
        <div className="min-h-screen bg-background-light">
          <Header />
          <main>
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
              <Route path="/safety-vows" element={<SafetyVowsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <SOSButtonWrapper />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
