import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomes } from '@/hooks/useIncomes';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { CreateTransactionModal } from '@/components/dashboard/CreateTransactionModal';
import { CreateIncomeModal } from '@/components/dashboard/CreateIncomeModal';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { IncomeSchedule } from '@/components/dashboard/IncomeSchedule';
import { toast } from 'sonner';

export function EntriesPage() {
  const { transactions, fetchTransactions, deleteTransaction, createTransaction } = useTransactions();
  const { incomes, fetchIncomes, deleteIncome, createIncome } = useIncomes();

  const { categories, fetchCategories } = useCategories();

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchIncomes();
    fetchCategories();
  }, [fetchTransactions, fetchIncomes, fetchCategories]);

  const handleCreateTransaction = async (payload: Parameters<typeof createTransaction>[0]) => {
    try {
      setModalSaving(true);
      await createTransaction(payload);
      toast.success('Transação criada');
      await fetchTransactions();
    } finally {
      setModalSaving(false);
    }
  };

  const handleCreateIncome = async (payload: Parameters<typeof createIncome>[0]) => {
    try {
      setModalSaving(true);
      await createIncome(payload);
      toast.success('Renda registrada');
      await fetchIncomes();
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setTransactionModalOpen(true)}>Registrar Transação</Button>
        <Button variant="outline" onClick={() => setIncomeModalOpen(true)}>
          Registrar Renda
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TransactionsTable
          transactions={transactions}
          onDelete={async (id) => {
            await deleteTransaction(id);
            toast.success('Transação removida');
            fetchTransactions();
          }}
        />
        <IncomeSchedule
          incomes={incomes}
          onDelete={async (id) => {
            await deleteIncome(id);
            toast.success('Renda removida');
            fetchIncomes();
          }}
        />
      </div>
      <CreateTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={categories}
        onSubmit={handleCreateTransaction}
        isSubmitting={modalSaving}
      />
      <CreateIncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSubmit={handleCreateIncome}
        isSubmitting={modalSaving}
      />
    </div>
  );
}
