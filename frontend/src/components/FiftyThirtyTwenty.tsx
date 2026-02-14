import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Home, Coffee, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { CategoryType } from '@/types';

// ============================================
// COMPONENTE: VISÃO 50/30/20
// Mostra a distribuição dos gastos segundo a regra 50/30/20
// ============================================

interface FiftyThirtyTwentyProps {
  essential: {
    total: number;
    percentage: number;
  };
  lifestyle: {
    total: number;
    percentage: number;
  };
  debtsInvestments: {
    total: number;
    percentage: number;
  };
  total: number;
  netIncome: number;
}

interface CategoryBoxProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  amount: number;
  percentage: number;
  targetPercentage: number;
  color: string;
  bgColor: string;
}

function CategoryBox({
  icon,
  title,
  subtitle,
  amount,
  percentage,
  targetPercentage,
  color,
  bgColor,
}: CategoryBoxProps) {
  const isOverBudget = percentage > targetPercentage + 5;
  const isOnTrack = percentage <= targetPercentage + 5 && percentage >= targetPercentage - 5;

  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {isOverBudget ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : isOnTrack ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(amount)}
          </span>
          <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="space-y-1">
          <Progress
            value={percentage}
            max={targetPercentage * 1.5}
            className={`h-2 ${isOverBudget ? 'bg-red-200' : ''}`}
          />
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Meta: {targetPercentage}%</span>
            <span className={`${isOverBudget ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {isOverBudget ? 'Acima da meta' : isOnTrack ? 'Dentro da meta' : 'Abaixo da meta'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FiftyThirtyTwenty({
  essential,
  lifestyle,
  debtsInvestments,
  total,
  netIncome,
}: FiftyThirtyTwentyProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Visão 50/30/20
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição ideal dos seus gastos
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categoria 50% - Essencial */}
        <CategoryBox
          icon={<Home className="h-5 w-5 text-white" />}
          title="Essencial"
          subtitle="50% - Necessidades básicas"
          amount={essential.total}
          percentage={essential.percentage}
          targetPercentage={50}
          color="bg-red-500"
          bgColor="bg-red-50"
        />

        {/* Categoria 30% - Estilo de Vida */}
        <CategoryBox
          icon={<Coffee className="h-5 w-5 text-white" />}
          title="Estilo de Vida"
          subtitle="30% - Lazer e desejos"
          amount={lifestyle.total}
          percentage={lifestyle.percentage}
          targetPercentage={30}
          color="bg-pink-500"
          bgColor="bg-pink-50"
        />

        {/* Categoria 20% - Dívidas/Investimentos */}
        <CategoryBox
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          title="Dívidas & Investimentos"
          subtitle="20% - Futuro financeiro"
          amount={debtsInvestments.total}
          percentage={debtsInvestments.percentage}
          targetPercentage={20}
          color="bg-green-500"
          bgColor="bg-green-50"
        />

        {/* Resumo */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total de Gastos</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">Renda Líquida</span>
            <span className="text-lg font-semibold">{formatCurrency(netIncome)}</span>
          </div>
          {total > netIncome && (
            <div className="mt-3 p-3 bg-red-100 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">
                Seus gastos ultrapassam sua renda em {formatCurrency(total - netIncome)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
