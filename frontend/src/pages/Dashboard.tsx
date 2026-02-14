import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

const palette = ['#7c3aed', '#06b6d4', '#10b981', '#f97316'];
const sparkColors = {
  income: '#7c3aed',
  expense: '#f97316',
  invest: '#06b6d4',
  balance: '#10b981',
};

const baseTransactions = [
  {
    id: 'tx-1',
    date: '23 Out',
    label: 'Spotify Family',
    type: 'Debit',
    amount: -34.9,
  },
  { id: 'tx-2', date: '23 Out', label: 'Salário CLT', type: 'Revenue', amount: 4200 },
  { id: 'tx-3', date: '22 Out', label: 'C6 Invest', type: 'Investment', amount: -600 },
  { id: 'tx-4', date: '22 Out', label: 'Despesa Cartão', type: 'Debit', amount: -980.75 },
  { id: 'tx-5', date: '21 Out', label: 'Freelancer', type: 'Revenue', amount: 1800 },
];

const lineData = [
  { month: 'Jan', value: 5400 },
  { month: 'Fev', value: 4900 },
  { month: 'Mar', value: 5800 },
  { month: 'Abr', value: 6200 },
  { month: 'Mai', value: 6100 },
  { month: 'Jun', value: 6500 },
];

const sparkIncome = [4.2, 4.5, 4.9, 5.1, 5.2, 5.4];
const sparkExpense = [2.1, 2.3, 2.2, 2.5, 2.7, 2.6];
const sparkInvest = [0.8, 1.0, 0.9, 1.2, 1.1, 1.4];
const sparkBalance = [1.3, 1.4, 1.8, 1.5, 1.9, 2.2];

const donutData = [
  { name: 'Receita', value: 5800 },
  { name: 'Despesa', value: 2900 },
  { name: 'Investimento', value: 1100 },
  { name: 'Poupança', value: 800 },
];

const periods = ['Day', 'Week', 'Month', 'Year'];

export default function Dashboard() {
  const [period, setPeriod] = useState('Month');
  const transactions = useMemo(() => baseTransactions, []);
  const lineTotals = useMemo(
    () => ({
      total: lineData[lineData.length - 1].value,
      trend: '+8,7%',
    }),
    [],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-4 rounded-2xl border bg-gradient-to-br from-muted/60 via-card/70 to-card p-5 shadow-lg shadow-primary/5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Overview</p>
          <h1 className="text-2xl font-semibold text-foreground">Controle Financeiro Premium</h1>
          <p className="text-sm text-muted-foreground">
            Visualize receita, despesas, investimentos e saldo em um painel único.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-full border bg-background p-1 text-xs font-medium shadow-inner">
            {periods.map((label) => (
              <button
                key={label}
                onClick={() => setPeriod(label)}
                className={cn(
                  'rounded-full px-3 py-1 transition-all',
                  period === label
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button className="rounded-full shadow-lg shadow-primary/40">Nova Transação</Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1 bg-gradient-to-b from-card to-muted/40">
          <CardHeader>
            <CardTitle>Distribuição mensal</CardTitle>
            <p className="text-sm text-muted-foreground">Receita vs Despesa vs Investimento</p>
          </CardHeader>
          <CardContent className="flex h-[320px] flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
                  cornerRadius={8}
                >
                  {donutData.map((_, index) => (
                    <Cell key={index} fill={palette[index % palette.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo real</p>
              <p className="text-3xl font-semibold">{formatCurrency(6200)}</p>
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-4 text-sm">
              {donutData.map((segment, index) => (
                <div key={segment.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: palette[index % palette.length] }}
                  />
                  <span className="text-muted-foreground">{segment.name}</span>
                  <span className="ml-auto font-semibold">{formatCurrency(segment.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Performance mensal</CardTitle>
              <p className="text-sm text-muted-foreground">Evolução consolidada</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500">Tendência</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(lineTotals.total)}{' '}
                <span className="text-sm text-emerald-500">{lineTotals.trend}</span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.3)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SparkCard
          title="Receita"
          total={formatCurrency(7200)}
          trend="+14%"
          color={sparkColors.income}
          data={sparkIncome}
        />
        <SparkCard
          title="Despesa"
          total={formatCurrency(3200)}
          trend="-4%"
          color={sparkColors.expense}
          data={sparkExpense}
        />
        <SparkCard
          title="Investimentos"
          total={formatCurrency(1200)}
          trend="+9%"
          color={sparkColors.invest}
          data={sparkInvest}
        />
        <SparkCard
          title="Saldo disponível"
          total={formatCurrency(2100)}
          trend="+12%"
          color={sparkColors.balance}
          data={sparkBalance}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 bg-card/95">
          <CardHeader>
            <CardTitle>Gastos por período</CardTitle>
            <p className="text-sm text-muted-foreground">Despesas fixas vs variáveis</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVariable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.3)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#colorFixed)" />
                <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#colorVariable)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
              
        <Card className="col-span-1 bg-card/95">
          <CardHeader>
            <CardTitle>Transações recentes</CardTitle>
            <p className="text-sm text-muted-foreground">Atualizado automaticamente</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-2xl border bg-muted/40 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-muted"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{transaction.date}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      transaction.type === 'Revenue'
                        ? 'bg-emerald-100 text-emerald-700'
                        : transaction.type === 'Investment'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-rose-100 text-rose-700',
                    )}
                  >
                    {transaction.type}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{transaction.label}</p>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      transaction.amount >= 0 ? 'text-emerald-500' : 'text-rose-500',
                    )}
                  >
                    {transaction.amount >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SparkCard({
  title,
  total,
  trend,
  color,
  data,
}: {
  title: string;
  total: string;
  trend: string;
  color: string;
  data: number[];
}) {
  const chartData = data.map((value, index) => ({ idx: index, value }));
  return (
    <Card className="bg-card/80 shadow-lg shadow-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>{title}</p>
          <span className={cn('text-xs font-semibold', trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500')}>
            {trend}
          </span>
        </div>
        <CardTitle className="text-3xl">{total}</CardTitle>
      </CardHeader>
      <CardContent className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              formatter={(value: number) => formatCurrency(value * 1000)}
              contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#spark-${title})`}
              className="duration-300"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
