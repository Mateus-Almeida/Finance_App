import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  LogOut,
  Plus,
  TrendingUp,
  Calendar,
  User,
  Layers,
  PiggyBank,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomes } from '@/hooks/useIncomes';
import { useCategories } from '@/hooks/useCategories';
import { RealityCard } from '@/components/RealityCard';
import { ProjectionChart } from '@/components/ProjectionChart';
import { FiftyThirtyTwenty } from '@/components/FiftyThirtyTwenty';
import { formatCurrency, getCurrentMonth, getCurrentYear, formatMonthYear } from '@/utils/format';
import { RealityCardData, Installment, Transaction } from '@/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CreateTransactionModal } from '@/components/dashboard/CreateTransactionModal';
import { CreateIncomeModal } from '@/components/dashboard/CreateIncomeModal';
import { CreateCategoryModal } from '@/components/dashboard/CreateCategoryModal';
import { UpcomingInstallments } from '@/components/dashboard/UpcomingInstallments';
import { installmentService } from '@/services/installment.service';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card } from '@/components/ui/card';

// ============================================
// PÁGINA: DASHBOARD PRINCIPAL
// ============================================

export function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [pendingInstallments, setPendingInstallments] = useState<Installment[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<Installment[]>([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'incomes'>('transactions');
  const [modalSaving, setModalSaving] = useState(false);

  const {
    transactions,
    summary,
    projection,
    isLoading: isLoadingTransactions,
    fetchTransactions,
    fetchSummary,
    fetchProjection,
    createTransaction,
  } = useTransactions();

  const {
    incomes,
    totalIncome,
    isLoading: isLoadingIncomes,
    fetchIncomes,
    fetchTotal,
    createIncome,
  } = useIncomes();

  const {
    categories,
    isLoading: isLoadingCategories,
    fetchCategories,
    createCategory,
  } = useCategories();

  const loadInstallments = useCallback(async () => {
    setInstallmentsLoading(true);
    try {
      const [pending, upcoming] = await Promise.all([
        installmentService.getPending(selectedMonth, selectedYear),
        installmentService.getUpcoming(5),
      ]);
      setPendingInstallments(pending);
      setUpcomingInstallments(upcoming);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar as parcelas');
    } finally {
      setInstallmentsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const loadDashboard = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        fetchTransactions(selectedMonth, selectedYear),
        fetchSummary(selectedMonth, selectedYear),
        fetchProjection(6),
        fetchIncomes(selectedMonth, selectedYear),
        fetchTotal(selectedMonth, selectedYear),
        fetchCategories(),
        loadInstallments(),
      ]);
    } finally {
      setIsSyncing(false);
    }
  }, [
    fetchTransactions,
    fetchSummary,
    fetchProjection,
    fetchIncomes,
    fetchTotal,
    fetchCategories,
    loadInstallments,
    selectedMonth,
    selectedYear,
  ]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const handleCreateTransaction = async (payload: Parameters<typeof createTransaction>[0]) => {
    try {
      setModalSaving(true);
      await createTransaction(payload);
      toast.success('Transação criada com sucesso');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar transação');
      throw error;
    } finally {
      setModalSaving(false);
    }
  };

  const handleCreateIncome = async (payload: Parameters<typeof createIncome>[0]) => {
    try {
      setModalSaving(true);
      await createIncome(payload);
      toast.success('Renda registrada');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar renda');
      throw error;
    } finally {
      setModalSaving(false);
    }
  };

  const handleCreateCategory = async (payload: Parameters<typeof createCategory>[0]) => {
    try {
      setModalSaving(true);
      await createCategory(payload);
      toast.success('Categoria criada');
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar categoria');
      throw error;
    } finally {
      setModalSaving(false);
    }
  };

  const handleToggleInstallment = async (installment: Installment) => {
    try {
      setInstallmentsLoading(true);
      if (installment.isPaid) {
        await installmentService.markAsUnpaid(installment.id);
        toast.success('Parcela marcada como pendente');
      } else {
        await installmentService.markAsPaid(installment.id);
        toast.success('Parcela paga');
      }
      await loadInstallments();
      await fetchProjection(6);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível atualizar a parcela');
    } finally {
      setInstallmentsLoading(false);
    }
  };

  const fixedExpenses = useMemo(
    () => transactions.filter((transaction) => transaction.isFixed),
    [transactions],
  );

  const fixedTotal = useMemo(
    () =>
      fixedExpenses.reduce((acc, transaction) => acc + Number(transaction.amount ?? 0), 0),
    [fixedExpenses],
  );

  const installmentsTotal = useMemo(
    () =>
      pendingInstallments.reduce((acc, installment) => acc + Number(installment.amount ?? 0), 0),
    [pendingInstallments],
  );

  const netSalary = totalIncome || 0;
  const totalCommitments = installmentsTotal + fixedTotal;
  const availableBalance = netSalary - totalCommitments;

  const realityData: RealityCardData = {
    netSalary,
    installmentsTotal,
    fixedTotal,
    totalCommitments,
    availableBalance,
    pendingInstallmentsCount: pendingInstallments.length,
    percentageCommitted:
      netSalary > 0 ? Number(((totalCommitments / netSalary) * 100).toFixed(2)) : 0,
    percentageAvailable:
      netSalary > 0 ? Number(((availableBalance / netSalary) * 100).toFixed(2)) : 0,
  };

  const monthsOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const yearsOptions = Array.from({ length: 5 }, (_, index) => getCurrentYear() - 2 + index);

  const isLoading = isSyncing || isLoadingTransactions || isLoadingIncomes || isLoadingCategories;

  const recentTransactions = transactions.slice(0, 5);
  const recentIncomes = incomes.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dashboard financeiro</p>
              <h1 className="text-xl font-semibold">Finance Tracker</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Período</p>
          <div className="mt-2 flex gap-2">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
            >
              {monthsOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthYear(month, selectedYear).split(' ')[0]}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
            >
              {yearsOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <Button className="gap-2" onClick={() => setTransactionModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIncomeModalOpen(true)}>
            <PiggyBank className="h-4 w-4" />
            Nova Renda
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setCategoryModalOpen(true)}>
            <Layers className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        </section>

        {isLoading ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Sincronizando dados...</p>
            </div>
          </div>
        ) : null}

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Renda líquida"
            value={formatCurrency(netSalary)}
            description={`Última atualização: ${formatMonthYear(selectedMonth, selectedYear)}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Gastos do mês"
            value={formatCurrency(summary?.total ?? 0)}
            description="Total consolidado de despesas"
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatsCard
            title="Parcelas pendentes"
            value={formatCurrency(installmentsTotal)}
            highlight={`${pendingInstallments.length} parcelas`}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatsCard
            title="Saldo real"
            value={formatCurrency(availableBalance)}
            description="Salário líquido - compromissos"
            icon={<PiggyBank className="h-5 w-5" />}
            trend={
              availableBalance >= 0
                ? 'Dentro da capacidade de gastos'
                : 'Atenção! Saldo comprometido'
            }
          />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RealityCard
            netSalary={realityData.netSalary}
            installmentsTotal={realityData.installmentsTotal}
            fixedTotal={realityData.fixedTotal}
            availableBalance={realityData.availableBalance}
            pendingInstallmentsCount={realityData.pendingInstallmentsCount}
            percentageCommitted={realityData.percentageCommitted}
            percentageAvailable={realityData.percentageAvailable}
          />

          {summary ? (
            <FiftyThirtyTwenty
              essential={summary.essential}
              lifestyle={summary.lifestyle}
              debtsInvestments={summary.debtsInvestments}
              total={summary.total}
              netIncome={netSalary}
            />
          ) : (
            <Card className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Registre transações para ver a distribuição 50/30/20.
            </Card>
          )}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {projection.length > 0 ? (
              <ProjectionChart data={projection} />
            ) : (
              <Card className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Registre mais transações para visualizar a projeção dos próximos meses.
              </Card>
            )}
          </div>
          <UpcomingInstallments
            installments={upcomingInstallments}
            onTogglePayment={handleToggleInstallment}
            isLoading={installmentsLoading}
          />
        </section>

        <section className="mt-10 rounded-2xl border bg-card p-5">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Movimentações recentes</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe os últimos lançamentos e seus impactos.
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="transactions">Despesas</TabsTrigger>
                <TabsTrigger value="incomes">Rendas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="transactions" className="mt-4">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Você ainda não registrou transações neste período.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2">Categoria</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction: Transaction) => (
                        <tr key={transaction.id} className="border-t">
                          <td className="px-3 py-2 font-medium">{transaction.description}</td>
                          <td className="px-3 py-2">
                            {transaction.category?.name ?? 'Sem categoria'}
                          </td>
                          <td className="px-3 py-2">{formatCurrency(Number(transaction.amount))}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {transaction.isInstallment
                              ? 'Parcelado'
                              : transaction.isFixed
                                ? 'Fixo'
                                : 'Avulso'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="incomes" className="mt-4">
              {recentIncomes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma renda registrada para o período selecionado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIncomes.map((income) => (
                        <tr key={income.id} className="border-t">
                          <td className="px-3 py-2 font-medium">{income.description}</td>
                          <td className="px-3 py-2">{formatCurrency(Number(income.amount))}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {income.isFixed ? 'Fixa' : 'Variável'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <CreateTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={categories}
        onSubmit={handleCreateTransaction}
        isSubmitting={modalSaving}
      />
      <CreateIncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSubmit={handleCreateIncome}
        isSubmitting={modalSaving}
      />
      <CreateCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={modalSaving}
      />
    </div>
  );
}
