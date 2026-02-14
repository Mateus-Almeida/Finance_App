import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsBell } from './NotificationsBell';
import { Installment } from '@/types';

interface TopBarProps {
  userName?: string;
  notifications?: Installment[];
}

export function TopBar({ userName, notifications = [] }: TopBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b bg-card/70 px-6 py-3 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Bem vindo <strong>{userName || 'Mateus'}</strong>
        </span>
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-muted px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar movimentação..."
            className="w-full bg-transparent outline-none"
          />
        </div>
        <NotificationsBell installments={notifications} />
        <ThemeToggle />
      </div>
    </div>
  );
}
