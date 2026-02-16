import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { ProjectionData } from '@/types';

// ============================================
// COMPONENTE: GRÁFICO DE PROJEÇÃO
// Mostra a projeção de gastos para os próximos meses
// ============================================

interface ProjectionChartProps {
  data: ProjectionData[];
}

interface ChartDataPoint {
  name: string;
  parcelas: number;
  fixas: number;
  total: number;
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const chartData: ChartDataPoint[] = data.map((item) => ({
    name: item.monthName.substring(0, 3),
    parcelas: item.installmentTotal,
    fixas: item.fixedTotal,
    total: item.total,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg border p-3 shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--card-foreground))',
          }}
        >
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Projeção de Gastos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Próximos {data.length} meses
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="parcelas"
                name="Parcelas"
                stackId="a"
                fill="#f97316"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="fixas"
                name="Contas Fixas"
                stackId="a"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-orange-500/10 p-3 text-center">
            <p className="mb-1 text-xs text-orange-500">Total Parcelas</p>
            <p className="text-sm font-semibold text-orange-600">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.installmentTotal, 0) / data.length
              )}
            </p>
            <p className="text-xs text-orange-500/80">média/mês</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3 text-center">
            <p className="mb-1 text-xs text-blue-500">Total Fixas</p>
            <p className="text-sm font-semibold text-blue-600">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.fixedTotal, 0) / data.length
              )}
            </p>
            <p className="text-xs text-blue-500/80">média/mês</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
            <p className="mb-1 text-xs text-emerald-500">Total Geral</p>
            <p className="text-sm font-semibold text-emerald-600">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.total, 0) / data.length
              )}
            </p>
            <p className="text-xs text-emerald-500/80">média/mês</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
