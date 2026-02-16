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
          Bem vindo - <strong className="text-foreground">{userName}</strong>
        </span>
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">

        <NotificationsBell installments={notifications} />
        <ThemeToggle />
      </div>
    </div>
  );
}
