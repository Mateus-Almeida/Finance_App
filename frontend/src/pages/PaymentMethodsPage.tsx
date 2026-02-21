import { useState, useEffect } from 'react';
import { paymentMethodService, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '@/services/payment-method.service';
import { PaymentMethod, PaymentMethodType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

const PAYMENT_METHOD_TYPES = [
  { value: PaymentMethodType.CASH, label: 'Dinheiro', icon: '💵' },
  { value: PaymentMethodType.PIX, label: 'Pix', icon: '📱' },
  { value: PaymentMethodType.DEBIT_CARD, label: 'Débito', icon: '💳' },
  { value: PaymentMethodType.CREDIT_CARD, label: 'Crédito', icon: '💳' },
  { value: PaymentMethodType.TRANSFER, label: 'Transferência', icon: '🏦' },
];

export function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreatePaymentMethodDto>({
    name: '',
    type: PaymentMethodType.CASH,
    cardLimit: undefined,
    closingDay: undefined,
    dueDay: undefined,
    color: '#6b7280',
    icon: '',
  });

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAll(true);
      setPaymentMethods(data);
    } catch (error) {
      toast.error('Erro ao carregar meios de pagamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (form.type === PaymentMethodType.CREDIT_CARD) {
      if (!form.closingDay || !form.dueDay) {
        toast.error('Dia de fechamento e vencimento são obrigatórios para cartão de crédito');
        return;
      }
    }

    try {
      setSaving(true);
      if (editingMethod) {
        await paymentMethodService.update(editingMethod.id, form as UpdatePaymentMethodDto);
        toast.success('Meio de pagamento atualizado');
      } else {
        await paymentMethodService.create(form);
        toast.success('Meio de pagamento criado');
      }
      setModalOpen(false);
      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      toast.error('Erro ao salvar meio de pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setForm({
      name: method.name,
      type: method.type,
      cardLimit: method.cardLimit,
      closingDay: method.closingDay,
      dueDay: method.dueDay,
      color: method.color,
      icon: method.icon,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      if (method.active) {
        await paymentMethodService.deactivate(method.id);
        toast.success('Meio de pagamento inativado');
      } else {
        await paymentMethodService.activate(method.id);
        toast.success('Meio de pagamento ativado');
      }
      fetchPaymentMethods();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setEditingMethod(null);
    setForm({
      name: '',
      type: PaymentMethodType.CASH,
      cardLimit: undefined,
      closingDay: undefined,
      dueDay: undefined,
      color: '#6b7280',
      icon: '',
    });
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
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
          <h1 className="text-2xl font-semibold">Meios de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie suas formas de pagamento</p>
        </div>
        <Button onClick={openNewModal}>Novo Meio de Pagamento</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((method) => (
            <Card key={method.id} className={!method.active ? 'opacity-50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                  <span className="text-2xl">{PAYMENT_METHOD_TYPES.find(t => t.value === method.type)?.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{PAYMENT_METHOD_TYPES.find(t => t.value === method.type)?.label}</span>
                  </div>
                  {method.type === PaymentMethodType.CREDIT_CARD && (
                    <>
                      {method.cardLimit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Limite:</span>
                          <span>R$ {method.cardLimit.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      {method.closingDay && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fechamento:</span>
                          <span>Dia {method.closingDay}</span>
                        </div>
                      )}
                      {method.dueDay && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimento:</span>
                          <span>Dia {method.dueDay}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={method.active ? 'text-green-500' : 'text-red-500'}>
                      {method.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(method)}
                  >
                    {method.active ? 'Inativar' : 'Ativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMethod ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
        footer={
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : editingMethod ? 'Atualizar' : 'Criar'}
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Nubank, Cartão de Débito"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as PaymentMethodType })}
            >
              {PAYMENT_METHOD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {form.type === PaymentMethodType.CREDIT_CARD && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardLimit">Limite do cartão</Label>
                <Input
                  id="cardLimit"
                  type="number"
                  value={form.cardLimit || ''}
                  onChange={(e) => setForm({ ...form, cardLimit: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="5000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">Dia de fechamento</Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={form.closingDay || ''}
                    onChange={(e) => setForm({ ...form, closingDay: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia de vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={form.dueDay || ''}
                    onChange={(e) => setForm({ ...form, dueDay: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="20"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-full"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
