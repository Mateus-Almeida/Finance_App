import { useState } from 'react';
import { CategoryType } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: CategoryType; color?: string; icon?: string }) => Promise<
    void
  >;
  isSubmitting: boolean;
}

const CATEGORY_OPTIONS = [
  { label: 'Essencial (50%)', value: CategoryType.ESSENTIAL },
  { label: 'Estilo de Vida (30%)', value: CategoryType.LIFESTYLE },
  { label: 'Dívidas / Investimentos (20%)', value: CategoryType.DEBTS_INVESTMENTS },
];

export function CreateCategoryModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateCategoryModalProps) {
  const [form, setForm] = useState({
    name: '',
    type: CategoryType.ESSENTIAL,
    color: '#0ea5e9',
    icon: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    await onSubmit(form);
    setForm({
      name: '',
      type: CategoryType.ESSENTIAL,
      color: '#0ea5e9',
      icon: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar categoria"
      description="Organize seus gastos dentro da metodologia 50/30/20."
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nome</Label>
          <Input
            id="category-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-type">Tipo</Label>
          <select
            id="category-type"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, type: e.target.value as CategoryType }))
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-color">Cor</Label>
            <Input
              id="category-color"
              type="color"
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-icon">Ícone (opcional)</Label>
            <Input
              id="category-icon"
              placeholder="lucide-wallet"
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
