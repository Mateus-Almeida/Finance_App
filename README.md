# Finance Tracker - Controle Financeiro Pessoal

Aplicação completa para tracking financeiro pessoal, com foco em visão macro sobre gastos parcelados e cálculo do saldo real disponível.

## Funcionalidades Principais

- **Lógica de Parcelas**: Ao cadastrar um gasto parcelado, o sistema gera registros individuais para cada mês no banco de dados
- **Visão 50/30/20**: Categorização dos gastos em Essencial (50%), Estilo de Vida (30%) e Dívidas/Investimento (20%)
- **Card de Realidade**: Mostra o salário líquido menos a soma de parcelas do mês e contas fixas
- **Projeção de Gastos**: Gráfico de barras mostrando a projeção de gastos para os próximos 6 meses

## Stack Tecnológica

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Gráficos**: Recharts
- **Roteamento**: React Router DOM
- **HTTP Client**: Axios

## Estrutura de Pastas

```
finance-tracker/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Autenticação (JWT)
│   │   ├── users/             # Usuários
│   │   ├── categories/        # Categorias (50/30/20)
│   │   ├── transactions/      # Transações/Despesas
│   │   ├── incomes/           # Rendas/Salários
│   │   ├── installments/      # Parcelas
│   │   ├── common/            # Decorators, Filters, Interceptors
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── database-schema.sql    # Script SQL do banco
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                   # React Frontend
    ├── src/
    │   ├── components/        # Componentes React
    │   │   ├── RealityCard.tsx
    │   │   ├── ProjectionChart.tsx
    │   │   └── FiftyThirtyTwenty.tsx
    │   ├── pages/             # Páginas
    │   │   ├── Login.tsx
    │   │   └── Dashboard.tsx
    │   ├── hooks/             # Custom Hooks
    │   │   ├── useAuth.ts
    │   │   ├── useTransactions.ts
    │   │   ├── useCategories.ts
    │   │   └── useIncomes.ts
    │   ├── services/          # Serviços de API
    │   │   ├── api.ts
    │   │   ├── auth.service.ts
    │   │   ├── transaction.service.ts
    │   │   ├── category.service.ts
    │   │   ├── income.service.ts
    │   │   └── installment.service.ts
    │   ├── types/             # Tipos TypeScript
    │   ├── utils/             # Utilitários
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Configuração do Banco de Dados

1. Crie o banco de dados PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE finance_tracker;
\q
```

2. Execute o script de schema:

```bash
psql -U postgres -d finance_tracker -f backend/database-schema.sql
```

## Instalação e Execução

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Executar em desenvolvimento
npm run start:dev

# O backend estará rodando em http://localhost:3001
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Executar em desenvolvimento
npm run dev

# O frontend estará rodando em http://localhost:5173
```

## Variáveis de Ambiente

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USERNAME=postgres
DB_PASSWORD=sua_senha

# App
PORT=3001
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRATION=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/me` - Perfil do usuário logado
- `PATCH /api/users/me` - Atualizar perfil
- `DELETE /api/users/me` - Excluir conta

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/categories/:id` - Detalhes da categoria
- `PATCH /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Excluir categoria

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `GET /api/transactions/summary` - Resumo mensal (50/30/20)
- `GET /api/transactions/projection` - Projeção de gastos
- `GET /api/transactions/:id` - Detalhes da transação
- `PATCH /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação

### Rendas
- `GET /api/incomes` - Listar rendas
- `POST /api/incomes` - Criar renda
- `GET /api/incomes/total` - Total de rendas
- `GET /api/incomes/:id` - Detalhes da renda
- `PATCH /api/incomes/:id` - Atualizar renda
- `DELETE /api/incomes/:id` - Excluir renda

### Parcelas
- `GET /api/installments` - Listar parcelas
- `GET /api/installments/pending` - Parcelas pendentes
- `GET /api/installments/upcoming` - Próximas parcelas
- `GET /api/installments/total-pending` - Total pendente
- `PATCH /api/installments/:id/pay` - Marcar como paga
- `PATCH /api/installments/:id/unpay` - Marcar como não paga

## Lógica de Parcelas

Quando uma transação parcelada é criada:

1. A transação principal é salva com `isInstallment = true`
2. Um `installmentGroupId` único é gerado (UUID)
3. Registros individuais são criados na tabela `installments` para cada parcela
4. Cada parcela tem seu próprio `dueMonth` e `dueYear`

Exemplo: Compra de R$ 1.200,00 em 10x
- 10 registros na tabela `installments`
- Cada parcela: R$ 120,00
- Parcela 1: mês atual
- Parcela 2: mês atual + 1
- ...e assim por diante

## Visão 50/30/20

As categorias são divididas em três grupos:

### Essencial (50%)
- Moradia
- Alimentação
- Saúde
- Transporte
- Educação
- Contas Básicas

### Estilo de Vida (30%)
- Lazer
- Restaurantes
- Compras
- Viagens
- Assinaturas
- Hobbies

### Dívidas/Investimentos (20%)
- Dívidas
- Investimentos
- Poupança
- Reserva de Emergência

## Card de Realidade

O Card de Realidade calcula:

```
Saldo Disponível Real = Salário Líquido - (Parcelas do Mês + Contas Fixas)
```

Componentes:
- **Salário Líquido**: Soma de todas as rendas do mês
- **Parcelas**: Soma das parcelas pendentes do mês
- **Contas Fixas**: Soma das transações marcadas como fixas
- **Saldo Real**: O que realmente pode ser gasto

## Scripts Úteis

### Backend

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test

# Migrações TypeORM
npm run migration:generate -- -n NomeDaMigracao
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.
