import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/pages/Login';
import { Overview } from '@/pages/Overview';
import { EntriesPage } from '@/pages/Entries';
import { InstallmentsPage } from '@/pages/InstallmentsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { authService } from '@/services/auth.service';

// ============================================
// COMPONENTE: PROTEÇÃO DE ROTA
// ============================================

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Overview />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="installments" element={<InstallmentsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
