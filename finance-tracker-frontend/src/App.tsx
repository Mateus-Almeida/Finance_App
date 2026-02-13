import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
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
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
