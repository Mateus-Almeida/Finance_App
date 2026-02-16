import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { Transaction } from '@/types';
import { chartTooltipStyle } from './CustomTooltip';

interface SpendingTrendChartProps {
  transactions: Transaction[];
}

export function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  const points = aggregateTransactions(transactions);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tendência de gastos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolução diária das despesas fixas e variáveis.
        </p>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$ ')}
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Line
              type="monotone"
              dataKey="fixed"
              name="Fixas"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="variable"
              name="Variáveis"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function aggregateTransactions(transactions: Transaction[]) {
  const map = new Map<
    string,
    {
      fixed: number;
      variable: number;
    }
  >();
  transactions.forEach((transaction) => {
    const date = new Date(transaction.transactionDate);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    const current = map.get(key) ?? { fixed: 0, variable: 0 };
    if (transaction.isFixed) {
      current.fixed += Number(transaction.amount);
    } else {
      current.variable += Number(transaction.amount);
    }
    map.set(key, current);
  });

  return Array.from(map.entries()).map(([label, values]) => ({
    label,
    ...values,
  }));
}
