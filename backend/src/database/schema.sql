-- ============================================
-- ESQUEMA DO BANCO DE DADOS - FINANCE TRACKER v2
-- PostgreSQL
-- ============================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'NORMAL' CHECK (role IN ('ADMIN', 'NORMAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: categories (Simplificada - sem 50/30/20)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MIGRACAO: Remover coluna 'type' de categories se existir
-- ============================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type') THEN
        DROP VIEW IF EXISTS monthly_summary CASCADE;
        ALTER TABLE categories DROP COLUMN type;
    END IF;
END $$;

-- ============================================
-- MIGRACAO: Remover view antiga monthly_summary se existir
-- ============================================
DROP VIEW IF EXISTS monthly_summary CASCADE;

-- ============================================
-- TABELA: savings_boxes (Novas Caixas de Investimento)
-- ============================================
CREATE TABLE IF NOT EXISTS savings_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0,
    goal DECIMAL(15, 2),
    color VARCHAR(7) DEFAULT '#10b981',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: transactions (Atualizada com type e savingsBoxId)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME', 'INVESTMENT')) DEFAULT 'EXPENSE',
    description VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    competence_month INTEGER NOT NULL CHECK (competence_month >= 1 AND competence_month <= 12),
    competence_year INTEGER NOT NULL,
    is_fixed BOOLEAN DEFAULT false,
    is_installment BOOLEAN DEFAULT false,
    total_installments INTEGER DEFAULT 1,
    installment_group_id UUID,
    is_paid BOOLEAN DEFAULT false,
    credit_card_id UUID,
    savings_box_id UUID REFERENCES savings_boxes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MIGRACAO: transactions - Adicionar colunas se nao existirem
-- ============================================
DO $$ 
BEGIN
    -- Adicionar coluna type se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'type') THEN
        ALTER TABLE transactions ADD COLUMN type VARCHAR(20) CHECK (type IN ('EXPENSE', 'INCOME', 'INVESTMENT')) DEFAULT 'EXPENSE';
    END IF;

    -- Adicionar coluna competence_month se nao existir (renomear de month)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'competence_month') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'month') THEN
            ALTER TABLE transactions RENAME COLUMN month TO competence_month;
        ELSE
            ALTER TABLE transactions ADD COLUMN competence_month INTEGER CHECK (competence_month >= 1 AND competence_month <= 12);
        END IF;
    END IF;

    -- Adicionar coluna competence_year se nao existir (renomear de year)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'competence_year') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'year') THEN
            ALTER TABLE transactions RENAME COLUMN year TO competence_year;
        ELSE
            ALTER TABLE transactions ADD COLUMN competence_year INTEGER;
        END IF;
    END IF;

    -- Adicionar coluna savings_box_id se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'savings_box_id') THEN
        ALTER TABLE transactions ADD COLUMN savings_box_id UUID REFERENCES savings_boxes(id) ON DELETE SET NULL;
    END IF;

    -- Adicionar coluna credit_card_id se nao existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'credit_card_id') THEN
        ALTER TABLE transactions ADD COLUMN credit_card_id UUID;
    END IF;
END $$;

-- ============================================
-- TABELA: incomes (Rendas/Salários)
-- ============================================
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    is_fixed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: installments (Parcelas Detalhadas)
-- ============================================
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_month INTEGER NOT NULL CHECK (due_month >= 1 AND due_month <= 12),
    due_year INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: payment_methods (Meios de Pagamento)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'TRANSFER')) DEFAULT 'CASH',
    active BOOLEAN DEFAULT true,
    card_limit DECIMAL(15, 2),
    closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
    color VARCHAR(7) DEFAULT '#6b7280',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar payment_method_id em transactions se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method_id') THEN
        ALTER TABLE transactions ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índices para payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_active ON payment_methods(user_id, active);

-- Índice para transactions com payment_method_id
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method_id);

