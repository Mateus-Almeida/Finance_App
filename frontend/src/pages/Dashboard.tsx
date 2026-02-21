import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';
import { chartTooltipStyle } from '@/components/charts/CustomTooltip';
import { useDashboard } from '@/hooks/useDashboard';

const COLORS = {
  income: '#10b981',
  expense: '#f97316',
  investment: '#3b82f6',
  savings: '#8b5cf6',
};

const EXPENSE_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#6b7280',
];

const SAVINGS_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444',
];

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { summary, comparison, evolution, savingsBoxes, totalSavings, loading } =
    useDashboard(selectedMonth, selectedYear);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Receita', value: summary.totalIncome, color: COLORS.income },
      { name: 'Gastos', value: summary.totalExpense, color: COLORS.expense },
      { name: 'Investimentos', value: summary.totalInvestment, color: COLORS.investment },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const expensePieData = useMemo(() => {
    if (!summary) return [];
    return summary.byCategory.map((cat, idx) => ({
      name: cat.categoryName,
      value: cat.total,
      color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
    }));
  }, [summary]);

  const savingsPieData = useMemo(() => {
    if (!summary) return [];
    return summary.bySavingsBox.map((box, idx) => ({
      name: box.savingsBoxName,
      value: box.total,
      color: SAVINGS_COLORS[idx % SAVINGS_COLORS.length],
    }));
  }, [summary]);

  const barData = useMemo(() => {
    return comparison;
  }, [comparison]);

  const lineData = useMemo(() => {
    return evolution;
  }, [evolution]);

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
      <header className="flex flex-wrap items-center gap-4 rounded-2xl border bg-gradient-to-br from-muted/60 via-card/70 to-card p-5 shadow-lg shadow-primary/5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Dashboard</p>
          <h1 className="text-2xl font-semibold text-foreground">Controle Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button className="rounded-full shadow-lg shadow-primary/40">
            Nova Transação
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Receita"
          value={summary?.totalIncome || 0}
          color={COLORS.income}
        />
        <SummaryCard
          title="Gastos"
          value={summary?.totalExpense || 0}
          color={COLORS.expense}
        />
        <SummaryCard
          title="Investimentos"
          value={summary?.totalInvestment || 0}
          color={COLORS.investment}
        />
        <SummaryCard
          title="Saldo"
          value={summary?.balance || 0}
          color={summary?.balance && summary.balance >= 0 ? COLORS.income : COLORS.expense}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.3)" />
                <XAxis dataKey="monthName" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                <Legend />
                <Bar dataKey="income" name="Receita" fill={COLORS.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Gastos" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
                <Bar dataKey="investment" name="Investimento" fill={COLORS.investment} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum gasto no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimentos por Caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {savingsPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savingsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {savingsPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum investimento no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.3)" />
              <XAxis dataKey="monthName" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} {...chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke={COLORS.savings}
                strokeWidth={3}
                dot={{ r: 4, fill: COLORS.savings }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Caixas de Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            {savingsBoxes.length > 0 ? (
              <div className="space-y-3">
                {savingsBoxes.map((box) => (
                  <div
                    key={box.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full"
                        style={{ backgroundColor: box.color }}
                      />
                      <div>
                        <p className="font-medium">{box.name}</p>
                        {box.goal && (
                          <p className="text-sm text-muted-foreground">
                            Meta: {formatCurrency(box.goal)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(box.balance)}</p>
                      {box.goal && (
                        <p className="text-sm text-muted-foreground">
                          {((box.balance / box.goal) * 100).toFixed(0)}% da meta
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Nenhum caixa de investimento cadastrado
              </p>
            )}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Total investido</p>
                <p className="text-xl font-bold" style={{ color: COLORS.savings }}>
                  {formatCurrency(totalSavings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cartão de Crédito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-4 text-white">
              <p className="text-sm opacity-80">Fatura atual</p>
              <p className="text-2xl font-bold">R$ 2.450,00</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="opacity-80">Limite: R$ 5.000</span>
                <span className="opacity-80">49%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/30">
                <div className="h-full w-[49%] rounded-full bg-white"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Limite utilizado</span>
                <span className="font-medium">R$ 2.450,00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Limite disponível</span>
                <span className="font-medium">R$ 2.550,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const isPositive = value >= 0;
  
  return (
    <Card className="bg-card/80 shadow-lg shadow-primary/5">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent>
        <p
          className="text-2xl font-bold"
          style={{ color: title === 'Saldo' ? (isPositive ? color : '#ef4444') : color }}
        >
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}
