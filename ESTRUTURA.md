# Estrutura de Pastas - Finance Tracker

## Backend (NestJS + TypeORM)

```
finance-tracker-backend/
├── src/
│   ├── auth/                          # Módulo de Autenticação
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   │
│   ├── users/                         # Módulo de Usuários
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   │
│   ├── categories/                    # Módulo de Categorias (50/30/20)
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.module.ts
│   │   └── categories.service.ts
│   │
│   ├── transactions/                  # Módulo de Transações
│   │   ├── dto/
│   │   │   ├── create-transaction.dto.ts
│   │   │   └── update-transaction.dto.ts
│   │   ├── entities/
│   │   │   └── transaction.entity.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.module.ts
│   │   └── transactions.service.ts    # LÓGICA DE PARCELAS
│   │
│   ├── incomes/                       # Módulo de Rendas
│   │   ├── dto/
│   │   │   ├── create-income.dto.ts
│   │   │   └── update-income.dto.ts
│   │   ├── entities/
│   │   │   └── income.entity.ts
│   │   ├── incomes.controller.ts
│   │   ├── incomes.module.ts
│   │   └── incomes.service.ts
│   │
│   ├── installments/                  # Módulo de Parcelas
│   │   ├── entities/
│   │   │   └── installment.entity.ts
│   │   ├── installments.controller.ts
│   │   ├── installments.module.ts
│   │   └── installments.service.ts
│   │
│   ├── common/                        # Recursos Compartilhados
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── app.module.ts                  # Módulo Principal
│   └── main.ts                        # Ponto de Entrada
│
├── database-schema.sql                # Script SQL Completo
├── .env.example                       # Exemplo de Variáveis de Ambiente
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Frontend (React + Vite + Tailwind)

```
finance-tracker-frontend/
├── src/
│   ├── components/                    # Componentes React
│   │   ├── ui/                        # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (40+ componentes)
│   │   │
│   │   ├── RealityCard.tsx            # CARD DE REALIDADE
│   │   ├── ProjectionChart.tsx        # GRÁFICO DE PROJEÇÃO
│   │   └── FiftyThirtyTwenty.tsx      # VISÃO 50/30/20
│   │
│   ├── pages/                         # Páginas da Aplicação
│   │   ├── Login.tsx                  # Tela de Login/Registro
│   │   └── Dashboard.tsx              # Dashboard Principal
│   │
│   ├── hooks/                         # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   └── useIncomes.ts
│   │
│   ├── services/                      # Serviços de API
│   │   ├── api.ts                     # Configuração Axios
│   │   ├── auth.service.ts
│   │   ├── transaction.service.ts
│   │   ├── category.service.ts
│   │   ├── income.service.ts
│   │   ├── installment.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── types/                         # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── utils/                         # Utilitários
│   │   └── format.ts                  # Formatação de moeda/data
│   │
│   ├── lib/                           # Utilitários shadcn
│   │   └── utils.ts
│   │
│   ├── App.tsx                        # Componente Principal
│   ├── main.tsx                       # Ponto de Entrada
│   └── index.css                      # Estilos Globais
│
├── public/                            # Assets Estáticos
├── .env.example                       # Exemplo de Variáveis de Ambiente
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── index.html
```

## Diagrama de Relacionamentos do Banco de Dados

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │  categories │       │   incomes   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ user_id(FK) │       │ user_id(FK) │
│ email       │       │ id (PK)     │       │ id (PK)     │
│ password    │       │ name        │       │ description │
│ name        │       │ type        │       │ amount      │
│ created_at  │       │ color       │       │ month       │
│ updated_at  │       │ icon        │       │ year        │
└─────────────┘       │ is_default  │       │ is_fixed    │
       │              │ created_at  │       │ created_at  │
       │              │ updated_at  │       │ updated_at  │
       │              └─────────────┘       └─────────────┘
       │
       │              ┌─────────────┐       ┌─────────────┐
       │              │ transactions│       │ installments│
       │              ├─────────────┤       ├─────────────┤
       └──────────────┤ user_id(FK) │◄──────┤ user_id(FK) │
                      │ id (PK)     │◄──────┤ transaction_│
                      │ category_id │       │ id (FK)     │
                      │ description │       │ id (PK)     │
                      │ amount      │       │ installment_│
                      │ is_installment      │ number      │
                      │ total_installments  │ total_install
                      │ installment_│       │ amount      │
                      │ group_id    │       │ due_month   │
                      │ created_at  │       │ due_year    │
                      │ updated_at  │       │ is_paid     │
                      └─────────────┘       │ paid_at     │
                                            │ created_at  │
                                            │ updated_at  │
                                            └─────────────┘
```

