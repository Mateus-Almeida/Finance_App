# Correção de Erros - Finance Tracker

## Problemas e Soluções

### 1. Backend - Erro do bcrypt (Módulo nativo não encontrado)

**Problema**: O `bcrypt` tem dependências nativas que precisam ser compiladas. Com pnpm, isso pode dar problema.

**Solução**: Troquei `bcrypt` por `bcryptjs` (versão pura JavaScript, sem compilação).

#### Passos para corrigir:

```bash
cd finance-tracker-backend

# Limpar completamente
rm -rf node_modules pnpm-lock.yaml dist

# Reinstalar com pnpm
pnpm install

# Copiar .env
cp .env.example .env
# Edite o .env com suas configurações do PostgreSQL

# Rodar
pnpm run start:dev
```

### 2. Frontend - Componentes UI faltando

**Problema**: Faltavam os componentes do shadcn/ui (button, card, sonner, etc.)

**Solução**: Criei todos os componentes necessários na pasta `src/components/ui/`.

#### Passos para corrigir:

```bash
cd finance-tracker-frontend

# Limpar e reinstalar
rm -rf node_modules pnpm-lock.yaml

# Reinstalar com pnpm
pnpm install

# Copiar .env
cp .env.example .env

# Rodar
pnpm run dev
```

## Arquivos Criados/Corrigidos

### Frontend - Componentes UI
- `src/components/ui/button.tsx` ✅
- `src/components/ui/card.tsx` ✅
- `src/components/ui/sonner.tsx` ✅
- `src/components/ui/label.tsx` ✅
- `src/components/ui/input.tsx` ✅
- `src/components/ui/tabs.tsx` ✅
- `src/components/ui/progress.tsx` ✅

### Backend
- `package.json` - Trocado bcrypt por bcryptjs ✅
- `src/auth/auth.service.ts` - Importa bcryptjs ✅

## Comandos Rápidos

### Backend
```bash
cd finance-tracker-backend
rm -rf node_modules pnpm-lock.yaml dist
pnpm install
pnpm run start:dev
```

### Frontend
```bash
cd finance-tracker-frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run dev
```

## Se ainda der erro no frontend

Se o Vite continuar reclamando de imports, verifique se o arquivo `vite.config.ts` está correto:

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

## Se ainda der erro no backend

Verifique se o PostgreSQL está rodando:

```bash
# Verificar status do PostgreSQL
sudo systemctl status postgresql

# Se não estiver rodando
sudo systemctl start postgresql

# Criar banco de dados
sudo -u postgres psql -c "CREATE DATABASE finance_tracker;"

# Executar schema
sudo -u postgres psql -d finance_tracker -f database-schema.sql
```

## Portas

- Backend: http://localhost:3001
- Frontend: http://localhost:5173 (ou 5174 se 5173 estiver ocupada)

## Testar se está funcionando

1. Backend deve mostrar: `🚀 Finance Tracker Backend rodando na porta 3001`
2. Frontend deve abrir sem erros de importação
