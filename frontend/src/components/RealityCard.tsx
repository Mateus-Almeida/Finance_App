import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

// ============================================
// COMPONENTE: CARD DE REALIDADE
// Mostra o saldo real disponível após compromissos
// ============================================

interface RealityCardProps {
  netSalary: number;
  installmentsTotal: number;
  fixedTotal: number;
  availableBalance: number;
  pendingInstallmentsCount: number;
  percentageCommitted: number;
  percentageAvailable: number;
}

export function RealityCard({
  netSalary,
  installmentsTotal,
  fixedTotal,
  availableBalance,
  pendingInstallmentsCount,
  percentageCommitted,
  percentageAvailable,
}: RealityCardProps) {
  const totalCommitments = installmentsTotal + fixedTotal;
  const isPositive = availableBalance >= 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Card de Realidade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          O que você realmente pode gastar este mês
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saldo Disponível Real */}
        <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Saldo Disponível Real</p>
          <p className={`text-4xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(availableBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            de {formatCurrency(netSalary)} de salário líquido
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comprometido</span>
            <span className="font-medium">{percentageCommitted.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-orange-500"
              style={{ width: `${(installmentsTotal / netSalary) * 100}%` }}
            />
            <div
              className="h-full bg-blue-500"
              style={{ width: `${(fixedTotal / netSalary) * 100}%` }}
            />
            <div
              className="h-full bg-green-500"
              style={{ width: `${(availableBalance / netSalary) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Parcelas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Fixas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Livre</span>
            </div>
          </div>
        </div>

        {/* Detalhamento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Parcelas</span>
            </div>
            <p className="text-lg font-semibold text-orange-700">
              {formatCurrency(installmentsTotal)}
            </p>
            <p className="text-xs text-orange-600">
              {pendingInstallmentsCount} parcelas pendentes
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Contas Fixas</span>
            </div>
            <p className="text-lg font-semibold text-blue-700">
              {formatCurrency(fixedTotal)}
            </p>
            <p className="text-xs text-blue-600">Mensalidades</p>
          </div>
        </div>

        {/* Total Comprometido */}
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Total Comprometido</span>
          </div>
          <p className="text-lg font-semibold text-gray-700">
            {formatCurrency(totalCommitments)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
