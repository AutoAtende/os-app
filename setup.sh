#!/bin/bash

# Configurações
GITHUB_TOKEN="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"
INSTALL_DIR="/home/deploy/oss"
DB_NAME="os_app"
DB_USER="os_user"
DB_PASS="99pqcPmkKhQqu5Dw"

echo "Iniciando setup do sistema..."

# Resetar senha do postgres
echo "Alterando senha do usuário postgres..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Criar banco de dados
echo "Criando banco de dados..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
\c $DB_NAME
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
EOF

# Criar diretório e clonar repositório
echo "Clonando repositório..."
sudo -u deploy mkdir -p $INSTALL_DIR
cd /home/deploy
sudo -u deploy git clone https://${GITHUB_TOKEN}@github.com/AutoAtende/os-app.git oss
cd $INSTALL_DIR

# Configurar Redis no Docker
echo "Configurando Redis..."
sudo docker run --name redis-oss \
  -p 6379:6379 \
  --restart unless-stopped \
  -d redis:alpine

# Configurar arquivo .env do Backend
echo "Configurando .env do Backend..."
sudo -u deploy cat > $INSTALL_DIR/backend/.env << EOL
PORT=3000
NODE_ENV=production
API_URL=https://oss-api.autoatende.com
FRONTEND_URL=https://oss.autoatende.com
CORS_ORIGIN=https://oss.autoatende.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOL

# Configurar arquivo .env do Frontend
echo "Configurando .env do Frontend..."
sudo -u deploy cat > $INSTALL_DIR/frontend/.env << EOL
VITE_API_URL=https://oss-api.autoatende.com
VITE_WS_URL=wss://oss-api.autoatende.com
EOL

# Build do Frontend
echo "Instalando dependências e buildando Frontend..."
cd $INSTALL_DIR/frontend
sudo -u deploy npm install
sudo -u deploy npm run build

# Build e setup do Backend
echo "Instalando dependências e buildando Backend..."
cd $INSTALL_DIR/backend
sudo -u deploy npm install
sudo -u deploy npm run build

# Rodar migrations
echo "Executando migrations..."
cd $INSTALL_DIR/backend
sudo -u deploy npx sequelize-cli db:migrate

# Configurar Nginx
echo "Configurando Nginx..."
sudo cat > /etc/nginx/sites-available/oss-frontend << EOL
server {
    listen 80;
    server_name oss.autoatende.com;
    root $INSTALL_DIR/frontend/dist;
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

# Ativar sites no Nginx
sudo ln -s /etc/nginx/sites-available/oss-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/oss-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Configurar SSL
echo "Configurando SSL com Certbot..."
sudo certbot --nginx -d oss.autoatende.com -d oss-api.autoatende.com --non-interactive --agree-tos --email seu-email@dominio.com

# Configurar PM2
echo "Configurando PM2..."
cd $INSTALL_DIR/backend
sudo -u deploy npm install -g pm2
sudo -u deploy pm2 start dist/app.js --name "oss-backend"
sudo -u deploy pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy

# Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# Ajustar permissões
sudo chown -R deploy:deploy $INSTALL_DIR
sudo chmod -R 755 $INSTALL_DIR

echo "Setup concluído!"
echo "Frontend: https://oss.autoatende.com"
echo "Backend: https://oss-api.autoatende.com"
echo "Banco de dados '$DB_NAME' criado com usuário '$DB_USER'"
echo "Senha do postgres alterada para: postgres"
echo "Redis rodando na porta 6379"