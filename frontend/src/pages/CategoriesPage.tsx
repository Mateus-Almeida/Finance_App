import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryType } from '@/types';
import { Button } from '@/components/ui/button';
import { CreateCategoryModal } from '@/components/dashboard/CreateCategoryModal';
import { Badge } from '@/components/ui/badge';

export function CategoriesPage() {
  const { categories, fetchCategories, createCategory, deleteCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    } finally {
      setIsSaving(false);
    }
  };

  const sections = groupByType(categories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Categorias 50/30/20</h2>
        <Button onClick={() => setModalOpen(true)}>Nova categoria</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.type} className="rounded-2xl border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{section.title}</p>
                <p className="text-lg font-semibold">{section.subtitle}</p>
              </div>
              <Badge variant="outline">{section.categories.length} itens</Badge>
            </div>
            <div className="space-y-3">
              {section.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.isDefault ? 'Categoria padrão' : 'Personalizada'}
                      </p>
                    </div>
                  </div>
                  {!category.isDefault ? (
                    <button
                      className="text-xs text-destructive hover:underline"
                      onClick={() => deleteCategory(category.id)}
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              ))}
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
      title: 'Essenciais 50%',
      subtitle: 'Moradia, alimentação, saúde',
      categories: map[CategoryType.ESSENTIAL],
    },
    {
      type: CategoryType.LIFESTYLE,
      title: 'Estilo de vida 30%',
      subtitle: 'Lazer, restaurantes, hobbies',
      categories: map[CategoryType.LIFESTYLE],
    },
    {
      type: CategoryType.DEBTS_INVESTMENTS,
      title: 'Dívidas e investimentos 20%',
      subtitle: 'Parcelas, investimentos e poupança',
      categories: map[CategoryType.DEBTS_INVESTMENTS],
    },
  ];
}
