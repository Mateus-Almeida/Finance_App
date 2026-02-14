import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryType } from '@/types';
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
    type: CategoryType;
    color?: string;
    icon?: string;
  }) => {
    setIsSaving(true);
    try {
      await createCategory(payload);
      toast.success('Categoria criada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (payload: {
    name: string;
    type: CategoryType;
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.category) return;
    try {
      await deleteCategory(confirmDelete.category.id);
      toast.success('Categoria removida');
    } finally {
      setConfirmDelete({ open: false, category: null });
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const openDeleteConfirm = (category: Category) => {
    setConfirmDelete({ open: true, category });
  };

  const sections = groupByType(categories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">Metodologia 50/30/20</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.type} className="rounded-2xl border bg-card p-4">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{section.title}</p>
              <p className="text-lg font-semibold">{section.percentage}%</p>
            </div>
            <div className="space-y-2">
              {section.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => openEditModal(category)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => openDeleteConfirm(category)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {section.categories.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Nenhuma categoria</p>
              )}
            </div>
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

function groupByType(categories: Category[]) {
  const map: Record<CategoryType, Category[]> = {
    [CategoryType.ESSENTIAL]: [],
    [CategoryType.LIFESTYLE]: [],
    [CategoryType.DEBTS_INVESTMENTS]: [],
  };
  categories.forEach((category) => map[category.type].push(category));

  return [
    {
      type: CategoryType.ESSENTIAL,
      title: 'Essenciais',
      percentage: 50,
      categories: map[CategoryType.ESSENTIAL],
    },
    {
      type: CategoryType.LIFESTYLE,
      title: 'Estilo de Vida',
      percentage: 30,
      categories: map[CategoryType.LIFESTYLE],
    },
    {
      type: CategoryType.DEBTS_INVESTMENTS,
      title: 'Reservas',
      percentage: 20,
      categories: map[CategoryType.DEBTS_INVESTMENTS],
    },
  ];
}
