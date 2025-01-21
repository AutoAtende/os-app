#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Configurações
GITHUB_TOKEN="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"
REPO_URL="https://github.com/AutoAtende/os-app.git"
INSTALL_DIR="/home/deploy/oss"
FRONTEND_DIR="$INSTALL_DIR/frontend"
BACKEND_DIR="$INSTALL_DIR/backend"
DB_USER="equipment_user"
DB_NAME="equipment_management"

echo -e "${GREEN}Iniciando setup do sistema...${NC}"

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro: $1${NC}"
        exit 1
    fi
}

# Reset da senha do postgres
echo -e "${GREEN}Configurando senha do PostgreSQL...${NC}"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
check_error "Falha ao alterar senha do postgres"

# Criação dos diretórios
echo -e "${GREEN}Criando diretórios...${NC}"
sudo -u deploy mkdir -p $INSTALL_DIR
check_error "Falha ao criar diretório de instalação"

# Clone do repositório
echo -e "${GREEN}Clonando repositório...${NC}"
cd $INSTALL_DIR
sudo -u deploy git clone https://lucassaud:${GITHUB_TOKEN}@github.com/AutoAtende/os-app.git .
check_error "Falha ao clonar repositório"

# Criação do banco de dados PostgreSQL
echo -e "${GREEN}Criando banco de dados...${NC}"
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
check_error "Falha ao criar banco de dados"

# Configuração do Redis no Docker
echo -e "${GREEN}Configurando Redis...${NC}"
sudo docker run --name equipment-redis \
  -p 6379:6379 \
  --restart unless-stopped \
  -d redis:alpine
check_error "Falha ao iniciar container Redis"

# Configuração do Nginx
echo -e "${GREEN}Configurando Nginx...${NC}"
sudo cat > /etc/nginx/sites-available/oss-frontend << EOL
server {
    listen 80;
    server_name oss.autoatende.com;
    root $FRONTEND_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOL

sudo cat > /etc/nginx/sites-available/oss-backend << EOL
server {
    listen 80;
    server_name oss-api.autoatende.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

# Ativa os sites no Nginx
sudo ln -s /etc/nginx/sites-available/oss-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/oss-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Certbot
echo -e "${GREEN}Configurando SSL com Certbot...${NC}"
sudo certbot --nginx -d oss.autoatende.com -d oss-api.autoatende.com --non-interactive --agree-tos --email seu-email@dominio.com
check_error "Falha ao configurar SSL"

# Configuração dos arquivos .env
echo -e "${GREEN}Configurando arquivos de ambiente...${NC}"
sudo -u deploy cat > $BACKEND_DIR/.env << EOL
PORT=3000
NODE_ENV=production
API_URL=https://oss-api.autoatende.com
FRONTEND_URL=https://oss.autoatende.com
CORS_ORIGIN=https://oss.autoatende.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=sua_senha_segura

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOL

sudo -u deploy cat > $FRONTEND_DIR/.env << EOL
VITE_API_URL=https://oss-api.autoatende.com
VITE_WS_URL=wss://oss-api.autoatende.com
EOL

# Build do Frontend
echo -e "${GREEN}Configurando Frontend...${NC}"
cd $FRONTEND_DIR
sudo -u deploy npm install
sudo -u deploy npm run build
check_error "Falha no build do frontend"

# Setup do Backend
echo -e "${GREEN}Configurando Backend...${NC}"
cd $BACKEND_DIR
sudo -u deploy npm install
check_error "Falha na instalação das dependências do backend"

# Migrations
sudo -u deploy npx sequelize-cli db:migrate
check_error "Falha nas migrations"

# Configuração do PM2
echo -e "${GREEN}Configurando PM2...${NC}"
sudo -u deploy npm install -g pm2
sudo -u deploy pm2 start src/app.js --name "oss-backend"
sudo -u deploy pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
check_error "Falha na configuração do PM2"

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
check_error "Falha ao recarregar Nginx"

# Permissões finais
sudo chown -R deploy:deploy $INSTALL_DIR
sudo chmod -R 755 $INSTALL_DIR

echo -e "${GREEN}Setup concluído com sucesso!${NC}"
echo -e "${GREEN}Frontend: https://oss.autoatende.com${NC}"
echo -e "${GREEN}Backend: https://oss-api.autoatende.com${NC}"

# Mostra senhas geradas
echo -e "${GREEN}Informações importantes:${NC}"
echo "Senha PostgreSQL (usuário postgres): postgres"
echo "Usuário BD aplicação: $DB_USER"
echo "Senha BD aplicação: sua_senha_segura"
echo "Verifique o arquivo .env para outras configurações"