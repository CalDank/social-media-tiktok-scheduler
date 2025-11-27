# AWS Quick Start Guide - FREE Deployment 💰

This guide deploys your TikTok Scheduler on AWS **for FREE** using the AWS Free Tier! Perfect for getting started quickly with minimal setup.

## 🎯 Simple Architecture (Quick Start)

- **Backend**: Single EC2 instance
- **Frontend**: Same EC2 instance (Nginx serves static files)
- **Database**: SQLite (no RDS needed)
- **Storage**: S3 for videos (optional)

---

## ⚡ Quick Deployment Steps

### 1. Launch EC2 Instance (FREE!)

1. EC2 Console → Launch Instance
2. **AMI**: Amazon Linux 2023
3. **Instance**: ⚠️ **t3.micro** - Make sure it shows "**Free tier eligible**" badge
   - This gives you 750 hours/month FREE (enough for 24/7!)
4. **Key Pair**: Create new key pair, download `.pem` file
5. **Security Group**: Allow SSH (22), HTTP (80), HTTPS (443)
6. Launch

**Cost: $0/month** (first 12 months)

### 2. Connect and Install

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install Git, PM2, Nginx
sudo yum update -y
sudo yum install git nginx -y
sudo npm install -g pm2
```

### 3. Clone and Setup

```bash
# Clone repo
cd ~
git clone https://github.com/YOUR_USERNAME/social-media-tiktok-scheduler.git
cd social-media-tiktok-scheduler

# Setup backend
cd backend
npm install

# Create .env
nano .env
```

**Minimal `.env`:**
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_IP
JWT_SECRET=your-secret-key
DB_PATH=./data/scheduler.db
TIKTOK_CLIENT_KEY=aw5d18mvgthjsqy8
TIKTOK_CLIENT_SECRET=SFeNY4iLs38Ld11drqL3Mt8vZZKttYyL
TIKTOK_REDIRECT_URI=http://YOUR_EC2_IP/api/auth/tiktok/callback
```

### 4. Build Frontend

```bash
cd ../frontend

# Update API URL
echo "REACT_APP_API_URL=http://YOUR_EC2_IP/api" > .env.production

# Build
npm install
npm run build
```

### 5. Configure Nginx

```bash
sudo nano /etc/nginx/conf.d/tiktok-scheduler.conf
```

**Add:**
```nginx
server {
    listen 80;
    server_name YOUR_EC2_IP;

    # Frontend
    root /home/ec2-user/social-media-tiktok-scheduler/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 500M;
    }
}
```

**Start services:**
```bash
# Start backend
cd ~/social-media-tiktok-scheduler/backend
pm2 start server.js --name backend
pm2 save
pm2 startup  # Follow instructions

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Test

Visit: `http://YOUR_EC2_IP`

You're done! 🎉

---

## 🔒 Add HTTPS Later

1. Request certificate in Certificate Manager
2. Configure Nginx with SSL
3. Update environment variables

See full guide for details.

---

**Time to deploy: ~30-45 minutes**  
**Cost: $0/month** (AWS Free Tier - first 12 months)

---

## 💰 **Staying FREE**

### Free Tier Limits:
- ✅ **EC2 t3.micro**: 750 hours/month (FREE)
- ✅ **S3 Storage**: 5GB (FREE)
- ✅ **Data Transfer**: 100GB/month outbound (FREE)

### Tips:
- ⚠️ Always use **t3.micro** (not t3.small)
- ⚠️ Set up **billing alerts** in AWS Console
- ⚠️ Monitor usage in Billing Dashboard
- ⚠️ Delete unused resources regularly

**See `AWS_FREE_TIER_GUIDE.md` for complete free tier tips!**

