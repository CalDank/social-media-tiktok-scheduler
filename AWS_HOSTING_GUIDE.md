# Complete AWS Hosting Guide for TikTok Scheduler

This guide will walk you through hosting your entire TikTok Scheduler application on AWS, step by step.

## 📋 Overview

We'll deploy:
- **Backend API**: EC2 instance (Node.js/Express)
- **Frontend**: S3 + CloudFront (React app)
- **Database**: RDS PostgreSQL (or keep SQLite for simplicity)
- **Video Storage**: S3 bucket
- **Domain & SSL**: Route 53 + Certificate Manager

---

## 🎯 Prerequisites

- [ ] AWS Account (free tier eligible)
- [ ] Domain name (optional but recommended)
- [ ] AWS CLI installed locally (optional, we'll use Console mostly)
- [ ] Basic knowledge of terminal/command line

---

## 📊 Architecture Overview

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│   CloudFront CDN (Frontend)     │
│   https://yourdomain.com        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   S3 Bucket (Frontend Files)    │
│   Static React Build            │
└─────────────────────────────────┘

             │ API Calls
             ▼
┌─────────────────────────────────┐
│   Application Load Balancer     │
│   (or direct to EC2)            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   EC2 Instance (Backend)        │
│   - Node.js API                 │
│   - PM2 Process Manager         │
│   - Nginx Reverse Proxy         │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│   RDS   │    │  S3 Bucket  │
│PostgreSQL│    │  (Videos)   │
└─────────┘    └─────────────┘
```

---

## 🚀 Step-by-Step Deployment

### **PART 1: Backend Deployment (EC2)**

#### Step 1.1: Launch EC2 Instance

1. **Go to EC2 Console:**
   - Log into AWS Console
   - Search for "EC2" and open it

2. **Launch Instance:**
   - Click "Launch Instance"
   - Name: `tiktok-scheduler-backend`

3. **Choose AMI:**
   - Select "Amazon Linux 2023" (or Ubuntu 22.04)

4. **Instance Type:**
   - For testing: `t3.micro` (free tier eligible)
   - For production: `t3.small` or larger

5. **Key Pair:**
   - Create new key pair or select existing
   - Download the `.pem` file (keep it safe!)
   - Name: `tiktok-scheduler-key`

6. **Network Settings:**
   - Create security group: `tiktok-scheduler-sg`
   - Add rules:
     - **SSH (22)**: Your IP only
     - **HTTP (80)**: 0.0.0.0/0
     - **HTTPS (443)**: 0.0.0.0/0
     - **Custom TCP (5000)**: 0.0.0.0/0 (or remove if using ALB)

7. **Configure Storage:**
   - Default 8GB is fine for testing

8. **Launch:**
   - Click "Launch Instance"
   - Wait for instance to be "Running"

#### Step 1.2: Connect to EC2 Instance

1. **Get Instance Details:**
   - Note the "Public IPv4 address" (e.g., `3.15.123.45`)

2. **SSH into Instance:**
   ```bash
   # On Mac/Linux
   ssh -i ~/path/to/tiktok-scheduler-key.pem ec2-user@YOUR_EC2_IP
   
   # On Windows (PowerShell or WSL)
   ssh -i C:\path\to\tiktok-scheduler-key.pem ec2-user@YOUR_EC2_IP
   ```

3. **First-time connection:**
   - If permission denied, fix key permissions:
     ```bash
     chmod 400 tiktok-scheduler-key.pem
     ```

#### Step 1.3: Install Required Software

```bash
# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Node.js 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version  # Should show v18.x.x

# Install Git
sudo yum install git -y  # Amazon Linux
# OR
sudo apt install git -y  # Ubuntu

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo yum install nginx -y  # Amazon Linux
# OR
sudo apt install nginx -y  # Ubuntu
```

#### Step 1.4: Clone and Setup Backend

```bash
# Clone your repository
cd ~
git clone https://github.com/YOUR_USERNAME/social-media-tiktok-scheduler.git
cd social-media-tiktok-scheduler/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Add this to `.env`:**
```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database (we'll set up RDS next, or use SQLite for now)
DB_PATH=./data/scheduler.db

# TikTok API Configuration
TIKTOK_CLIENT_KEY=aw5d18mvgthjsqy8
TIKTOK_CLIENT_SECRET=SFeNY4iLs38Ld11drqL3Mt8vZZKttYyL
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/auth/tiktok/callback

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-production-change-this

# AWS S3 Configuration
USE_S3_STORAGE=true
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-tiktok-scheduler-videos
# Leave access keys empty if using IAM role
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### Step 1.5: Create S3 Bucket for Videos

1. **Go to S3 Console:**
   - Search "S3" in AWS Console
   - Click "Create bucket"

2. **Configure Bucket:**
   - Name: `your-tiktok-scheduler-videos` (must be globally unique)
   - Region: `us-east-1` (or your preferred region)
   - **Uncheck** "Block all public access" (we'll set up private access)
   - Enable versioning (optional)
   - Enable encryption

3. **Create Bucket**

4. **Create IAM Role for EC2 (Recommended):**
   - Go to IAM Console → Roles → Create Role
   - Select "EC2" as service
   - Attach policy: `AmazonS3FullAccess` (or create custom policy for your bucket only)
   - Name: `tiktok-scheduler-ec2-role`
   - **Attach to EC2 Instance:**
     - EC2 Console → Select instance → Actions → Security → Modify IAM role
     - Select `tiktok-scheduler-ec2-role`

#### Step 1.6: Start Backend Application

```bash
# Start with PM2
pm2 start server.js --name tiktok-scheduler

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs tiktok-scheduler
```

#### Step 1.7: Configure Nginx as Reverse Proxy

```bash
# Edit Nginx config
sudo nano /etc/nginx/conf.d/tiktok-scheduler.conf
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;  # Replace with your domain or use EC2 IP for now

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for large file uploads
        client_max_body_size 500M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
    }
}
```

**Save and restart Nginx:**
```bash
# Test Nginx config
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

