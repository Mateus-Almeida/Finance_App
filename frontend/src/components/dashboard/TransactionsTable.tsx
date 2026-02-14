import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
}

export function TransactionsTable({ transactions, onDelete }: TransactionsTableProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fluxo detalhado
          </p>
          <h3 className="text-xl font-semibold">Transações recentes</h3>
        </div>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2 text-center">Tipo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Nada registrado no período selecionado.
                </td>
              </tr>
            ) : (
              transactions.slice(0, 8).map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="px-3 py-3 font-semibold">{transaction.description}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {transaction.category?.name ?? 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {formatCurrency(Number(transaction.amount))}
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                    {transaction.isInstallment ? 'Parcelado' : transaction.isFixed ? 'Fixo' : 'Avulso'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive'
                      onClick={() => onDelete(transaction.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
