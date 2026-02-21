import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { 
  investmentsService, 
  InvestmentAsset, 
  InvestmentSummary, 
  NetWorthData, 
  EvolutionData 
} from '@/services/investments.service';
import { InvestmentType } from '@/types';

const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  [InvestmentType.CDB]: 'CDB',
  [InvestmentType.STOCK]: 'Ação',
  [InvestmentType.CRYPTO]: 'Cripto',
  [InvestmentType.TREASURY]: 'Tesouro',
  [InvestmentType.FUND]: 'Fundo',
  [InvestmentType.OTHER]: 'Outro',
};

const INVESTMENT_TYPE_ICONS: Record<InvestmentType, string> = {
  [InvestmentType.CDB]: '🏦',
  [InvestmentType.STOCK]: '📈',
  [InvestmentType.CRYPTO]: '🪙',
  [InvestmentType.TREASURY]: '📜',
  [InvestmentType.FUND]: '📊',
  [InvestmentType.OTHER]: '💰',
};

export function InvestmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: InvestmentType.OTHER,
    institution: '',
    initialValue: 0,
    monthlyContribution: 0,
    color: '#10b981',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsData, summaryData, netWorthData, evolutionData] = await Promise.all([
        investmentsService.getAssets(),
        investmentsService.getSummary(),
        investmentsService.getNetWorth(),
        investmentsService.getEvolution(12),
      ]);
      setAssets(assetsData);
      setSummary(summaryData);
      setNetWorth(netWorthData);
      setEvolution(evolutionData);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (form.initialValue <= 0) {
      toast.error('Valor inicial deve ser maior que zero');
      return;
    }

    try {
      setSaving(true);
      await investmentsService.createAsset(form);
      toast.success('Ativo criado');
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar ativo');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: InvestmentType.OTHER,
      institution: '',
      initialValue: 0,
      monthlyContribution: 0,
      color: '#10b981',
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Investimentos</h1>
          <p className="text-muted-foreground">Gerencie seus ativos e patrimônio</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Novo Ativo</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Patrimônio Total</p>
            <p className="text-2xl font-bold">{formatCurrency(netWorth?.netWorth || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Investido</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalInvested || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Valor Atual</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalCurrentValue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Rendimento</p>
            <p className={`text-2xl font-bold ${(summary?.totalYield || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(summary?.totalYield || 0)} ({summary?.yieldPercent?.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Patrimônio</CardTitle>
          </CardHeader>
          <CardContent>
            {evolution.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {evolution.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">{e.monthName}/{e.year}</span>
                    <span className="font-medium">{formatCurrency(e.netWorth)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição do Patrimônio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-sm">Caixas de Investimento</span>
                </div>
                <span className="font-medium">{formatCurrency(netWorth?.savingsBoxesTotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm">Ativos de Investimento</span>
                </div>
                <span className="font-medium">{formatCurrency(netWorth?.investmentsTotal || 0)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatCurrency(netWorth?.netWorth || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ativos de Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
                const yield_ = asset.currentValue - asset.initialValue;
                const yieldPercent = asset.initialValue > 0 ? (yield_ / asset.initialValue) * 100 : 0;
                
                return (
                  <div key={asset.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{INVESTMENT_TYPE_ICONS[asset.type]}</span>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {INVESTMENT_TYPE_LABELS[asset.type]}
                            {asset.institution && ` - ${asset.institution}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investido:</span>
                        <span>{formatCurrency(asset.initialValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Atual:</span>
                        <span>{formatCurrency(asset.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rendimento:</span>
                        <span className={yield_ >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(yield_)} ({yieldPercent.toFixed(1)}%)
                        </span>
                      </div>
                      {asset.monthlyContribution && asset.monthlyContribution > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aporte mensal:</span>
                          <span>{formatCurrency(asset.monthlyContribution)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Ativo de Investimento"
        footer={
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : 'Criar'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Tesouro Direto 2029"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}
            >
              {Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {INVESTMENT_TYPE_ICONS[value as InvestmentType]} {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Instituição</Label>
            <Input
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="Ex: NuInvest, Tesouro Direto"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor Inicial</Label>
            <Input
              type="number"
              value={form.initialValue || ''}
              onChange={(e) => setForm({ ...form, initialValue: Number(e.target.value) })}
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <Label>Aporte Mensal (opcional)</Label>
            <Input
              type="number"
              value={form.monthlyContribution || ''}
              onChange={(e) => setForm({ ...form, monthlyContribution: Number(e.target.value) })}
              placeholder="500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