**Test backend:**
```bash
curl http://localhost/api/health
# Should return: {"status":"ok",...}
```

---

### **PART 2: Database Setup (RDS PostgreSQL - Optional)**

You can skip this and use SQLite if you want, but PostgreSQL is recommended for production.

#### Step 2.1: Create RDS PostgreSQL Instance

1. **Go to RDS Console:**
   - Search "RDS" in AWS Console
   - Click "Create database"

2. **Configuration:**
   - Engine: PostgreSQL
   - Version: Latest (15.x or 16.x)
   - Template: Free tier (or Production)

3. **Settings:**
   - DB instance identifier: `tiktok-scheduler-db`
   - Master username: `tiktok_admin`
   - Master password: (create strong password, save it!)

4. **Instance Configuration:**
   - DB instance class: `db.t3.micro` (free tier) or larger

5. **Storage:**
   - 20GB is fine (free tier: 20GB)

6. **Connectivity:**
   - VPC: Default
   - Public access: Yes (or configure VPC for better security)
   - Security group: Create new or use existing
   - Allow inbound from your EC2 security group

7. **Create Database**

8. **Wait for Status: Available** (5-10 minutes)

9. **Note the Endpoint:**
   - Something like: `tiktok-scheduler-db.xxxxx.us-east-1.rds.amazonaws.com`

#### Step 2.2: Update Backend to Use PostgreSQL

```bash
# On EC2, install PostgreSQL client library
npm install pg

# Update .env
nano .env
```

**Update database section:**
```env
# Database (PostgreSQL)
DB_TYPE=postgresql
DB_HOST=tiktok-scheduler-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres  # or create new database
DB_USER=tiktok_admin
DB_PASSWORD=your_password_here
```

You'll need to update `backend/database/db.js` to support PostgreSQL. For now, you can continue with SQLite.

---

### **PART 3: Frontend Deployment (S3 + CloudFront)**

#### Step 3.1: Build Frontend Locally

On your **local machine**:

```bash
cd frontend

# Update API URL in .env or create .env.production
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

# Build for production
npm run build

# Check build folder was created
ls build/
```

#### Step 3.2: Create S3 Bucket for Frontend

