import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Installment } from '@/types';
import { formatCurrency, formatMonthYear } from '@/utils/format';

interface NotificationsBellProps {
  installments: Installment[];
}

export function NotificationsBell({ installments }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const dueSoon = installments.filter((installment) => {
    const today = new Date();
    const due = new Date(installment.dueYear, installment.dueMonth - 1, 1);
    const diff = due.getTime() - today.getTime();
    return diff <= 1000 * 60 * 60 * 24 * 10; // 10 dias
  });

  return (
    <div className="relative">
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-primary"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {dueSoon.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {dueSoon.length}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-card text-sm shadow-lg">
          <div className="border-b px-4 py-2 font-semibold">Parcelas próximas</div>
          <div className="max-h-64 overflow-y-auto">
            {dueSoon.length === 0 ? (
              <p className="px-4 py-3 text-muted-foreground">
                Nenhuma parcela crítica. Tudo em dia!
              </p>
            ) : (
              dueSoon.map((installment) => (
                <div key={installment.id} className="border-b px-4 py-3 last:border-b-0">
                  <p className="font-medium">{installment.transaction?.description ?? 'Parcela'}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence em {formatMonthYear(installment.dueMonth, installment.dueYear)} •{' '}
                    {formatCurrency(Number(installment.amount))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
