import { useEffect, useState } from 'react';
import { Category } from '@/types';
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
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateTransactionModal({
  open,
  onClose,
  categories,
  onSubmit,
  isSubmitting,
}: CreateTransactionModalProps) {
  const [form, setForm] = useState({
    categoryId: '',
    description: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    isFixed: false,
    isInstallment: false,
    totalInstallments: 1,
  });

  useEffect(() => {
    if (categories.length > 0 && !form.categoryId) {
      setForm((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, form.categoryId]);

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
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar despesa"
      description="Cadastre uma transação única ou parcelada."
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
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
          Marcar como gasto fixo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isInstallment}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isInstallment: e.target.checked,
                totalInstallments: e.target.checked ? Math.max(prev.totalInstallments, 2) : 1,
              }))
            }
          />
          Criar parcelamento
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
      ) : null}
    </Modal>
  );
}
