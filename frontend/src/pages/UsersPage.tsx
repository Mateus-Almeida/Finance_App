import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, UserRole } from '@/types';
import { userService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Users as UsersIcon, Plus, Shield, User as UserIcon, Pencil, Trash2 } from 'lucide-react';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.NORMAL,
  });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.create(form);
      toast.success('Usuário criado com sucesso');
      setForm({ name: '', email: '', password: '', role: UserRole.NORMAL });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = () => {
    setForm({ name: '', email: '', password: '', role: UserRole.NORMAL });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleOpenChange}
      title="Novo usuário"
      description="Cadastre um novo usuário no sistema."
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="João Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="joao@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password">Senha</Label>
          <Input
            id="user-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Tipo de usuário</Label>
          <select
            id="user-role"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          >
            <option value={UserRole.NORMAL}>Normal - Pode criar itens de pagamento</option>
            <option value={UserRole.ADMIN}>Admin - Pode gerenciar tudo</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function EditUserModal({ open, onClose, user, onSuccess }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.NORMAL,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || UserRole.NORMAL,
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Preencha o nome e email');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (form.password.trim()) {
        data.password = form.password;
      }
      await userService.update(user!.id, data);
      toast.success('Usuário atualizado com sucesso');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = () => {
    setForm({ name: '', email: '', password: '', role: UserRole.NORMAL });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleOpenChange}
      title="Editar usuário"
      description="Atualize os dados do usuário."
      footer={
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-user-name">Nome</Label>
          <Input
            id="edit-user-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="João Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-email">Email</Label>
          <Input
            id="edit-user-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="joao@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-password">Nova senha (deixe em branco para manter)</Label>
          <Input
            id="edit-user-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Nova senha"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-role">Tipo de usuário</Label>
          <select
            id="edit-user-role"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          >
            <option value={UserRole.NORMAL}>Normal - Pode criar itens de pagamento</option>
            <option value={UserRole.ADMIN}>Admin - Pode gerenciar tudo</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role?: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <UserIcon className="mr-1 h-3 w-3" />
        Normal
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setConfirmDialog({
      open: true,
      title: 'Excluir usuário',
      description: `Tem certeza que deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await userService.delete(user.id);
          toast.success('Usuário excluído');
          fetchUsers();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Erro ao excluir usuário');
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Lista de usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <UsersIcon className="mb-2 h-12 w-12 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Criado em</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3">{user.name}</td>
                      <td className="py-3 text-muted-foreground">{user.email}</td>
                      <td className="py-3">{getRoleBadge(user.role)}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
      <EditUserModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={fetchUsers}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
