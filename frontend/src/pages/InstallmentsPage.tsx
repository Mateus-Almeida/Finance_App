import { useCallback, useEffect, useState } from 'react';
import { installmentService } from '@/services/installment.service';
import { Installment } from '@/types';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInstallments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, upcoming] = await Promise.all([
        installmentService.getPending(),
        installmentService.getUpcoming(20),
      ]);
      setInstallments([...pending, ...upcoming]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstallments();
  }, [loadInstallments]);

  const togglePayment = async (installment: Installment) => {
    try {
      if (installment.isPaid) {
        await installmentService.markAsUnpaid(installment.id);
        toast.success('Parcela marcada como pendente');
      } else {
        await installmentService.markAsPaid(installment.id);
        toast.success('Parcela paga');
      }
      await loadInstallments();
    } catch (error) {
      toast.error('Não foi possível atualizar a parcela');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Controle de Parcelas</h2>
        <Button variant="outline" onClick={loadInstallments} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>
      <div className="overflow-auto rounded-2xl border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : installments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma parcela cadastrada.
                </td>
              </tr>
            ) : (
              installments.map((installment) => (
                <tr key={installment.id} className="border-t">
                  <td className="px-4 py-3">{installment.transaction?.description ?? 'Parcela'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {installment.installmentNumber}/{installment.totalInstallments}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatMonthYear(installment.dueMonth, installment.dueYear)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(Number(installment.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={installment.isPaid ? 'outline' : 'default'}
                      className="gap-2"
                      onClick={() => togglePayment(installment)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {installment.isPaid ? 'Reabrir' : 'Marcar pago'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
