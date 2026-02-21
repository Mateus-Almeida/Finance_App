import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomes } from '@/hooks/useIncomes';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CreateTransactionModal } from '@/components/dashboard/CreateTransactionModal';
import { CreateIncomeModal } from '@/components/dashboard/CreateIncomeModal';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { IncomeSchedule } from '@/components/dashboard/IncomeSchedule';
import { PaymentsHistoryTable } from '@/components/dashboard/PaymentsHistoryTable';
import { toast } from 'sonner';
import { Transaction, Income } from '@/types';

export function EntriesPage() {
  const { transactions, fetchTransactions, deleteTransaction, createTransaction, updateTransaction } = useTransactions();
  const { incomes, fetchIncomes, deleteIncome, createIncome, updateIncome } = useIncomes();
  const { categories, fetchCategories } = useCategories();
  const { paymentMethods, refetch: fetchPaymentMethods } = usePaymentMethods();

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchTransactions();
    fetchIncomes();
    fetchCategories();
    fetchPaymentMethods();
  }, [fetchTransactions, fetchIncomes, fetchCategories, fetchPaymentMethods]);

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

  const handleUpdateTransaction = async (payload: Parameters<typeof createTransaction>[0]) => {
    if (!editingTransaction) return;
    try {
      setModalSaving(true);
      await updateTransaction(editingTransaction.id, payload);
      toast.success('Transação atualizada');
      await fetchTransactions();
      setTransactionModalOpen(false);
      setEditingTransaction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar transação');
    } finally {
      setModalSaving(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
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

  const handleUpdateIncome = async (payload: Parameters<typeof createIncome>[0]) => {
    if (!editingIncome) return;
    try {
      setModalSaving(true);
      await updateIncome(editingIncome.id, payload);
      toast.success('Renda atualizada');
      await fetchIncomes();
      setEditingIncome(null);
      setIncomeModalOpen(false);
    } finally {
      setModalSaving(false);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeModalOpen(true);
  };

  const handleCloseIncomeModal = () => {
    setIncomeModalOpen(false);
    setEditingIncome(null);
  };

  const handleDeleteTransaction = (id: string, description: string) => {
    setConfirmDialog({
      open: true,
      title: 'Excluir transação',
      description: `Tem certeza que deseja excluir "${description}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        await deleteTransaction(id);
        toast.success('Transação removida');
        fetchTransactions();
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleDeleteIncome = (id: string, description: string) => {
    setConfirmDialog({
      open: true,
      title: 'Excluir renda',
      description: `Tem certeza que deseja excluir "${description}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        await deleteIncome(id);
        toast.success('Renda removida');
        fetchIncomes();
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleTogglePaid = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setConfirmDialog({
      open: true,
      title: newStatus ? 'Marcar como pago' : 'Marcar como não pago',
      description: newStatus 
        ? 'Tem certeza que deseja marcar esta transação como paga?' 
        : 'Tem certeza que deseja marcar esta transação como não paga?',
      onConfirm: async () => {
        await updateTransaction(id, { isPaid: newStatus });
        toast.success(newStatus ? 'Transação marcada como paga' : 'Transação marcada como não paga');
        fetchTransactions();
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const pendingTransactions = transactions.filter(t => !t.isPaid);
  const paidTransactions = transactions.filter(t => t.isPaid);

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
          transactions={pendingTransactions}
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
          onTogglePaid={handleTogglePaid}
        />
        <IncomeSchedule
          incomes={incomes}
          onDelete={handleDeleteIncome}
          onEdit={handleEditIncome}
        />
      </div>
      {paidTransactions.length > 0 && (
        <PaymentsHistoryTable
          transactions={paidTransactions}
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
        />
      )}
      <CreateTransactionModal
        open={transactionModalOpen}
        onClose={handleCloseTransactionModal}
        categories={categories}
        paymentMethods={paymentMethods}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        isSubmitting={modalSaving}
        editTransaction={editingTransaction}
      />
      <CreateIncomeModal
        open={incomeModalOpen}
        onClose={handleCloseIncomeModal}
        onSubmit={editingIncome ? handleUpdateIncome : handleCreateIncome}
        isSubmitting={modalSaving}
        editIncome={editingIncome}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
