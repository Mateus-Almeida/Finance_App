import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/format';
import { chartTooltipStyle } from './CustomTooltip';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

interface ExpensesPieChartProps {
  transactions: Transaction[];
}

export function ExpensesPieChart({ transactions }: ExpensesPieChartProps) {
  const data = aggregateByCategory(transactions);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribuição por categoria</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mostra quais categorias estão consumindo seu orçamento.
        </p>
      </CardHeader>
      <CardContent className="flex h-80 flex-col items-center justify-center">
        {data.length === 0 ? (
          <p className="text-muted-foreground">Cadastre transações para ver esta visão.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                {...chartTooltipStyle}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function aggregateByCategory(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  transactions.forEach((transaction) => {
    const category = transaction.category?.name ?? 'Outros';
    const current = totals.get(category) ?? 0;
    totals.set(category, current + Number(transaction.amount));
  });
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}
