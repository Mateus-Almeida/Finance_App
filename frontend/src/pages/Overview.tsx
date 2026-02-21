import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { formatCurrency, formatMonthYear, getCurrentMonth, getCurrentYear } from '@/utils/format';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomes } from '@/hooks/useIncomes';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardOverview } from '@/hooks/useDashboardOverview';
import { installmentService } from '@/services/installment.service';
import { Installment, Transaction, Income } from '@/types';
import { useTheme } from '@/theme';
import { toast } from 'sonner';
import { chartTooltipStyle, CustomTooltip } from '@/components/charts/CustomTooltip';
import {
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  Calendar as CalendarIcon,
  CalendarDays,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const areaColors = {
  fixed: '#6366f1',
  installments: '#f97316',
};

const CHART_COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  investment: '#3b82f6',
  savings: '#8b5cf6',
  credit: '#f59e0b',
  debit: '#06b6d4',
  pix: '#ec4899',
  cash: '#84cc16',
  purple: '#a855f7',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#f43f5e',
  emerald: '#10b981',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  orange: '#f97316',
  violet: '#8b5cf6',
  lime: '#84cc16',
  fuchsia: '#d946ef',
  slate: '#64748b',
};

const PAYMENT_METHOD_COLORS = {
  CREDIT_CARD: '#f59e0b',
  DEBIT_CARD: '#06b6d4',
  PIX: '#ec4899',
  CASH: '#84cc16',
  TRANSFER: '#8b5cf6',
};

