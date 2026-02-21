import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { goalsService, Goal, GoalProgress, CreateGoalDto } from '@/services/goals.service';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useSavingsBoxes } from '@/hooks/useSavingsBoxes';
import { GoalType, GoalStatus } from '@/types';

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.CATEGORY_LIMIT]: 'Limite por Categoria',
  [GoalType.CARD_LIMIT]: 'Limite por Cartão',
  [GoalType.SAVING]: 'Meta de Economia',
  [GoalType.TARGET_VALUE]: 'Valor Alvo',
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  [GoalStatus.OK]: 'bg-green-500',
  [GoalStatus.WARNING]: 'bg-yellow-500',
  [GoalStatus.EXCEEDED]: 'bg-red-500',
  [GoalStatus.NOT_STARTED]: 'bg-gray-400',
};

export function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const creditCards = paymentMethods.filter(pm => pm.type === 'CREDIT_CARD');
  const { savingsBoxes } = useSavingsBoxes();

  const [form, setForm] = useState<CreateGoalDto>({
    name: '',
    type: GoalType.CATEGORY_LIMIT,
    targetValue: 0,
    categoryId: undefined,
    paymentMethodId: undefined,
    savingsBoxId: undefined,
    warningPercent: 80,
    color: '#10b981',
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getProgress(selectedMonth, selectedYear);
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (form.targetValue <= 0) {
      toast.error('Valor alvo deve ser maior que zero');
      return;
    }

    try {
      setSaving(true);
      if (editingGoal) {
        await goalsService.update(editingGoal.id, form);
        toast.success('Meta atualizada');
      } else {
        await goalsService.create(form);
        toast.success('Meta criada');
      }
      setModalOpen(false);
      resetForm();
      fetchGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await goalsService.delete(id);
      toast.success('Meta excluída');
      fetchGoals();
    } catch (error) {
      toast.error('Erro ao excluir meta');
    }
  };

  const resetForm = () => {
    setEditingGoal(null);
    setForm({
      name: '',
      type: GoalType.CATEGORY_LIMIT,
      targetValue: 0,
      categoryId: undefined,
      paymentMethodId: undefined,
      savingsBoxId: undefined,
      warningPercent: 80,
      color: '#10b981',
    });
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const stats = {
    total: goals.length,
    ok: goals.filter(g => g.status === GoalStatus.OK).length,
    warning: goals.filter(g => g.status === GoalStatus.WARNING).length,
    exceeded: goals.filter(g => g.status === GoalStatus.EXCEEDED).length,
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Metas</h1>
          <p className="text-muted-foreground">Acompanhe seus limites e objetivos</p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button onClick={openNewModal}>Nova Meta</Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total de Metas</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">No Objetivo</p>
            <p className="text-2xl font-bold text-green-500">{stats.ok}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Em Alerta</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.warning}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Estouradas</p>
            <p className="text-2xl font-bold text-red-500">{stats.exceeded}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
            <Card key={goal.goalId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.goalName}</CardTitle>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[goal.status] }}
                    title={goal.status}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {GOAL_TYPE_LABELS[goal.goalType]}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meta:</span>
                    <span className="font-medium">{formatCurrency(goal.targetValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Atual:</span>
                    <span>{formatCurrency(goal.currentValue)}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span>{goal.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          goal.status === GoalStatus.EXCEEDED ? 'bg-red-500' :
                          goal.status === GoalStatus.WARNING ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleDelete(goal.goalId)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
        footer={
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Criar'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Limite Alimentação"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Meta</Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as GoalType })}
            >
              <option value={GoalType.CATEGORY_LIMIT}>Limite por Categoria</option>
              <option value={GoalType.CARD_LIMIT}>Limite por Cartão</option>
              <option value={GoalType.SAVING}>Meta de Economia</option>
              <option value={GoalType.TARGET_VALUE}>Valor Alvo</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Valor Alvo</Label>
            <Input
              type="number"
              value={form.targetValue || ''}
              onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })}
              placeholder="2000"
            />
          </div>

          {form.type === GoalType.CATEGORY_LIMIT && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.categoryId || ''}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value || undefined })}
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.type === GoalType.CARD_LIMIT && (
            <div className="space-y-2">
              <Label>Cartão</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.paymentMethodId || ''}
                onChange={(e) => setForm({ ...form, paymentMethodId: e.target.value || undefined })}
              >
                <option value="">Selecione...</option>
                {creditCards.map(card => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>
          )}

          {(form.type === GoalType.SAVING || form.type === GoalType.TARGET_VALUE) && (
            <div className="space-y-2">
              <Label>Caixa de Investimento</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.savingsBoxId || ''}
                onChange={(e) => setForm({ ...form, savingsBoxId: e.target.value || undefined })}
              >
                <option value="">Selecione...</option>
                {savingsBoxes.map(box => (
                  <option key={box.id} value={box.id}>{box.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Porcentagem de Alerta (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={form.warningPercent}
              onChange={(e) => setForm({ ...form, warningPercent: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