-- ============================================
-- TABELA: goals (Metas)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CATEGORY_LIMIT', 'CARD_LIMIT', 'SAVING', 'TARGET_VALUE')) DEFAULT 'CATEGORY_LIMIT',
    active BOOLEAN DEFAULT true,
    target_value DECIMAL(15, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    savings_box_id UUID REFERENCES savings_boxes(id) ON DELETE SET NULL,
    warning_percent INTEGER DEFAULT 80,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: investment_assets (Ativos de Investimento)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CDB', 'STOCK', 'CRYPTO', 'TREASURY', 'FUND', 'OTHER')) DEFAULT 'OTHER',
    institution VARCHAR(255),
    initial_value DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    monthly_contribution DECIMAL(15, 2),
    active BOOLEAN DEFAULT true,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: investment_movements (Movimentações de Investimento)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES investment_assets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CONTRIBUTION', 'WITHDRAWAL', 'YIELD', 'LOSS')) DEFAULT 'CONTRIBUTION',
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    movement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, active);

-- Índices para investment_assets
CREATE INDEX IF NOT EXISTS idx_investment_assets_user_id ON investment_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_assets_user_active ON investment_assets(user_id, active);

-- Índices para investment_movements
CREATE INDEX IF NOT EXISTS idx_investment_movements_user_id ON investment_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_movements_asset_id ON investment_movements(asset_id);

-- ============================================
-- ÍNDICES PARA PERFORMANCE (FASE 4)
-- ============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON categories(is_default);

-- Índices para savings_boxes
CREATE INDEX IF NOT EXISTS idx_savings_boxes_user_id ON savings_boxes(user_id);

