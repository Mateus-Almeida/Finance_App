#!/bin/bash

# Script de correção e instalação do Finance Tracker
# Uso: ./fix-and-install.sh [caminho_do_projeto]

PROJECT_PATH="${1:-$(pwd)}"

echo "=========================================="
echo "Finance Tracker - Correção e Instalação"
echo "=========================================="
echo ""
echo "Diretório do projeto: $PROJECT_PATH"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar erro
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Erro na etapa anterior${NC}"
        exit 1
    fi
}

# ============================================
# BACKEND
# ============================================
echo -e "${YELLOW}[1/4] Configurando Backend...${NC}"
cd "$PROJECT_PATH/finance-tracker-backend" 2>/dev/null || cd "$PROJECT_PATH/backend" 2>/dev/null || {
    echo -e "${RED}✗ Diretório backend não encontrado${NC}"
    exit 1
}

echo "  → Limpando node_modules..."
rm -rf node_modules pnpm-lock.yaml package-lock.json yarn.lock dist

echo "  → Instalando dependências..."
pnpm install

check_error

echo "  → Verificando .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}  ⚠ .env criado a partir do exemplo. Edite com suas configurações!${NC}"
fi

echo -e "${GREEN}✓ Backend configurado${NC}"
echo ""

# ============================================
# FRONTEND
# ============================================
echo -e "${YELLOW}[2/4] Configurando Frontend...${NC}"
cd "$PROJECT_PATH/finance-tracker-frontend" 2>/dev/null || cd "$PROJECT_PATH/frontend" 2>/dev/null || {
    echo -e "${RED}✗ Diretório frontend não encontrado${NC}"
    exit 1
}

echo "  → Limpando node_modules..."
rm -rf node_modules pnpm-lock.yaml package-lock.json yarn.lock

echo "  → Instalando dependências..."
pnpm install

check_error

echo "  → Verificando componentes UI..."
if [ ! -d "src/components/ui" ]; then
    mkdir -p src/components/ui
fi

echo "  → Verificando lib/utils.ts..."
if [ ! -f "src/lib/utils.ts" ]; then
    mkdir -p src/lib
    cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
fi

echo "  → Verificando .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}  ⚠ .env criado a partir do exemplo${NC}"
fi

echo -e "${GREEN}✓ Frontend configurado${NC}"
echo ""

# ============================================
# BANCO DE DADOS
# ============================================
echo -e "${YELLOW}[3/4] Verificando Banco de Dados...${NC}"
echo -e "${YELLOW}  ⚠ Certifique-se de que o PostgreSQL está rodando${NC}"
echo ""
echo "  Comandos para criar o banco (execute manualmente se necessário):"
echo "    sudo -u postgres psql -c \"CREATE DATABASE finance_tracker;\""
echo "    sudo -u postgres psql -d finance_tracker -f database-schema.sql"
echo ""

# ============================================
# INSTRUÇÕES FINAIS
# ============================================
echo -e "${YELLOW}[4/4] Instruções para executar:${NC}"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd $PROJECT_PATH/finance-tracker-backend"
echo "  pnpm run start:dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd $PROJECT_PATH/finance-tracker-frontend"
echo "  pnpm run dev"
echo ""
echo -e "${GREEN}=========================================="
echo "Configuração concluída!"
echo "==========================================${NC}"
