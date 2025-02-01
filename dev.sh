#!/bin/bash

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "🚫 Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Iniciar serviços do Docker
echo "🐋 Iniciando serviços Docker..."
docker-compose up -d

# Verificar status dos containers
echo "🔍 Verificando status dos serviços..."
sleep 5

if [ "$(docker inspect -f {{.State.Health.Status}} equipment-postgres)" != "healthy" ]; then
    echo "⚠️  PostgreSQL não está saudável. Verificando logs:"
    docker logs equipment-postgres
    exit 1
fi

if [ "$(docker inspect -f {{.State.Health.Status}} equipment-redis)" != "healthy" ]; then
    echo "⚠️  Redis não está saudável. Verificando logs:"
    docker logs equipment-redis
    exit 1
fi

# Iniciar backend
echo "🚀 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 5

# Iniciar frontend
echo "🚀 Iniciando frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Função para limpeza ao encerrar
cleanup() {
    echo "🛑 Encerrando serviços..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    docker-compose down
    exit 0
}

# Registrar função de limpeza
trap cleanup SIGINT SIGTERM

# Manter script rodando
echo "✅ Sistema iniciado!"
echo "
Frontend: http://localhost:5173
Backend: http://localhost:3000
PostgreSQL: localhost:5432
Redis: localhost:6379

Pressione Ctrl+C para encerrar todos os serviços.
"

wait