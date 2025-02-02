#!/bin/bash

# Variáveis
INSTALL_DIR="/var/www/oss"
DOMAIN="oss.autoatende.com"
API_DOMAIN="oss-api.autoatende.com"

# Criar diretório de instalação
sudo mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Instalar dependências do sistema
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Configurar Nginx
sudo cp nginx/oss.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/oss.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Configurar SSL
sudo certbot --nginx -d $DOMAIN -d $API_DOMAIN --non-interactive --agree-tos --email seu-email@autoatende.com

# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Configurar Backend
cd backend
npm install
npm run build
pm2 start dist/index.js --name "oss-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Configurar Frontend
cd ../frontend
npm install
./setup-ui.sh
npm run build

# Ajustar permissões
sudo chown -R www-data:www-data $INSTALL_DIR
sudo chmod -R 755 $INSTALL_DIR

# Reiniciar Nginx
sudo systemctl restart nginx

echo "Instalação concluída!"
echo "Frontend: https://$DOMAIN"
echo "Backend: https://$API_DOMAIN"