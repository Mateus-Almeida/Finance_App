import { LayoutDashboard, Wallet, Layers, CalendarClock, LogOut } from 'lucide-react';
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
    <aside className="hidden w-20 flex-col items-center justify-between bg-[#020817] py-8 text-white shadow-2xl lg:flex">
      <div className="flex flex-col items-center gap-8">
        <nav className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#020817] shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
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

      <button
        onClick={onLogout}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        title="Sair"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </aside>
  );
}
