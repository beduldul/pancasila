#!/bin/bash
set -e

echo "=========================================="
echo "Pancasila Edu Portal - Deploy Script"
echo "=========================================="

# Configuration
APP_DIR="/var/www/pancasila-edu"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="/var/log/pancasila"
DB_DIR="$BACKEND_DIR/prisma"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

# Create directories
echo "[1/8] Creating directories..."
mkdir -p "$APP_DIR" "$LOG_DIR" "$BACKEND_DIR/uploads" "$DB_DIR"

# Clone or pull code
echo "[2/8] Syncing code..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR && git pull
else
  echo "Please copy your project to $APP_DIR first"
  exit 1
fi

# Install backend dependencies
echo "[3/8] Installing backend dependencies..."
cd $BACKEND_DIR
npm ci --production

# Install frontend dependencies
echo "[4/8] Installing frontend dependencies..."
cd $FRONTEND_DIR
npm ci

# Build frontend
echo "[5/8] Building frontend..."
npm run build

# Setup database
echo "[6/8] Setting up database..."
cd $BACKEND_DIR
npx prisma generate
npx prisma db push
npx prisma db seed || echo "Seed skipped (run manually if needed)"

# Setup PM2
echo "[7/8] Configuring PM2..."
cd $APP_DIR/deployment
cp ecosystem.config.js $BACKEND_DIR/
npx pm2 delete pancasila-backend 2>/dev/null || true
npx pm2 start $BACKEND_DIR/ecosystem.config.js
npx pm2 save
npx pm2 startup

# Setup Nginx
echo "[8/8] Setting up Nginx..."
cp $APP_DIR/deployment/nginx.conf /etc/nginx/sites-available/pancasila-edu
ln -sf /etc/nginx/sites-available/pancasila-edu /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo "App URL: http://localhost (or your domain)"
echo "API URL: http://localhost/api"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all      - Restart app"
echo "  nginx -t            - Test nginx config"
echo "=========================================="
