import { Income } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface IncomeScheduleProps {
  incomes: Income[];
  onDelete: (id: string) => Promise<void>;
}

export function IncomeSchedule({ incomes, onDelete }: IncomeScheduleProps) {
  const total = incomes.reduce((acc, income) => acc + Number(income.amount ?? 0), 0);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Próximas entradas
          </p>
          <h3 className="text-xl font-semibold">Agenda de recebimentos</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total no período</p>
          <p className="text-xl font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Adicione suas rendas para acompanhar o fluxo do mês.
          </p>
        ) : null}
        {incomes.map((income) => (
          <div
            key={income.id}
            className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold">{income.description}</p>
              <p className="text-xs text-muted-foreground">
                {income.isFixed ? 'Fixa' : 'Variável'} • competência {income.month}/{income.year}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold">{formatCurrency(Number(income.amount))}</p>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(income.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
