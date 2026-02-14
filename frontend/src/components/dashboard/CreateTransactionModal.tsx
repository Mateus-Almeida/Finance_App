import { useEffect, useState } from 'react';
import { Category, Transaction } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (payload: {
    categoryId: string;
    description: string;
    amount: number;
    transactionDate: string;
    month: number;
    year: number;
    isFixed: boolean;
    isInstallment: boolean;
    totalInstallments: number;
    repeatMonthly: boolean;
    repeatMonths: number;
    isPaid?: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  editTransaction?: Transaction | null;
}

export function CreateTransactionModal({
  open,
  onClose,
  categories,
  onSubmit,
  isSubmitting,
  editTransaction,
}: CreateTransactionModalProps) {
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    if (editTransaction) {
      setForm({
        categoryId: editTransaction.categoryId || categories[0]?.id || '',
        description: editTransaction.description,
        amount: String(editTransaction.amount),
        transactionDate: new Date(editTransaction.transactionDate).toISOString().split('T')[0],
        isFixed: editTransaction.isFixed,
        isInstallment: editTransaction.isInstallment,
        totalInstallments: 1,
        repeatMonthly: false,
        repeatMonths: 1,
        isPaid: (editTransaction as any).isPaid || false,
      });
    } else if (categories.length > 0 && !form.categoryId) {
      setForm((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [editTransaction, categories]);

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

    const date = new Date(form.transactionDate);
    const payload = {
      categoryId: form.categoryId,
      description: form.description,
      amount: Number(form.amount),
      transactionDate: date.toISOString(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isFixed: form.isFixed,
      isInstallment: form.isInstallment,
      totalInstallments: form.isInstallment ? form.totalInstallments : 1,
      repeatMonthly: form.repeatMonthly,
      repeatMonths: form.repeatMonthly ? form.repeatMonths : 1,
      isPaid: form.isPaid,
    };

    await onSubmit(payload);
    setForm({
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
          <Input
            id="date"
            type="date"
            value={form.transactionDate}
            onChange={(e) => setForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
          />
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
