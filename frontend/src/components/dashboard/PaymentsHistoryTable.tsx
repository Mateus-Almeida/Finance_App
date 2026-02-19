import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, CheckCircle } from 'lucide-react';

interface PaymentsHistoryTableProps {
  transactions: Transaction[];
  onDelete: (id: string, description: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function PaymentsHistoryTable({ transactions, onDelete, onEdit }: PaymentsHistoryTableProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Histórico
          </p>
          <h3 className="text-xl font-semibold">Pagamentos realizados</h3>
        </div>
      </div>
      <div className="mt-4 max-h-[300px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum pagamento registrado.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
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
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      Pago
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-primary'
                        onClick={() => onEdit(transaction)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive'
                        onClick={() => onDelete(transaction.id, transaction.description)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
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
