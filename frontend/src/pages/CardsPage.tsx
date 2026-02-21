import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';
import { cardsService, CardSummary, CardTimelineMonth, CardInvoiceTransaction } from '@/services/cards.service';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { PaymentMethodType } from '@/types';

export function CardsPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<CardTimelineMonth[]>([]);
  const [transactions, setTransactions] = useState<CardInvoiceTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline'>('summary');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { paymentMethods } = usePaymentMethods();
  const creditCards = paymentMethods.filter(pm => pm.type === PaymentMethodType.CREDIT_CARD);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await cardsService.getSummary(selectedMonth, selectedYear);
      setCards(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [selectedMonth, selectedYear]);

  const fetchCardDetails = async (cardId: string) => {
    try {
      const [timelineData, transactionsData] = await Promise.all([
        cardsService.getTimeline(cardId, 6),
        cardsService.getTransactions(cardId, selectedMonth, selectedYear),
      ]);
      setTimeline(timelineData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Erro ao carregar detalhes do cartão:', error);
    }
  };

  useEffect(() => {
    if (selectedCard) {
      fetchCardDetails(selectedCard);
    }
  }, [selectedCard, selectedMonth, selectedYear]);

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
      <header className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie suas faturas e limites</p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      {creditCards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Nenhum cartão de crédito cadastrado.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cadastre um cartão de crédito em "Meios de Pagamento"
            </p>
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Nenhum dado de cartão encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card 
                key={card.paymentMethodId} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCard === card.paymentMethodId ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCard(card.paymentMethodId)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{card.paymentMethodName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Limite:</span>
                      <span>{formatCurrency(card.cardLimit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gasto no mês:</span>
                      <span className="text-orange-500">{formatCurrency(card.totalSpentCurrentMonth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Próxima fatura:</span>
                      <span className="font-semibold">{formatCurrency(card.estimatedNextBill)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Parcelas futuras:</span>
                      <span>{formatCurrency(card.totalFutureInstallments)}</span>
                    </div>
                    {card.cardLimit > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Uso do limite</span>
                          <span>{card.limitUsagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              card.limitUsagePercent > 90 ? 'bg-red-500' :
                              card.limitUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(card.limitUsagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCard && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {cards.find(c => c.paymentMethodId === selectedCard)?.paymentMethodName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeTab === 'summary' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveTab('summary')}
                    >
                      Fatura Atual
                    </Button>
                    <Button 
                      variant={activeTab === 'timeline' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveTab('timeline')}
                    >
                      Timeline
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'summary' ? (
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma transação na fatura deste mês
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((t) => (
                          <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: t.categoryColor }}
                              />
                              <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-xs text-muted-foreground">{t.categoryName}</p>
                              </div>
                            </div>
                            <span className="font-semibold">{formatCurrency(t.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeline.map((t, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          t.isPaid ? 'bg-green-500/10' : 'bg-muted/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{t.monthName}/{t.year}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.isPaid ? 'Pago' : 'Pendente'}
                          </p>
                        </div>
                        <span className="font-semibold">{formatCurrency(t.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