export function Overview() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [showFullYear, setShowFullYear] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoadingInstallments, setLoadingInstallments] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [focusedLabel, setFocusedLabel] = useState<string | null>(null);

  const monthsToFetch = showFullYear ? 12 : 6;

  const {
    transactions,
    summary,
    projection,
    fetchTransactions,
    fetchSummary,
    fetchProjection,
    isLoading: isLoadingTransactions,
  } = useTransactions();

  const {
    incomes,
    totalIncome,
    fetchIncomes,
    fetchTotal,
    isLoading: isLoadingIncomes,
  } = useIncomes();

  const { summary: dashboardSummary, comparison } =
    useDashboard(selectedMonth, selectedYear);

  const overviewData = useDashboardOverview(selectedMonth, selectedYear);

  const {
    cards,
    goals,
    netWorth,
    investmentsSummary,
    paymentMethodAnalytics,
  } = overviewData;

  const paymentMethodsPieData = useMemo(() => {
    if (!paymentMethodAnalytics) return [];
    return paymentMethodAnalytics.byType.map((item) => ({
      name: getPaymentMethodTypeLabel(item.type),
      value: item.total,
      color: PAYMENT_METHOD_COLORS[item.type] || CHART_COLORS.slate,
    }));
  }, [paymentMethodAnalytics]);

  const cardsBarData = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return cards.map((card) => ({
      name: card.paymentMethodName.length > 12 
        ? card.paymentMethodName.substring(0, 12) + '...' 
        : card.paymentMethodName,
      limit: card.cardLimit,
      spent: card.totalSpentCurrentMonth,
      available: Math.max(0, card.cardLimit - card.totalSpentCurrentMonth),
    }));
  }, [cards]);

  const goalsProgressData = useMemo(() => {
    if (!goals || goals.length === 0) return [];
    return goals.map((goal) => ({
      name: goal.goalName.length > 15 
        ? goal.goalName.substring(0, 15) + '...' 
        : goal.goalName,
      progress: Math.min(goal.percentage, 100),
      target: goal.targetValue,
      current: goal.currentValue,
      color: goal.color || CHART_COLORS.indigo,
    }));
  }, [goals]);

  const investmentPieData = useMemo(() => {
    if (!investmentsSummary) return [];
    return [
      { name: 'Valor Atual', value: investmentsSummary.totalCurrentValue, color: CHART_COLORS.investment },
      { name: 'Total Investido', value: investmentsSummary.totalInvested, color: CHART_COLORS.savings },
      { name: 'Rendimentos', value: Math.max(0, investmentsSummary.totalYield), color: CHART_COLORS.income },
    ].filter(d => d.value > 0);
  }, [investmentsSummary]);

  const netWorthData = useMemo(() => {
    if (!netWorth) return null;
    return [
      { name: 'Caixas', value: netWorth.savingsBoxesTotal, color: CHART_COLORS.savings },
      { name: 'Investimentos', value: netWorth.investmentsTotal, color: CHART_COLORS.investment },
    ].filter(d => d.value > 0);
  }, [netWorth]);

  const loadInstallments = useCallback(async () => {
    setLoadingInstallments(true);
    try {
      const data = await installmentService.getUpcoming(monthsToFetch);
      setInstallments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInstallments(false);
    }
  }, [monthsToFetch]);

  const loadOverview = useCallback(async () => {
    setIsSyncing(true);
    try {
      const isYearView = showFullYear;
      
      await Promise.all([
        fetchTransactions(isYearView ? undefined : selectedMonth, isYearView ? undefined : selectedYear),
        fetchSummary(selectedMonth, selectedYear),
        fetchProjection(monthsToFetch),
        fetchIncomes(isYearView ? undefined : selectedMonth, isYearView ? undefined : selectedYear),
        fetchTotal(selectedMonth, selectedYear),
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
    loadInstallments,
    selectedMonth,
    selectedYear,
    monthsToFetch,
    showFullYear,
  ]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const netSalary = useMemo(() => {
    if (showFullYear) {
      return incomes.reduce((sum, income) => sum + Number(income.amount ?? 0), 0);
    }
    return totalIncome || 0;
  }, [showFullYear, incomes, totalIncome]);

  const totalExpenses = useMemo(() => {
    if (showFullYear) {
      return transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount ?? 0)), 0);
    }
    return summary?.totalExpense ?? 0;
  }, [showFullYear, transactions, summary]);

  const fixedExpenses = useMemo(
    () => transactions.filter((transaction) => transaction.isFixed),
    [transactions],
  );
  
  const fixedTotal = useMemo(() => {
    if (showFullYear) {
      return fixedExpenses.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
    }
    return fixedExpenses.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
  }, [showFullYear, fixedExpenses]);

  const installmentsTotal = useMemo(() => {
    if (showFullYear) {
      return installments.reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0);
    }
    return installments.reduce((sum, inst) => sum + Number(inst.amount ?? 0), 0);
  }, [showFullYear, installments]);

  const availableBalance = netSalary - totalExpenses;

  const totalsBarData = useMemo(
    () => [
      { label: 'Receitas', value: netSalary, color: '#22c55e', icon: 'arrow-up' },
      { label: 'Despesas', value: totalExpenses, color: '#ef4444', icon: 'arrow-down' },
      { label: 'Saldo', value: availableBalance, color: '#a855f7', icon: 'wallet' },
    ],
    [availableBalance, netSalary, totalExpenses],
  );

  const monthlyLineSeries = useMemo(() => {
    const monthlyData = new Map<string, { total: number; fixed: number; installments: number }>();
    
    transactions.forEach((t) => {
      const key = `${t.competenceYear}-${String(t.competenceMonth).padStart(2, '0')}`;
      const existing = monthlyData.get(key) || { total: 0, fixed: 0, installments: 0 };
      
      if (t.isInstallment) {
        existing.installments += Math.abs(Number(t.amount));
      } else if (t.isFixed) {
        existing.fixed += Math.abs(Number(t.amount));
      } else {
        existing.total += Math.abs(Number(t.amount));
      }
      
      monthlyData.set(key, existing);
    });
    
    installments.forEach((inst) => {
      const key = `${inst.dueYear}-${String(inst.dueMonth).padStart(2, '0')}`;
      const existing = monthlyData.get(key) || { total: 0, fixed: 0, installments: 0 };
      existing.installments += Math.abs(Number(inst.amount));
      monthlyData.set(key, existing);
    });

    const months = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, values]) => ({
        key,
        label: key.split('-')[1] + '/' + key.split('-')[0].slice(2),
        month: parseInt(key.split('-')[1]),
        year: parseInt(key.split('-')[0]),
        total: values.total + values.fixed + values.installments,
        fixed: values.fixed,
        installments: values.installments,
      }));

    if (showFullYear) {
      if (months.length === 0) {
        return [{
          key: `${selectedYear}-01`,
          label: 'Jan',
          month: 1,
          year: selectedYear,
          total: totalExpenses,
          fixed: fixedTotal,
          installments: installmentsTotal,
        }];
      }
      return months;
    }
    
    // Monthly view - show last 6 months of actual data
    if (months.length > 0) {
      return months.slice(-6);
    }
    
    // Fallback to current month
    return [
      {
        key: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
        label: formatMonthYear(selectedMonth, selectedYear).substring(0, 3),
        month: selectedMonth,
        year: selectedYear,
        total: totalExpenses,
        fixed: fixedTotal,
        installments: installmentsTotal,
      },
    ];
  }, [showFullYear, projection, transactions, installments, fixedTotal, installmentsTotal, totalExpenses, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!focusedLabel && monthlyLineSeries.length) {
      setFocusedLabel(monthlyLineSeries[0].key);
    }
  }, [focusedLabel, monthlyLineSeries]);

  const incomesTrend = useMemo(() => buildIncomeTrend(incomes), [incomes]);

  const expenseTrend = useMemo(() => monthlyLineSeries.map((item) => ({ label: item.label, value: item.total })), [
    monthlyLineSeries,
  ]);

  const balanceTrend = useMemo(
    () =>
      monthlyLineSeries.map((item) => ({
        label: item.label,
        value: Math.max(netSalary - item.total, 0),
      })),
    [monthlyLineSeries, netSalary],
  );

  const metricCards = [
    {
      title: 'Receitas',
      total: netSalary,
      series: incomesTrend.length ? incomesTrend : balanceTrend,
      color: '#22c55e',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: 'Despesas',
      total: totalExpenses,
      series: expenseTrend,
      color: '#ef4444',
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      title: 'Saldo',
      total: availableBalance,
      series: balanceTrend,
      color: '#a855f7',
      icon: <DollarSign className="h-4 w-4" />,
    },
  ];

  const pieData = useMemo(() => {
    if (!dashboardSummary) return [];
    return [
      { name: 'Receita', value: dashboardSummary.totalIncome, color: '#22c55e' },
      { name: 'Gastos', value: dashboardSummary.totalExpense, color: '#ef4444' },
      { name: 'Investimentos', value: dashboardSummary.totalInvestment, color: '#8b5cf6' },
    ].filter((d) => d.value > 0);
  }, [dashboardSummary]);

  const expensePieData = useMemo(() => {
    if (!dashboardSummary) return [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#84cc16'];
    return dashboardSummary.byCategory.map((cat, idx) => ({
      name: cat.categoryName,
      value: cat.total,
      color: colors[idx % colors.length],
    }));
  }, [dashboardSummary]);

  const savingsPieData = useMemo(() => {
    if (!dashboardSummary) return [];
    const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e'];
    return dashboardSummary.bySavingsBox.map((box, idx) => ({
      name: box.savingsBoxName,
      value: box.total,
      color: colors[idx % colors.length],
    }));
  }, [dashboardSummary]);

  const annualBarData = useMemo(() => {
    if (!comparison || comparison.length === 0) return [];
    return comparison.map((item) => ({
      month: item.monthName.substring(0, 3),
      receita: item.income,
      gastos: item.expense,
      investimento: item.investment,
    }));
  }, [comparison]);

  const transactionsTimeline = useMemo(() => groupTransactions(transactions), [transactions]);

  const alerts = useMemo(() => installments.slice(0, 4), [installments]);

  const drilldownPoint = useMemo(
    () => monthlyLineSeries.find((point) => point.key === focusedLabel),
    [focusedLabel, monthlyLineSeries],
  );

  const drilldownTransactions = useMemo(() => {
    if (!drilldownPoint) return [];
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.transactionDate);
        return date.getMonth() + 1 === drilldownPoint.month && date.getFullYear() === drilldownPoint.year;
      })
      .slice(0, 5);
  }, [drilldownPoint, transactions]);

  const drilldownSummary = useMemo(() => {
    if (!drilldownPoint) return null;
    const variable = Math.max(drilldownPoint.total - (drilldownPoint.fixed + drilldownPoint.installments), 0);
    return {
      label: drilldownPoint.label,
      total: drilldownPoint.total,
      fixed: drilldownPoint.fixed,
      installments: drilldownPoint.installments,
      variable,
    };
  }, [drilldownPoint]);

  const monthsOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const yearsOptions = Array.from({ length: 5 }, (_, index) => getCurrentYear() - 2 + index);

  const isLoading = isSyncing || isLoadingTransactions || isLoadingIncomes;

  const handleToggleInstallment = useCallback(
    async (installment: Installment) => {
      try {
        if (installment.isPaid) {
          await installmentService.markAsUnpaid(installment.id);
          toast.success('Parcela reaberta');
        } else {
          await installmentService.markAsPaid(installment.id);
          toast.success('Parcela quitada');
        }
        await loadInstallments();
      } catch (error) {
        console.error(error);
        toast.error('Não foi possível atualizar a parcela');
      }
    },
    [loadInstallments],
  );

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-card px-8 py-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Controle Financeiro</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="gap-2 rounded-full px-6" onClick={() => navigate('/entries')}>
              <Sparkles className="h-4 w-4" />
              Registrar lançamento
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <button
            onClick={() => setShowFullYear(!showFullYear)}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition ${
              showFullYear 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-background hover:bg-muted'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            {showFullYear ? `Ano ${selectedYear}` : 'Ver por mês'}
          </button>
          
          {!showFullYear && (
            <div className="flex items-center gap-2 rounded-2xl border bg-background px-3 py-2">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="bg-transparent outline-none"
              >
                {monthsOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthYear(month, selectedYear).split(' ')[0]}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="bg-transparent outline-none"
              >
                {yearsOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <p className="flex items-center gap-2 rounded-2xl border bg-background px-3 py-2">
            <TrendingUp className="h-4 w-4" />
            {showFullYear ? 'Visão anual' : 'Visão mensal'}
          </p>
        </div>
      </header>

      {isLoading && <DashboardSkeleton theme={theme} />}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => (
          <MetricSparkCard key={metric.title} {...metric} />
        ))}
      </section>

      <TotalsBarCard data={totalsBarData} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MonthlyLineCard
          data={monthlyLineSeries}
          theme={theme}
          onPointClick={(pointKey) => setFocusedLabel(pointKey)}
          focusedKey={focusedLabel}
        />
        <DrilldownPanel summary={drilldownSummary} transactions={drilldownTransactions} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ExpenseStackCard data={monthlyLineSeries} />
          
        </div>
        <div className="space-y-6">
          <TransactionsTimeline timeline={transactionsTimeline} />
          <UpcomingAlertsCard
            installments={alerts}
            isLoading={isLoadingInstallments}
            onToggle={handleToggleInstallment}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Distribuição Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum gasto no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Investimentos por Caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {savingsPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savingsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {savingsPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum investimento no período
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg shadow-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Comparativo Anual</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {annualBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualBarData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
                <Bar dataKey="investimento" name="Investimento" fill={CHART_COLORS.investment} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados para exibir
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {paymentMethodsPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodsPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Gastos com Cartões</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {cardsBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardsBarData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={60} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                  <Bar dataKey="spent" name="Gasto" fill={CHART_COLORS.credit} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="available" name="Disponível" fill={CHART_COLORS.income} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem cartões cadastrados
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Progresso das Metas</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {goalsProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsProgressData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={70} />
                  <Tooltip formatter={(value: number) => `${value}%`} {...chartTooltipStyle} />
                  <Bar dataKey="progress" name="Progresso" radius={[0, 4, 4, 0]}>
                    {goalsProgressData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem metas cadastradas
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Patrimônio</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {netWorthData && netWorthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={netWorthData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {netWorthData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados de patrimônio
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Resumo de Investimentos</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {investmentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investmentPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {investmentPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem investimentos cadastrados
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border bg-card/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Indicadores Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {investmentsSummary && (
              <>
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Atual</p>
                      <p className="text-lg font-semibold">{formatCurrency(investmentsSummary.totalCurrentValue)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-purple-100 p-2 dark:bg-purple-900/30">
                      <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investido</p>
                      <p className="text-lg font-semibold">{formatCurrency(investmentsSummary.totalInvested)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-100 p-2 dark:bg-green-900/30">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rendimentos</p>
                      <p className={`text-lg font-semibold ${investmentsSummary.totalYield >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {investmentsSummary.totalYield >= 0 ? '+' : ''}{formatCurrency(investmentsSummary.totalYield)} ({investmentsSummary.yieldPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {!investmentsSummary && (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados de investimentos
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type SparkSeries = { label: string; value: number }[];

type MonthlySeriesPoint = {
  key: string;
  label: string;
  month: number;
  year: number;
  total: number;
  fixed: number;
  installments: number;
};

function MetricSparkCard({
  title,
  total,
  series,
  color,
  icon,
}: {
  title: string;
  total: number;
  series: SparkSeries;
  color: string;
  icon: ReactNode;
}) {
  const gradientId = `spark-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const trend = getTrend(series);

  return (
    <Card className="group overflow-hidden rounded-3xl border bg-card/80 shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <CardTitle className="text-3xl font-semibold">{formatCurrency(total)}</CardTitle>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          {trend.direction === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          ) : trend.direction === 'down' ? (
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          ) : null}
          <span className={cn(trend.direction === 'down' ? 'text-rose-500' : 'text-emerald-500')}>
            {trend.value}
          </span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
        <div className="mt-4 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                {...chartTooltipStyle}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalsBarCard({ data }: { data: { label: string; value: number; color: string; icon: string }[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'arrow-up':
        return <ArrowUpCircle className="h-5 w-5" style={{ color }} />;
      case 'arrow-down':
        return <ArrowDownCircle className="h-5 w-5" style={{ color }} />;
      case 'wallet':
        return <Wallet className="h-5 w-5" style={{ color }} />;
      default:
        return <TrendingUp className="h-5 w-5" style={{ color }} />;
    }
  };
  
  return (
    <Card className="rounded-[28px] border bg-card/90 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" /> Resumo Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">Visão geral do período</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(item.icon, item.color)}
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: item.color }}>
                {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(Math.abs(item.value) / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DrilldownPanel({
  summary,
  transactions,
}: {
  summary: { label: string; total: number; fixed: number; installments: number; variable: number } | null;
  transactions: Transaction[];
}) {
  return (
    <Card className="rounded-[32px] border bg-card/90 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="h-5 w-5 text-primary" /> Drilldown do mês
        </CardTitle>
        <p className="text-sm text-muted-foreground">Resumo instantâneo ao clicar no gráfico</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <div className="rounded-3xl bg-muted/70 p-4 text-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span>Mês</span>
              <span>{summary.label}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-foreground">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{formatCurrency(summary.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Fixas</p>
                <p className="text-xl font-semibold text-sky-500">{formatCurrency(summary.fixed)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parcelas</p>
                <p className="text-xl font-semibold text-amber-500">{formatCurrency(summary.installments)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Variáveis</p>
                <p className="text-xl font-semibold text-emerald-500">{formatCurrency(summary.variable)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Clique em um mês para detalhar.
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Principais transações
          </p>
          {transactions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Sem registros disponíveis.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl border bg-muted/50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category?.name ?? 'Categoria indefinida'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'font-semibold',
                      transaction.amount >= 0 ? 'text-emerald-500' : 'text-rose-500',
                    )}
                  >
                    {transaction.amount >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyLineCard({
  data,
  theme,
  onPointClick,
  focusedKey,
}: {
  data: MonthlySeriesPoint[];
  theme: string;
  onPointClick: (key: string) => void;
  focusedKey: string | null;
}) {
  const stroke = theme === 'dark' ? '#94a3b8' : '#64748b';
  const yDomain = useMemo(() => {
    const values = data.flatMap((item) => [item.total, item.fixed, item.installments]);
    const max = Math.max(...values, 0);
    return [0, max === 0 ? 5000 : max * 1.1];
  }, [data]);

  return (
    <Card className="xl:col-span-2 rounded-[32px] border bg-card/90 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" /> Evolução mensal
          </CardTitle>
          <p className="text-sm text-muted-foreground">Tendência consolidada de gastos</p>
        </div>
        <div className="rounded-2xl bg-emerald-100/70 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          {data.length} pontos analisados
        </div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ left: 8, right: 12, top: 10, bottom: 4 }}
            onClick={(chart) => {
              const payload = chart?.activePayload?.[0]?.payload as MonthlySeriesPoint | undefined;
              if (payload) {
                onPointClick(payload.key);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.3)" />
            <XAxis dataKey="label" stroke={stroke} tickLine={false} axisLine={false} />
            <YAxis
              stroke={stroke}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              width={40}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              {...chartTooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={(props) => (
                <circle
                  {...props}
                  r={props.payload.key === focusedKey ? 6 : 4}
                  fill={props.payload.key === focusedKey ? '#fbbf24' : '#7c3aed'}
                  stroke="#fff"
                  strokeWidth={props.payload.key === focusedKey ? 2 : 1}
                />
              )}
            />
            <Line type="monotone" dataKey="fixed" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="installments" stroke="#f97316" strokeWidth={2} strokeDasharray="2 8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ExpenseStackCard({ data }: { data: { label: string; fixed: number; installments: number }[] }) {
  return (
    <Card className="rounded-[28px] border bg-card/90">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" /> Composição de compromissos
          </CardTitle>
          <p className="text-sm text-muted-foreground">Parcelas x fixas por mês</p>
        </div>
        <span className="text-sm text-muted-foreground">Atualizado automaticamente</span>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fixedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColors.fixed} stopOpacity={0.4} />
                <stop offset="95%" stopColor={areaColors.fixed} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="installmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={areaColors.installments} stopOpacity={0.4} />
                <stop offset="95%" stopColor={areaColors.installments} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
            <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              {...chartTooltipStyle}
            />
            <Area type="monotone" dataKey="fixed" stroke={areaColors.fixed} fill="url(#fixedGradient)" />
            <Area type="monotone" dataKey="installments" stroke={areaColors.installments} fill="url(#installmentGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TransactionsTimeline({ timeline }: { timeline: [string, Transaction[]][] }) {
  return (
    <Card className="rounded-[28px] border bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" /> Transações recentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">Separadas por data com status</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            Sem transações encontradas para o período.
          </div>
        ) : (
          timeline.map(([date, items]) => (
            <div key={date}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{date}</p>
              <div className="mt-2 space-y-3">
                {items.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 rounded-2xl border bg-muted/40 px-3 py-3 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-2xl text-white',
                        transaction.amount >= 0 ? 'bg-emerald-500/80' : 'bg-rose-500/80',
                      )}
                    >
                      {transaction.amount >= 0 ? '+' : '-'}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="font-semibold text-foreground">{transaction.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.category?.name || 'Categoria não definida'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-semibold',
                          transaction.amount >= 0 ? 'text-emerald-500' : 'text-rose-500',
                        )}
                      >
                        {transaction.amount >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {transaction.amount >= 0 ? 'Revenue' : transaction.isFixed ? 'Fixed' : 'Debit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingAlertsCard({
  installments,
  isLoading,
  onToggle,
}: {
  installments: Installment[];
  isLoading: boolean;
  onToggle: (installment: Installment) => Promise<void>;
}) {
  return (
    <Card className="rounded-[28px] border bg-card/90">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5 text-primary" /> Parcelas próximas
          </CardTitle>
          <p className="text-sm text-muted-foreground">Alertas de vencimento</p>
        </div>
        {isLoading && <span className="text-xs text-muted-foreground">Atualizando...</span>}
      </CardHeader>
      <CardContent className="space-y-3">
        {installments.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Sem parcelas previstas.
          </div>
        ) : (
          installments.map((installment) => {
            const dueLabel = `${String(installment.dueMonth).padStart(2, '0')}/${installment.dueYear}`;
            const status = getInstallmentStatus(installment);
            return (
              <div
                key={installment.id}
                className="flex items-center gap-3 rounded-2xl border bg-muted/40 px-4 py-3"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl text-white',
                    status === 'overdue'
                      ? 'bg-rose-500/80'
                      : status === 'due'
                      ? 'bg-amber-500/80'
                      : 'bg-emerald-500/80',
                  )}
                >
                  <BellRing className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-semibold text-foreground">{installment.transaction?.description || 'Parcela'}</span>
                  <span className="text-xs text-muted-foreground">Vencimento: {dueLabel}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(installment.amount))}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{statusLabel(status)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => onToggle(installment)}
                >
                  {installment.isPaid ? 'Reabrir' : 'Quitar'}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton({ theme }: { theme: string }) {
  const baseClass = 'animate-pulse rounded-3xl border px-4 py-6';
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={`${baseClass} ${theme === 'dark' ? 'bg-muted/40' : 'bg-muted/60'}`}></div>
      <div className={`${baseClass} ${theme === 'dark' ? 'bg-muted/40' : 'bg-muted/60'}`}></div>
    </div>
  );
}

function getTrend(series: SparkSeries) {
  if (series.length < 2) {
    return { direction: 'neutral', value: '—' } as const;
  }
  const first = series[0].value;
  const last = series[series.length - 1].value;
  if (first === 0) {
    return { direction: 'neutral', value: '+0%' } as const;
  }
  const diff = ((last - first) / Math.abs(first)) * 100;
  const formatted = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  if (diff > 0) return { direction: 'up' as const, value: formatted };
  if (diff < 0) return { direction: 'down' as const, value: formatted };
  return { direction: 'neutral' as const, value: formatted };
}

function buildIncomeTrend(incomes: Income[]) {
  if (!incomes.length) return [] as SparkSeries;
  const map = new Map<string, number>();
  incomes.forEach((income) => {
    const key = `${income.year}-${String(income.month).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + Number(income.amount));
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([key, value]) => ({
      label: formatMonthLabel(key),
      value,
    }));
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function groupTransactions(transactions: Transaction[]): [string, Transaction[]][] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
  );
  const limited = sorted.slice(0, 10);
  const map = new Map<string, Transaction[]>();
  limited.forEach((transaction) => {
    const label = new Date(transaction.transactionDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    const key = label.replace('.', '');
    const list = map.get(key) ?? [];
    list.push(transaction);
    map.set(key, list);
  });
  return Array.from(map.entries());
}

function getInstallmentStatus(installment: Installment) {
  const today = new Date();
  const dueDate = new Date(installment.dueYear, installment.dueMonth - 1);
  if (installment.isPaid) return 'paid' as const;
  if (dueDate.getFullYear() < today.getFullYear() ||
    (dueDate.getFullYear() === today.getFullYear() && dueDate.getMonth() < today.getMonth())) {
    return 'overdue' as const;
  }
  if (dueDate.getFullYear() === today.getFullYear() && dueDate.getMonth() === today.getMonth()) {
    return 'due' as const;
  }
  return 'upcoming' as const;
}

function statusLabel(status: ReturnType<typeof getInstallmentStatus>) {
  switch (status) {
    case 'paid':
      return 'Pago';
    case 'overdue':
      return 'Em atraso';
    case 'due':
      return 'Vence este mês';
    default:
      return 'Próxima parcela';
  }
}

function getPaymentMethodTypeLabel(type: string): string {
  switch (type) {
    case 'CREDIT_CARD':
      return 'Crédito';
    case 'DEBIT_CARD':
      return 'Débito';
    case 'PIX':
      return 'PIX';
    case 'CASH':
      return 'Dinheiro';
    case 'TRANSFER':
      return 'Transferência';
    default:
      return type;
  }
}
