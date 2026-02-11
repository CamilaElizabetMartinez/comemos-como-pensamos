#!/bin/bash

echo "🚀 Configurando entorno de desarrollo..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar si MongoDB está instalado
echo "📦 Verificando MongoDB..."
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB ya está instalado${NC}"
else
    echo -e "${YELLOW}⚠  MongoDB no está instalado${NC}"
    echo "Instalando MongoDB Community Edition..."

    # Agregar repositorio de MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    sudo apt-get update
    sudo apt-get install -y mongodb-org

    # Iniciar y habilitar MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod

    echo -e "${GREEN}✓ MongoDB instalado y corriendo${NC}"
fi

# Verificar estado de MongoDB
if sudo systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✓ MongoDB está corriendo${NC}"
else
    echo -e "${RED}✗ MongoDB no está corriendo${NC}"
    echo "Iniciando MongoDB..."
    sudo systemctl start mongod
fi

# 2. Verificar si Redis está instalado
echo ""
echo "📦 Verificando Redis..."
if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✓ Redis ya está instalado${NC}"
else
    echo -e "${YELLOW}⚠  Redis no está instalado${NC}"
    echo "Instalando Redis..."

    sudo apt-get update
    sudo apt-get install -y redis-server

    # Configurar Redis para iniciar con el sistema
    sudo systemctl enable redis-server
    sudo systemctl start redis-server

    echo -e "${GREEN}✓ Redis instalado y corriendo${NC}"
fi

# Verificar estado de Redis
if sudo systemctl is-active --quiet redis-server; then
    echo -e "${GREEN}✓ Redis está corriendo${NC}"
else
    echo -e "${RED}✗ Redis no está corriendo${NC}"
    echo "Iniciando Redis..."
    sudo systemctl start redis-server
fi

# 3. Instalar dependencias de Node.js
echo ""
echo "📦 Instalando dependencias de Node.js..."
npm install

# 4. Instalar redis client para Node.js
echo ""
echo "📦 Instalando cliente Redis para Node.js..."
npm install redis

# 5. Crear archivo .env para desarrollo
echo ""
echo "📝 Configurando archivo .env..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Environment
NODE_ENV=development

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB - Development (Local)
MONGODB_URI=mongodb://localhost:27017/comemos-como-pensamos-dev

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
CACHE_TTL=300

# JWT
JWT_SECRET=dev_secret_change_in_production
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_FROM=noreply@comemoscomopensamos.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠  Recuerda configurar las variables de entorno en .env${NC}"
else
    echo -e "${YELLOW}⚠  Archivo .env ya existe, no se sobrescribió${NC}"
fi

# 6. Crear índices en MongoDB
echo ""
echo "📊 Creando índices en MongoDB..."
node src/scripts/createIndexes.js

# 7. Resumen
echo ""
echo "================================================"
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo "================================================"
echo ""
echo "Servicios corriendo:"
echo "  • MongoDB: mongodb://localhost:27017"
echo "  • Redis:   redis://localhost:6379"
echo ""
echo "Para iniciar el servidor:"
echo "  npm run dev"
echo ""
echo "Para verificar servicios:"
echo "  sudo systemctl status mongod"
echo "  sudo systemctl status redis-server"
echo ""
