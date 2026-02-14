import { Installment } from '@/types';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { Button } from '@/components/ui/button';

interface UpcomingInstallmentsProps {
  installments: Installment[];
  onTogglePayment: (installment: Installment) => Promise<void>;
  isLoading: boolean;
}

export function UpcomingInstallments({
  installments,
  onTogglePayment,
  isLoading,
}: UpcomingInstallmentsProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Próximas Parcelas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie o peso das parcelas antes de impactar seu saldo real
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {installments.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">Nenhuma parcela pendente.</p>
        ) : null}
        {installments.map((installment) => (
          <div
            key={installment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3"
          >
            <div>
              <p className="text-sm font-medium">
                Parcela {installment.installmentNumber}/{installment.totalInstallments}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMonthYear(installment.dueMonth, installment.dueYear)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatCurrency(Number(installment.amount))}</p>
              <p className="text-xs text-muted-foreground">
                {installment.transaction?.description ?? 'Transação vinculada'}
              </p>
            </div>
            <Button
              size="sm"
              variant={installment.isPaid ? 'outline' : 'default'}
              onClick={() => onTogglePayment(installment)}
              disabled={isLoading}
            >
              {installment.isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
