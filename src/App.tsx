import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

import Landing from '@/features/dashboard/Landing';
import Auth from '@/features/auth/Auth';
import TrackOrder from '@/features/jobs/TrackOrder';
import Dashboard from '@/features/dashboard/Dashboard';
import Customers from '@/features/customers/Customers';
import RepairJobs from '@/features/jobs/RepairJobs';
import Payments from '@/features/payments/Payments';
import Settlements from '@/features/payments/Settlements';
import Inventory from '@/features/inventory/Inventory';
import Sells from '@/features/inventory/Sells';
import Reports from '@/features/dashboard/Reports';
import Settings from '@/features/settings/Settings';
import Trash from '@/features/admin/Trash';
import ResetPassword from '@/features/auth/ResetPassword';
import AdminPanel from '@/features/admin/AdminPanel';
import WalletPage from '@/features/wallet/WalletPage';
import Subscription from '@/features/settings/Subscription';
import ServicesManagement from '@/features/services/ServicesManagement';
import EnterpriseModules from '@/features/enterprise/EnterpriseModules';
import PrivacyPolicy from '@/features/dashboard/PrivacyPolicy';
import TermsConditions from '@/features/dashboard/TermsConditions';
import NotFound from '@/components/common/NotFound';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowExpired = false }: { children: React.ReactNode, allowExpired?: boolean }) {
  const { user, loading, isPlanExpired, isBanned, isMaintenance } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (isMaintenance && user.email !== 'krs715665@gmail.com') return <Navigate to="/auth" replace />;
  if (isBanned) return <Navigate to="/auth" replace />;
  if (isPlanExpired && !allowExpired && user.email !== 'krs715665@gmail.com') {
    return <Navigate to="/subscription" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isPlanExpired } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.email === 'krs715665@gmail.com' ? "/admin" : "/dashboard"} replace /> : <Landing />} />
          <Route path="/auth" element={(() => {
            // Allow email confirmation link to land on Auth (it will sign out & show account confirmed)
            const hash = typeof window !== 'undefined' ? window.location.hash : '';
            const hashParams = new URLSearchParams(hash.replace('#', '?'));
            const isEmailConfirm = hashParams.get('type') === 'signup' || hashParams.get('type') === 'magiclink';
            if (user && !isEmailConfirm) return <Navigate to={user.email === 'krs715665@gmail.com' ? "/admin" : "/dashboard"} replace />;
            return <Auth />;
          })()} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Dashboard />}</ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Customers />}</ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <RepairJobs />}</ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Payments />}</ProtectedRoute>} />
          <Route path="/settlements" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Settlements />}</ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Inventory />}</ProtectedRoute>} />
          <Route path="/sells" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Sells />}</ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Reports />}</ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/trash" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Trash />}</ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <WalletPage />}</ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute allowExpired>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <Subscription />}</ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <ServicesManagement />}</ProtectedRoute>} />
          <Route path="/enterprise" element={<ProtectedRoute>{user?.email === 'krs715665@gmail.com' ? <Navigate to="/admin" replace /> : <EnterpriseModules />}</ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  useEffect(() => {
    localStorage.setItem('rx-skin', 'default');
    const layout = localStorage.getItem('rx-layout') || 'default';
    document.documentElement.setAttribute('data-skin', 'default');
    document.documentElement.setAttribute('data-layout', layout);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
