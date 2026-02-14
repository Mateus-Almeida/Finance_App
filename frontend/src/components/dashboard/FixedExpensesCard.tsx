import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/format';

interface FixedExpensesCardProps {
  expenses: Transaction[];
}

export function FixedExpensesCard({ expenses }: FixedExpensesCardProps) {
  const total = expenses.reduce((acc, expense) => acc + Number(expense.amount ?? 0), 0);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contas recorrentes
          </p>
          <h3 className="text-xl font-semibold">Despesas fixas do mês</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa fixa cadastrada no período.
          </p>
        ) : (
          expenses.slice(0, 6).map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  Categoria: {expense.category?.name ?? 'Sem categoria'}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(Number(expense.amount))}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
