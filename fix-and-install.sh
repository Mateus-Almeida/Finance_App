#!/bin/bash

# Script de correção e instalação completa do Finance Tracker
# Uso: ./fix-and-install.sh

PROJECT_PATH="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Finance Tracker - Instalação Completa"
echo "=========================================="
echo ""
echo "Diretório do projeto: $PROJECT_PATH"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para verificar erro
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Erro na etapa anterior${NC}"
        exit 1
    fi
}

# ============================================
# 1. VERIFICAR POSTGRESQL
# ============================================
echo -e "${BLUE}[1/7] Verificando PostgreSQL...${NC}"

# Tenta conectar ao PostgreSQL
if command -v psql &> /dev/null; then
    if sudo -u postgres psql -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL está rodando${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL não está rodando. Tentando iniciar...${NC}"
        
        # Tenta iniciar o PostgreSQL
        if command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null
        elif command -v service &> /dev/null; then
            sudo service postgresql start 2>/dev/null
        fi
        
        sleep 2
        
        if sudo -u postgres psql -c "SELECT 1" &> /dev/null; then
            echo -e "${GREEN}✓ PostgreSQL iniciado com sucesso${NC}"
        else
            echo -e "${RED}✗ Não foi possível iniciar o PostgreSQL${NC}"
            echo "  Por favor, inicie o PostgreSQL manualmente:"
            echo "  sudo systemctl start postgresql"
            exit 1
        fi
    fi
else
    echo -e "${RED}✗ PostgreSQL não está instalado${NC}"
    echo "  Instale com: sudo apt install postgresql postgresql-contrib"
    exit 1
fi
echo ""

# ============================================
# 2. CRIAR CONTA POSTGRESQL
# ============================================
echo -e "${BLUE}[2/7] Verificando conta de usuário PostgreSQL...${NC}"

CURRENT_USER=$(whoami)

# Verifica se o usuário já existe no PostgreSQL
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$CURRENT_USER'" | grep -q 1; then
    echo -e "${GREEN}✓ Usuário '$CURRENT_USER' já existe no PostgreSQL${NC}"
else
    echo -e "${YELLOW}⚠ Criando usuário '$CURRENT_USER' no PostgreSQL...${NC}"
    sudo -u postgres psql -c "CREATE USER $CURRENT_USER WITH PASSWORD '$CURRENT_USER' SUPERUSER;" 2>/dev/null
    check_error
    echo -e "${GREEN}✓ Usuário criado com sucesso${NC}"
fi
echo ""

# ============================================
# 3. CRIAR BANCO DE DADOS
# ============================================
echo -e "${BLUE}[3/7] Verificando banco de dados...${NC}"

DB_NAME="finance_tracker"

if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✓ Banco de dados '$DB_NAME' já existe${NC}"
    
    # Pergunta se deseja recriar
    read -p "Deseja recriar o banco de dados? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}⚠ Recriando banco de dados...${NC}"
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $CURRENT_USER;"
        check_error
        echo -e "${GREEN}✓ Banco de dados recriado${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Criando banco de dados '$DB_NAME'...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $CURRENT_USER;"
    check_error
    echo -e "${GREEN}✓ Banco de dados criado${NC}"
fi
echo ""

# ============================================
# 4. EXECUTAR SCHEMA
# ============================================
echo -e "${BLUE}[4/7] Executando schema do banco de dados...${NC}"

SCHEMA_PATH="$PROJECT_PATH/backend/src/database/schema.sql"

if [ -f "$SCHEMA_PATH" ]; then
    sudo -u postgres psql -d $DB_NAME -f "$SCHEMA_PATH" 2>/dev/null
    check_error
    echo -e "${GREEN}✓ Schema executado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠ Schema não encontrado em $SCHEMA_PATH${NC}"
    echo "  Executando schema antigo..."
    if [ -f "$PROJECT_PATH/backend/database-schema.sql" ]; then
        sudo -u postgres psql -d $DB_NAME -f "$PROJECT_PATH/backend/database-schema.sql"
        check_error
        echo -e "${GREEN}✓ Schema executado${NC}"
    else
        echo -e "${RED}✗ Schema não encontrado${NC}"
        exit 1
    fi
fi
echo ""

# ============================================
# 5. INSTALAR DEPENDÊNCIAS - BACKEND
# ============================================
echo -e "${BLUE}[5/7] Instalando dependências do Backend...${NC}"

BACKEND_DIR="$PROJECT_PATH/backend"

if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    
    echo "  → Limpando node_modules..."
    rm -rf node_modules pnpm-lock.yaml package-lock.json yarn.lock dist 2>/dev/null
    
    echo "  → Instalando com pnpm..."
    pnpm install
    check_error
    
    echo "  → Verificando .env..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}  ⚠ .env criado a partir do exemplo${NC}"
    fi
    
    echo -e "${GREEN}✓ Backend configurado${NC}"
else
    echo -e "${RED}✗ Diretório backend não encontrado${NC}"
    exit 1
fi
echo ""

# ============================================
# 6. INSTALAR DEPENDÊNCIAS - FRONTEND
# ============================================
echo -e "${BLUE}[6/7] Instalando dependências do Frontend...${NC}"

FRONTEND_DIR="$PROJECT_PATH/frontend"

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    
    echo "  → Limpando node_modules..."
    rm -rf node_modules pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null
    
    echo "  → Instalando com pnpm..."
    pnpm install
    check_error
    
    echo "  → Verificando .env..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}  ⚠ .env criado a partir do exemplo${NC}"
    fi
    
    echo -e "${GREEN}✓ Frontend configurado${NC}"
else
    echo -e "${RED}✗ Diretório frontend não encontrado${NC}"
    exit 1
fi
echo ""

# ============================================
# 7. INICIAR SERVIDORES
# ============================================
echo -e "${BLUE}[7/7] Iniciando servidores...${NC}"
echo ""

# Função para killed o processo
cleanup() {
    echo ""
    echo -e "${YELLOW}Encerrando servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${YELLOW}Iniciando Backend (porta 3001)...${NC}"
cd "$BACKEND_DIR"
pnpm run start:dev &
BACKEND_PID=$!
sleep 5

# Verificar se o backend iniciou
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Falha ao iniciar o Backend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend iniciado (PID: $BACKEND_PID)${NC}"

# Iniciar Frontend
echo -e "${YELLOW}Iniciando Frontend (porta 5173)...${NC}"
cd "$FRONTEND_DIR"
pnpm run dev &
FRONTEND_PID=$!
sleep 5

# Verificar se o frontend iniciou
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Falha ao iniciar o Frontend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo -e "${GREEN}✓ Frontend iniciado (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "Tudo pronto! Servidores rodando:"
echo "==========================================${NC}"
echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para encerrar os servidores"
echo ""

# Aguarda indefinidamente
wait
