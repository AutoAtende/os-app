#!/bin/bash

echo "🚀 Iniciando setup do sistema de gerenciamento de equipamentos..."

# Configurar frontend
echo "📦 Configurando frontend..."
cd frontend
npm install

# Instalar componentes do shadcn/ui
npx shadcn@latest init --yes
npx shadcn@latest add alert
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add avatar
npx shadcn@latest add calendar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast

# Criar arquivo .env
echo "VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000" > .env

# Configurar backend
echo "📦 Configurando backend..."
cd ../backend
npm install

# Criar arquivo .env
echo "NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=equipment_management
DB_USER=postgres
DB_PASS=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d" > .env

# Configurar banco de dados com Docker
echo "🐋 Configurando Docker..."
docker-compose up -d

# Aguardar banco de dados inicializar
echo "⏳ Aguardando banco de dados inicializar..."
sleep 10

# Executar migrações
echo "🔄 Executando migrações do banco de dados..."
npx sequelize-cli db:migrate

# Criar usuário admin inicial
echo "👤 Criando usuário admin inicial..."
npx sequelize-cli db:seed:all

echo "✅ Setup concluído!"
echo "
Para iniciar o sistema:

1. Inicie o backend:
   cd backend && npm run dev

2. Em outro terminal, inicie o frontend:
   cd frontend && npm run dev

Acesse: http://localhost:5173
Login: admin@example.com
Senha: admin123"