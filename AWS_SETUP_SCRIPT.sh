#!/bin/bash

# AWS EC2 Setup Script for TikTok Scheduler
# Run this script AFTER connecting to your EC2 instance via SSH

echo "🚀 Starting TikTok Scheduler EC2 Setup..."
echo "=========================================="

# Update system
echo ""
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18 using NVM
echo ""
echo "📦 Installing Node.js 18..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify Node.js installation
echo ""
echo "✅ Node.js version:"
node --version
npm --version

# Install Git (if not already installed)
echo ""
echo "📦 Installing Git..."
sudo yum install git -y

# Install PM2 globally
echo ""
echo "📦 Installing PM2 (Process Manager)..."
sudo npm install -g pm2

# Install Nginx
echo ""
echo "📦 Installing Nginx..."
sudo yum install nginx -y

# Verify installations
echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo ""
echo "Installed versions:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  Git: $(git --version)"
echo "  Nginx: $(nginx -v 2>&1)"
echo ""
echo "Next steps:"
echo "  1. Run: git clone YOUR_REPO_URL"
echo "  2. Run: cd social-media-tiktok-scheduler/backend"
echo "  3. Run: npm install"
echo "  4. Create .env file (see AWS_QUICK_START.md)"
echo "=========================================="

