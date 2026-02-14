import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  onDelete: (id: string, description: string) => void;
  onEdit: (transaction: Transaction) => void;
}

function getStatus(transaction: Transaction): { label: string; color: string; icon: JSX.Element } {
  const now = new Date();
  const transactionDate = new Date(transaction.transactionDate);
  
  if (transaction.isPaid) {
    return { label: 'Pago', color: 'text-green-500 bg-green-500/10', icon: <CheckCircle className="h-3 w-3" /> };
  }
  
  if (transactionDate < now) {
    return { label: 'Atrasado', color: 'text-red-500 bg-red-500/10', icon: <AlertCircle className="h-3 w-3" /> };
  }
  
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  if (transactionDate >= nextMonth) {
    return { label: 'Futuro', color: 'text-blue-500 bg-blue-500/10', icon: <Clock className="h-3 w-3" /> };
  }
  
  return { label: 'Pendente', color: 'text-yellow-500 bg-yellow-500/10', icon: <Clock className="h-3 w-3" /> };
}

export function TransactionsTable({ transactions, onDelete, onEdit }: TransactionsTableProps) {
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
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Nada registrado no período selecionado.
                </td>
              </tr>
            ) : (
              transactions.slice(0, 8).map((transaction) => {
                const status = getStatus(transaction);
                return (
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
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                      {transaction.isInstallment ? 'Parcelado' : transaction.isFixed ? 'Fixo' : 'Avulso'}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
