import { LayoutDashboard, Wallet, Layers, CalendarClock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Lançamentos', icon: Wallet, path: '/entries' },
  { label: 'Parcelas', icon: CalendarClock, path: '/installments' },
  { label: 'Categorias', icon: Layers, path: '/categories' },
];

interface SidebarNavProps {
  onLogout: () => void;
}

export function SidebarNav({ onLogout }: SidebarNavProps) {
  return (
    <aside className="hidden w-20 flex-col items-center justify-between bg-gradient-to-b from-primary/95 via-primary to-primary/80 py-8 text-primary-foreground shadow-2xl transition-colors lg:flex">
      <div className="flex flex-col items-center gap-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-primary-foreground shadow-inner">
          FT
        </div>
        <nav className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                    isActive
                      ? 'bg-background text-primary shadow-lg shadow-primary/30'
                      : 'bg-white/15 text-white/80 hover:bg-white/30'
                  }`
                }
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col items-center">
        <Button
          variant="secondary"
          size="icon"
          onClick={onLogout}
          className="rounded-2xl bg-background/90 text-primary hover:bg-background"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}
