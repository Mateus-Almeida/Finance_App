import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Calendar,
  User 
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
import { RealityCardData, CategoryType } from '@/types';

// ============================================
// PÁGINA: DASHBOARD PRINCIPAL
// ============================================

export function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();
  
  const [currentMonth] = useState(getCurrentMonth());
  const [currentYear] = useState(getCurrentYear());
  const [netSalary, setNetSalary] = useState(5000); // Valor padrão, pode ser editado
  
  const { 
    summary, 
    projection, 
    isLoading: isLoadingTransactions,
    fetchSummary, 
    fetchProjection 
  } = useTransactions();
  
  const { 
    totalIncome, 
    fetchTotal 
  } = useIncomes();
  
  const { categories } = useCategories();

  // Calcula os dados do Card de Realidade
  const realityData: RealityCardData = {
    netSalary: totalIncome || netSalary,
    installmentsTotal: projection[0]?.installmentTotal || 0,
    fixedTotal: projection[0]?.fixedTotal || 0,
    availableBalance: (totalIncome || netSalary) - (projection[0]?.total || 0),
    pendingInstallmentsCount: projection[0]?.installments.length || 0,
    percentageCommitted: parseFloat((((projection[0]?.total || 0) / (totalIncome || netSalary)) * 100).toFixed(2)),
    percentageAvailable: parseFloat((((totalIncome || netSalary) - (projection[0]?.total || 0)) / (totalIncome || netSalary) * 100).toFixed(2)),
  };

  useEffect(() => {
    fetchSummary(currentMonth, currentYear);
    fetchProjection(6);
    fetchTotal(currentMonth, currentYear);
  }, [fetchSummary, fetchProjection, fetchTotal, currentMonth, currentYear]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  if (isLoadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
                <p className="text-xs text-gray-500">{formatMonthYear(currentMonth, currentYear)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renda Líquida</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalIncome || netSalary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Gastos</p>
                  <p className="text-lg font-semibold">{formatCurrency(summary?.total || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parcelas</p>
                  <p className="text-lg font-semibold">{realityData.pendingInstallmentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${realityData.availableBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Wallet className={`h-5 w-5 ${realityData.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saldo Real</p>
                  <p className={`text-lg font-semibold ${realityData.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(realityData.availableBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card de Realidade */}
          <RealityCard
            netSalary={realityData.netSalary}
            installmentsTotal={realityData.installmentsTotal}
            fixedTotal={realityData.fixedTotal}
            availableBalance={realityData.availableBalance}
            pendingInstallmentsCount={realityData.pendingInstallmentsCount}
            percentageCommitted={realityData.percentageCommitted}
            percentageAvailable={realityData.percentageAvailable}
          />

          {/* Visão 50/30/20 */}
          {summary && (
            <FiftyThirtyTwenty
              essential={summary.essential}
              lifestyle={summary.lifestyle}
              debtsInvestments={summary.debtsInvestments}
              total={summary.total}
              netIncome={totalIncome || netSalary}
            />
          )}
        </div>

        {/* Projeção de Gastos */}
        {projection.length > 0 && (
          <div className="mb-8">
            <ProjectionChart data={projection} />
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="flex flex-wrap gap-4">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Renda
          </Button>
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Ver Parcelas
          </Button>
        </div>
      </main>
    </div>
  );
}
