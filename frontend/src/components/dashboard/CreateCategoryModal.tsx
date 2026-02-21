import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; color?: string; icon?: string }) => Promise<void>;
  isSubmitting: boolean;
  editCategory?: Category | null;
}

export function CreateCategoryModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  editCategory,
}: CreateCategoryModalProps) {
  const [form, setForm] = useState({
    name: '',
    color: '#0ea5e9',
    icon: '',
  });

  const isEditing = !!editCategory;

  useEffect(() => {
    if (editCategory) {
      setForm({
        name: editCategory.name,
        color: editCategory.color || '#0ea5e9',
        icon: editCategory.icon || '',
      });
    }
  }, [editCategory]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    await onSubmit(form);
    setForm({
      name: '',
      color: '#0ea5e9',
      icon: '',
    });
    onClose();
  };

  const handleOpenChange = () => {
    setForm({
      name: '',
      color: '#0ea5e9',
      icon: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleOpenChange}
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      description={isEditing ? 'Atualize os dados da categoria.' : 'Crie categorias para organizar seus gastos.'}
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
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
