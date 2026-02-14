import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurrentMonth, getCurrentYear } from '@/utils/format';

interface CreateIncomeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    description: string;
    amount: number;
    month: number;
    year: number;
    isFixed: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateIncomeModal({ open, onClose, onSubmit, isSubmitting }: CreateIncomeModalProps) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    isFixed: true,
    month: getCurrentMonth(),
    year: getCurrentYear(),
  });

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    await onSubmit({
      description: form.description,
      amount: Number(form.amount),
      month: Number(form.month),
      year: Number(form.year),
      isFixed: form.isFixed,
    });
    setForm({
      description: '',
      amount: '',
      isFixed: true,
      month: getCurrentMonth(),
      year: getCurrentYear(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar renda"
      description="Adicione salário, comissões ou outras entradas."
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="income-description">Descrição</Label>
          <Input
            id="income-description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Salário CLT"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income-amount">Valor</Label>
          <Input
            id="income-amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income-month">Mês</Label>
          <Input
            id="income-month"
            type="number"
            min="1"
            max="12"
            value={form.month}
            onChange={(e) => setForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income-year">Ano</Label>
          <Input
            id="income-year"
            type="number"
            min="2000"
            value={form.year}
            onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isFixed}
          onChange={(e) => setForm((prev) => ({ ...prev, isFixed: e.target.checked }))}
        />
        Esta renda é fixa todos os meses
      </label>
    </Modal>
  );
}
