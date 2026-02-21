import { useEffect, useState } from 'react';
import { Category, Transaction, TransactionType, PaymentMethod } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onSubmit: (payload: {
    categoryId: string;
    type: TransactionType;
    description: string;
    amount: number;
    transactionDate: string;
    competenceMonth: number;
    competenceYear: number;
    isFixed: boolean;
    isInstallment: boolean;
    totalInstallments: number;
    repeatMonthly: boolean;
    repeatMonths: number;
    isPaid?: boolean;
    paymentMethodId?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  editTransaction?: Transaction | null;
}

export function CreateTransactionModal({
  open,
  onClose,
  categories,
  paymentMethods,
  onSubmit,
  isSubmitting,
  editTransaction,
}: CreateTransactionModalProps) {
  const [form, setForm] = useState({
    type: TransactionType.EXPENSE,
    categoryId: '',
    description: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    isFixed: false,
    isInstallment: false,
    totalInstallments: 1,
    repeatMonthly: false,
    repeatMonths: 1,
    isPaid: false,
    paymentMethodId: '',
  });

  const parseDateForInput = (dateString: string | Date): string => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    const dateStr = String(dateString);
    
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!open) {
      setForm({
        type: TransactionType.EXPENSE,
        categoryId: categories[0]?.id || '',
        description: '',
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        isFixed: false,
        isInstallment: false,
        totalInstallments: 1,
        repeatMonthly: false,
        repeatMonths: 1,
        isPaid: false,
        paymentMethodId: paymentMethods[0]?.id || '',
      });
    }
  }, [open, categories, paymentMethods]);

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setForm({
          type: editTransaction.type || TransactionType.EXPENSE,
          categoryId: editTransaction.categoryId || categories[0]?.id || '',
          description: editTransaction.description,
          amount: String(editTransaction.amount),
          transactionDate: parseDateForInput(editTransaction.transactionDate),
          isFixed: editTransaction.isFixed,
          isInstallment: editTransaction.isInstallment,
          totalInstallments: editTransaction.totalInstallments || 1,
          repeatMonthly: false,
          repeatMonths: 1,
          isPaid: editTransaction.isPaid || false,
          paymentMethodId: editTransaction.paymentMethodId || paymentMethods[0]?.id || '',
        });
      } else if (categories.length > 0 && !form.categoryId) {
        setForm((prev) => ({ ...prev, categoryId: categories[0].id, paymentMethodId: paymentMethods[0]?.id || '' }));
      }
    }
  }, [editTransaction, categories, open]);

  const handleSubmit = async () => {
    if (!form.categoryId) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    if (form.isInstallment && form.totalInstallments < 2) {
      toast.error('Parcelas precisam ser no mínimo 2');
      return;
    }
    if (form.repeatMonthly && form.repeatMonths < 2) {
      toast.error('Repetição mensal precisa ser de pelo menos 2 meses');
      return;
    }

    const payload = {
      type: form.type,
      categoryId: form.categoryId,
      description: form.description,
      amount: Number(form.amount),
      transactionDate: form.transactionDate,
      competenceMonth: parseInt(form.transactionDate.split('-')[1]),
      competenceYear: parseInt(form.transactionDate.split('-')[0]),
      isFixed: form.isFixed,
      isInstallment: form.isInstallment,
      totalInstallments: form.isInstallment ? form.totalInstallments : 1,
      repeatMonthly: form.repeatMonthly,
      repeatMonths: form.repeatMonthly ? form.repeatMonths : 1,
      isPaid: form.isPaid,
      paymentMethodId: form.paymentMethodId || undefined,
    };

    await onSubmit(payload);
    setForm({
      type: TransactionType.EXPENSE,
      categoryId: categories[0]?.id ?? '',
      description: '',
      amount: '',
      transactionDate: new Date().toISOString().split('T')[0],
      isFixed: false,
      isInstallment: false,
      totalInstallments: 1,
      repeatMonthly: false,
      repeatMonths: 1,
      isPaid: false,
      paymentMethodId: paymentMethods[0]?.id ?? '',
    });
    onClose();
  };

  const isEditing = !!editTransaction;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar transação' : 'Registrar despesa'}
      description={isEditing ? 'Atualize os dados da transação.' : 'Cadastre uma transação única ou parcelada.'}
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))}
          >
            <option value={TransactionType.EXPENSE}>Despesa</option>
            <option value={TransactionType.INCOME}>Receita</option>
            <option value={TransactionType.INVESTMENT}>Investimento</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Cartão supermercado"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              style={{ colorScheme: 'light' }}
              value={form.transactionDate}
              onChange={(e) => setForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Meio de pagamento</Label>
          <select
            id="paymentMethod"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.paymentMethodId}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentMethodId: e.target.value }))}
          >
            {paymentMethods.length === 0 ? (
              <option value="">Nenhum meio de pagamento</option>
            ) : (
              paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name} ({pm.type})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFixed}
            onChange={(e) => setForm((prev) => ({ ...prev, isFixed: e.target.checked }))}
          />
          Gasto fixo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isInstallment}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isInstallment: e.target.checked,
                repeatMonthly: e.target.checked ? false : prev.repeatMonthly,
                totalInstallments: e.target.checked ? Math.max(prev.totalInstallments, 2) : 1,
              }))
            }
          />
          Criar parcelamento
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) => setForm((prev) => ({ ...prev, isPaid: e.target.checked }))}
          />
          Já foi pago
        </label>
      </div>

      {form.isInstallment ? (
        <div className="space-y-2">
          <Label htmlFor="installments">Qtd Parcelas</Label>
          <Input
            id="installments"
            type="number"
            min="2"
            value={form.totalInstallments}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                totalInstallments: Number(e.target.value),
              }))
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.repeatMonthly}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    repeatMonthly: e.target.checked,
                    repeatMonths: e.target.checked ? Math.max(prev.repeatMonths, 2) : 1,
                  }))
                }
              />
              Repetir mensalmente
            </label>
          </div>

          {form.repeatMonthly ? (
            <div className="space-y-2">
              <Label htmlFor="repeatMonths">Quantos meses?</Label>
              <Input
                id="repeatMonths"
                type="number"
                min="2"
                max="24"
                value={form.repeatMonths}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    repeatMonths: Number(e.target.value),
                  }))
                }
              />
            </div>
          ) : null}
        </>
      )}
    </Modal>
  );
}