## Fluxo de Dados - Criação de Parcela

```
Usuário
   │
   ▼
[Frontend] ──POST /api/transactions──► [Backend]
   │                                        │
   │                                        ▼
   │                              [TransactionService]
   │                                        │
   │                    ┌───────────────────┴───────────────────┐
   │                    │                                       │
   │                    ▼                                       ▼
   │         [Criar Transação]                      [Criar Parcelas]
   │         (isInstallment=true)                   (1 registro/mês)
   │                    │                                       │
   │                    └───────────────────┬───────────────────┘
   │                                        │
   ▼                                        ▼
[Resposta] ◄──────────────────── [Salvar no PostgreSQL]
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            [transactions]         [installments]         [categories]
```

## Componentes Principais do Frontend

### 1. RealityCard (Card de Realidade)
```
Props:
- netSalary: number
- installmentsTotal: number
- fixedTotal: number
- availableBalance: number
- pendingInstallmentsCount: number
- percentageCommitted: number
- percentageAvailable: number

Visual:
┌─────────────────────────────────────┐
│  Card de Realidade                  │
│  O que você realmente pode gastar   │
├─────────────────────────────────────┤
│                                     │
│     Saldo Disponível Real           │
│        R$ 2.500,00                  │
│     de R$ 5.000,00 de salário       │
│                                     │
│  [========Parcelas==][==Fixas=][=Livre=] │
│                                     │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  Parcelas   │  │Contas Fixas │   │
│  │ R$ 1.500,00 │  │ R$ 1.000,00 │   │
│  │  5 pendentes│  │  Mensalidades│   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  Total Comprometido: R$ 2.500,00    │
│                                     │
└─────────────────────────────────────┘
```

### 2. ProjectionChart (Gráfico de Projeção)
```
Props:
- data: ProjectionData[] (6 meses)

Visual:
┌─────────────────────────────────────┐
│  Projeção de Gastos                 │
│  Próximos 6 meses                   │
├─────────────────────────────────────┤
│                                     │
│  R$3k │    ┌───┐                    │
│       │    │███│ ┌───┐              │
│  R$2k │    │███│ │███│    ┌───┐     │
│       │    │███│ │███│    │███│     │
│  R$1k │    │███│ │███│    │███│     │
│       │    │███│ │███│    │███│     │
│    R$0└────┴───┴─┴───┴────┴───┴─────│
│         Jan   Fev   Mar   Abr       │
│         ■ Parcelas ■ Contas Fixas   │
│                                     │
│  [Total Parcelas] [Total Fixas]     │
│  [   Total Geral  ]                 │
│                                     │
└─────────────────────────────────────┘
```

### 3. FiftyThirtyTwenty (Visão 50/30/20)
```
Props:
- essential: { total, percentage }
- lifestyle: { total, percentage }
- debtsInvestments: { total, percentage }
- total: number
- netIncome: number

Visual:
┌─────────────────────────────────────┐
│  Visão 50/30/20                     │
│  Distribuição ideal dos gastos      │
├─────────────────────────────────────┤
│                                     │
│  ┌─[🏠] Essencial                   │
│  │ 50% - Necessidades básicas       │
│  │ R$ 2.500,00  │███████░░░│ 50%    │
│  │ Meta: 50% ✓ Dentro da meta        │
│  └───────────────────────────────── │
│                                     │
│  ┌─[☕] Estilo de Vida               │
│  │ 30% - Lazer e desejos             │
│  │ R$ 1.500,00  │████░░░░░░│ 30%    │
│  │ Meta: 30% ✓ Dentro da meta        │
│  └───────────────────────────────── │
│                                     │
│  ┌─[📈] Dívidas & Investimentos      │
│  │ 20% - Futuro financeiro           │
│  │ R$ 1.000,00  │██░░░░░░░░│ 20%    │
│  │ Meta: 20% ✓ Dentro da meta        │
│  └───────────────────────────────── │
│                                     │
│  Total: R$ 5.000,00                 │
│  Renda: R$ 5.000,00                 │
│                                     │
└─────────────────────────────────────┘
```
