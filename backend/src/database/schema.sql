-- ============================================
-- ESQUEMA DO BANCO DE DADOS - FINANCE TRACKER
-- PostgreSQL
-- ============================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: categories
-- Categorias 50/30/20:
-- - ESSENTIAL (50%): Moradia, Alimentação, Saúde, Transporte
-- - LIFESTYLE (30%): Lazer, Entretenimento, Compras
-- - DEBTS_INVESTMENTS (20%): Dívidas, Investimentos, Poupança
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ESSENTIAL', 'LIFESTYLE', 'DEBTS_INVESTMENTS')),
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: incomes (Rendas/Salários)
-- ============================================
CREATE TABLE incomes (
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
-- TABELA: transactions (Transações/Despesas)
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    is_fixed BOOLEAN DEFAULT false,
    is_installment BOOLEAN DEFAULT false,
    total_installments INTEGER DEFAULT 1,
    installment_group_id UUID,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: installments (Parcelas Detalhadas)
-- Tabela auxiliar para rastreamento individual de parcelas
-- ============================================
CREATE TABLE installments (
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
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);

-- Índices para categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Índices para incomes
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_month_year ON incomes(month, year);

-- Índices para transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_month_year ON transactions(month, year);
CREATE INDEX idx_transactions_installment_group ON transactions(installment_group_id);
CREATE INDEX idx_transactions_is_installment ON transactions(is_installment);

-- Índices para installments
CREATE INDEX idx_installments_user_id ON installments(user_id);
CREATE INDEX idx_installments_transaction_id ON installments(transaction_id);
CREATE INDEX idx_installments_due_date ON installments(due_year, due_month);
CREATE INDEX idx_installments_is_paid ON installments(is_paid);

-- ============================================
-- CATEGORIAS PADRÃO (50/30/20)
-- ============================================

-- ESSENTIAL (50%) - Necessidades básicas
INSERT INTO categories (name, type, color, icon, is_default) VALUES
('Moradia', 'ESSENTIAL', '#EF4444', 'home', true),
('Alimentação', 'ESSENTIAL', '#F97316', 'utensils', true),
('Saúde', 'ESSENTIAL', '#EAB308', 'heart-pulse', true),
('Transporte', 'ESSENTIAL', '#3B82F6', 'car', true),
('Educação', 'ESSENTIAL', '#8B5CF6', 'graduation-cap', true),
('Contas Básicas', 'ESSENTIAL', '#06B6D4', 'receipt', true);

-- LIFESTYLE (30%) - Estilo de vida
INSERT INTO categories (name, type, color, icon, is_default) VALUES
('Lazer', 'LIFESTYLE', '#EC4899', 'gamepad-2', true),
('Restaurantes', 'LIFESTYLE', '#F43F5E', 'utensils-crossed', true),
('Compras', 'LIFESTYLE', '#D946EF', 'shopping-bag', true),
('Viagens', 'LIFESTYLE', '#A855F7', 'plane', true),
('Assinaturas', 'LIFESTYLE', '#6366F1', 'tv', true),
('Hobbies', 'LIFESTYLE', '#0EA5E9', 'palette', true);

-- DEBTS_INVESTMENTS (20%) - Dívidas e Investimentos
INSERT INTO categories (name, type, color, icon, is_default) VALUES
('Dívidas', 'DEBTS_INVESTMENTS', '#DC2626', 'alert-circle', true),
('Investimentos', 'DEBTS_INVESTMENTS', '#16A34A', 'trending-up', true),
('Poupança', 'DEBTS_INVESTMENTS', '#22C55E', 'piggy-bank', true),
('Reserva de Emergência', 'DEBTS_INVESTMENTS', '#84CC16', 'shield', true);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW PARA RESUMO MENSAL
-- ============================================
CREATE VIEW monthly_summary AS
SELECT 
    t.user_id,
    t.month,
    t.year,
    c.type as category_type,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, t.month, t.year, c.type;

-- ============================================
-- VIEW PARA PARCELAS PENDENTES POR MÊS
-- ============================================
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