1. **Go to S3 Console:**
   - Create new bucket: `your-tiktok-scheduler-frontend`
   - Region: Same as backend
   - **Block all public access: OFF** (we'll make it public)
   - Enable static website hosting (we'll configure later)

2. **Upload Build Files:**
   ```bash
   # Install AWS CLI if not installed
   # Then from your local machine:
   aws s3 sync frontend/build/ s3://your-tiktok-scheduler-frontend --delete
   
   # OR use S3 Console:
   # - Select bucket
   # - Upload → Select all files from frontend/build/
   # - Upload
   ```

3. **Enable Static Website Hosting:**
   - S3 Console → Your bucket → Properties
   - Scroll to "Static website hosting"
   - Enable
   - Index document: `index.html`
   - Error document: `index.html`

4. **Set Bucket Policy:**
   - S3 Console → Permissions → Bucket policy
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-tiktok-scheduler-frontend/*"
       }
     ]
   }
   ```

5. **Test S3 URL:**
   - Properties → Static website hosting → Bucket website endpoint
   - Should be: `http://your-tiktok-scheduler-frontend.s3-website-us-east-1.amazonaws.com`
   - Visit in browser (should see your app)

#### Step 3.3: Create CloudFront Distribution

1. **Go to CloudFront Console:**
   - Click "Create distribution"

2. **Origin Settings:**
   - Origin domain: Select your S3 bucket (not the website endpoint, the bucket itself)
   - Origin path: Leave empty
   - Name: Auto-filled

3. **Default Cache Behavior:**
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Cache policy: CachingDisabled (for React Router to work)

4. **Settings:**
   - Price class: Use all edge locations
   - Alternate domain names (CNAMEs): `yourdomain.com` (if you have domain)
   - SSL certificate: Default CloudFront certificate (or custom if you have one)

5. **Create Distribution**

6. **Wait 5-15 minutes for deployment**

7. **Get Distribution URL:**
   - Something like: `d1234567890abc.cloudfront.net`
   - Test in browser

#### Step 3.4: Update Frontend API URL

If your API is on a different domain, update the frontend:

```bash
# Rebuild with correct API URL
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production
npm run build

# Upload again
aws s3 sync build/ s3://your-tiktok-scheduler-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

### **PART 4: Domain & SSL Setup**

#### Step 4.1: Request SSL Certificate (ACM)

1. **Go to Certificate Manager:**
   - Search "Certificate Manager"
   - Click "Request certificate"

2. **Request Public Certificate:**
   - Domain names:
     - `yourdomain.com`
     - `*.yourdomain.com` (for subdomains)
   - Validation: DNS validation (recommended)

3. **Add DNS Records:**
   - Copy the CNAME records provided
   - Add to your domain's DNS (wherever you manage DNS)

4. **Wait for Validation** (5-30 minutes)

#### Step 4.2: Update CloudFront with Custom Domain

1. **CloudFront Console:**
   - Select your distribution → Edit

2. **Alternate Domain Names:**
   - Add: `yourdomain.com`, `www.yourdomain.com`

3. **Custom SSL Certificate:**
   - Select your certificate from ACM

4. **Save Changes**

5. **Wait for deployment**

#### Step 4.3: Configure DNS (Route 53 or Your Registrar)

**If using Route 53:**
1. Route 53 → Hosted zones → Your domain
2. Create A record (Alias):
   - Name: `@` (or blank)
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select your distribution
   - Save

**If using external DNS:**
1. Create CNAME record:
   - Name: `@` or `yourdomain.com`
   - Value: `d1234567890abc.cloudfront.net`

---

### **PART 5: Final Configuration**

#### Step 5.1: Update Environment Variables

**On EC2, update `.env`:**
```bash
nano .env
```

Update:
```env
FRONTEND_URL=https://yourdomain.com
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/auth/tiktok/callback
```

**Restart backend:**
```bash
pm2 restart tiktok-scheduler
```

#### Step 5.2: Update TikTok Developer Portal

1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Update redirect URI: `https://yourdomain.com/api/auth/tiktok/callback`
3. Update official website: `https://yourdomain.com`

---

## ✅ Testing Your Deployment

### Test Backend:
```bash
curl https://yourdomain.com/api/health
# Should return: {"status":"ok",...}
```

### Test Frontend:
- Visit: `https://yourdomain.com`
- Should load your React app
- Try logging in
- Try connecting TikTok

### Test API:
```bash
# Register user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🔧 Troubleshooting

### Backend Not Accessible
- Check security group allows HTTP/HTTPS
- Check PM2 is running: `pm2 status`
- Check Nginx: `sudo systemctl status nginx`
- Check logs: `pm2 logs tiktok-scheduler`

### Frontend Shows API Errors
- Check CORS settings in backend
- Verify `FRONTEND_URL` in backend `.env`
- Check CloudFront distribution is deployed
- Clear browser cache

### Database Connection Issues
- Check RDS security group allows EC2
- Verify connection string in `.env`
- Check RDS is publicly accessible (if needed)

---

## 💰 Cost Estimation

**Free Tier (First 12 Months):**
- EC2 t3.micro: 750 hours/month free
- RDS t3.micro: 750 hours/month free
- S3: 5GB storage free
- Data transfer: 1GB/month free

**After Free Tier (Approximate Monthly):**
- EC2 t3.small: ~$15/month
- RDS db.t3.micro: ~$15/month
- S3 storage: ~$1-5/month (depends on usage)
- CloudFront: ~$1-10/month (depends on traffic)
- Data transfer: ~$5-20/month

**Total: ~$40-65/month** for small-scale deployment

---

## 🎉 You're Done!

Your TikTok Scheduler is now live on AWS! 🚀

**Next Steps:**
- [ ] Monitor CloudWatch logs
- [ ] Set up automated backups
- [ ] Configure auto-scaling (if needed)
- [ ] Set up monitoring alerts
- [ ] Test TikTok integration

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Need Help?** Check the existing documentation:
- `backend/AWS_DEPLOYMENT.md` - Additional AWS details
- `AWS_S3_SETUP.md` - S3 configuration details

