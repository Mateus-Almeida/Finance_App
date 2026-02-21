import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { CreateCategoryModal } from '@/components/dashboard/CreateCategoryModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function CategoriesPage() {
  const { categories, fetchCategories, createCategory, deleteCategory, updateCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (payload: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    setIsSaving(true);
    try {
      await createCategory(payload);
      toast.success('Categoria criada');
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (payload: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    if (!selectedCategory) return;
    setIsSaving(true);
    try {
      await updateCategory(selectedCategory.id, payload);
      toast.success('Categoria atualizada');
      setEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.category) return;
    setIsSaving(true);
    try {
      await deleteCategory(confirmDelete.category.id);
      toast.success('Categoria excluída');
      setConfirmDelete({ open: false, category: null });
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie suas categorias de gastos</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <p className="font-medium">{category.name}</p>
                {category.isDefault && (
                  <span className="text-xs text-muted-foreground">Padrão</span>
                )}
              </div>
            </div>
            {!category.isDefault && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCategory(category);
                    setEditModalOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDelete({ open: true, category })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <CreateCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSaving}
      />

      <CreateCategoryModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={isSaving}
        editCategory={selectedCategory}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${confirmDelete.category?.name}"? Transações usando esta categoria não serão afetadas.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, category: null })}
      />
    </div>
  );
}
