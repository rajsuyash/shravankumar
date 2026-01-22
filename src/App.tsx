import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
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
              <Route path="/booking/new" element={<BookingPage />} />
              <Route path="/booking/medical-assessment" element={<MedicalAssessmentPage />} />
              <Route path="/booking/payment" element={<PaymentPage />} />
              <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
              <Route path="/coordinator" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/medical" element={<ProtectedRoute><MedicalTeamDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/trip-updates" element={<ProtectedRoute><TripUpdatesPage /></ProtectedRoute>} />
              <Route path="/trip-detail" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
              <Route path="/safety-vows" element={<SafetyVowsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