-- Índices para transactions (PRINCIPAIS PARA PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_month_year ON transactions(user_id, competence_year, competence_month);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_savings_box_id ON transactions(savings_box_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id ON transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group ON transactions(installment_group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_fixed ON transactions(is_fixed);
CREATE INDEX IF NOT EXISTS idx_transactions_is_paid ON transactions(is_paid);
CREATE INDEX IF NOT EXISTS idx_transactions_is_installment ON transactions(is_installment);

-- Índices compostos para agregações no banco
CREATE INDEX IF NOT EXISTS idx_transactions_summary ON transactions(user_id, competence_year, competence_month, type);

-- Índices para installments
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_user_due_date ON installments(user_id, due_year, due_month);
CREATE INDEX IF NOT EXISTS idx_installments_transaction_id ON installments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_installments_is_paid ON installments(is_paid);

-- Índices para incomes
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_month_year ON incomes(month, year);

-- ============================================
-- CATEGORIAS PADRÃO (Simplificadas)
-- ============================================
-- Remove categorias padrão que não estão sendo usadas em transações
DELETE FROM categories 
WHERE is_default = true 
AND id NOT IN (SELECT DISTINCT category_id FROM transactions WHERE category_id IS NOT NULL);

-- Insere as categorias padrão
INSERT INTO categories (name, color, icon, is_default) VALUES
    ('Alimentação', '#10b981', 'mdi-food', true),
    ('Transporte', '#3b82f6', 'mdi-car', true),
    ('Moradia', '#8b5cf6', 'mdi-home', true),
    ('Saúde', '#ef4444', 'mdi-hospital', true),
    ('Lazer', '#f97316', 'mdi-gamepad-variant', true),
    ('Assinaturas', '#ec4899', 'mdi-netflix', true),
    ('Educação', '#06b6d4', 'mdi-school', true),
    ('Vestuário', '#84cc16', 'mdi-tshirt-crew', true),
    ('Outros', '#6b7280', 'mdi-dots-horizontal', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_boxes_updated_at ON savings_boxes;
CREATE TRIGGER update_savings_boxes_updated_at BEFORE UPDATE ON savings_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incomes_updated_at ON incomes;
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installments_updated_at ON installments;
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_assets_updated_at ON investment_assets;
CREATE TRIGGER update_investment_assets_updated_at BEFORE UPDATE ON investment_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_movements_updated_at ON investment_movements;
CREATE TRIGGER update_investment_movements_updated_at BEFORE UPDATE ON investment_movements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS OTIMIZADAS PARA DASHBOARD
-- ============================================

-- View para resumo financeiro mensal
DROP VIEW IF EXISTS monthly_financial_summary;
CREATE VIEW monthly_financial_summary AS
SELECT 
    t.user_id,
    t.competence_month,
    t.competence_year,
    t.type,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
FROM transactions t
GROUP BY t.user_id, t.competence_month, t.competence_year, t.type;

-- View para gastos por categoria
DROP VIEW IF EXISTS expenses_by_category;
CREATE VIEW expenses_by_category AS
SELECT 
    t.user_id,
    t.competence_month,
    t.competence_year,
    t.category_id,
    c.name as category_name,
    c.color as category_color,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'EXPENSE'
GROUP BY t.user_id, t.competence_month, t.competence_year, t.category_id, c.name, c.color;

-- View para investimentos por caixa
DROP VIEW IF EXISTS investments_by_savings_box;
CREATE VIEW investments_by_savings_box AS
SELECT 
    t.user_id,
    t.competence_month,
    t.competence_year,
    t.savings_box_id,
    sb.name as savings_box_name,
    sb.color as savings_box_color,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
FROM transactions t
JOIN savings_boxes sb ON t.savings_box_id = sb.id
WHERE t.type = 'INVESTMENT'
GROUP BY t.user_id, t.competence_month, t.competence_year, t.savings_box_id, sb.name, sb.color;

-- View para parcelas pendentes por mês
DROP VIEW IF EXISTS pending_installments_by_month;
CREATE VIEW pending_installments_by_month AS
SELECT 
    i.user_id,
    i.due_month,
    i.due_year,
    SUM(i.amount) as total_pending,
    COUNT(i.id) as installment_count
FROM installments i
WHERE i.is_paid = false
GROUP BY i.user_id, i.due_month, i.due_year;

-- ============================================
-- PROCEDURES OTIMIZADAS PARA AGREGACOES
-- ============================================

-- Procedure para resumo financeiro mensal
CREATE OR REPLACE FUNCTION get_monthly_financial_summary(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER
)
RETURNS TABLE (
    total_income NUMERIC,
    total_expense NUMERIC,
    total_investment NUMERIC,
    balance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN t.type = 'INVESTMENT' THEN t.amount ELSE 0 END), 0) as total_investment,
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN t.type = 'INVESTMENT' THEN t.amount ELSE 0 END), 0) as balance
    FROM transactions t
    WHERE t.user_id = p_user_id 
        AND t.competence_month = p_month 
        AND t.competence_year = p_year;
END;
$$ LANGUAGE plpgsql;

-- Procedure para evolução do saldo
CREATE OR REPLACE FUNCTION get_balance_evolution(
    p_user_id UUID,
    p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
    month INTEGER,
    year INTEGER,
    balance NUMERIC
) AS $$
DECLARE
    v_current_month INTEGER;
    v_current_year INTEGER;
BEGIN
    v_current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN QUERY
    WITH RECURSIVE months AS (
        SELECT v_current_month as m, v_current_year as y, 1 as n
        UNION ALL
        SELECT 
            CASE WHEN m - 1 < 1 THEN 12 ELSE m - 1 END,
            CASE WHEN m - 1 < 1 THEN y - 1 ELSE y END,
            n + 1
        FROM months
        WHERE n < p_months
    )
    SELECT 
        m as month,
        y as year,
        COALESCE(
            (SELECT balance FROM get_monthly_financial_summary(p_user_id, m, y)),
            0
        ) as balance
    FROM months
    ORDER BY y, m;
END;
$$ LANGUAGE plpgsql;
