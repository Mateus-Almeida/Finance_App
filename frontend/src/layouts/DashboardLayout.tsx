import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { TopBar } from '@/components/dashboard/TopBar';
import { authService } from '@/services/auth.service';
import { installmentService } from '@/services/installment.service';
import { Installment } from '@/types';

export function DashboardLayout() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Installment[]>([]);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const upcoming = await installmentService.getUpcoming(10);
        if (isMounted) {
          setNotifications(upcoming);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000 * 60 * 5);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      <SidebarNav onLogout={handleLogout} />
      <div className="flex flex-1 flex-col">
        <TopBar userName={authService.getUser()?.name} notifications={notifications} />
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
