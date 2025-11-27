# AWS Deployment Guide

## Overview

This guide covers deploying your TikTok Scheduler to AWS with S3 for video storage.

## Architecture Recommendations

### Option 1: Simple EC2 Deployment
- **EC2 Instance**: Run Node.js backend
- **S3 Bucket**: Store video files
- **RDS (PostgreSQL)**: Replace SQLite with PostgreSQL
- **CloudFront**: CDN for frontend (optional)
- **Route 53**: Domain name (optional)

### Option 2: Serverless (Advanced)
- **Lambda**: Backend API functions
- **API Gateway**: REST API
- **S3 Bucket**: Video storage
- **DynamoDB**: Database
- **CloudFront**: Frontend hosting
- **EventBridge**: Scheduled posting (replaces node-cron)

## Step 1: Set Up S3 Bucket

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-tiktok-scheduler-videos --region us-east-1
   ```

2. **Configure Bucket:**
   - Enable versioning (optional)
   - Set lifecycle policy to delete old videos after 30 days
   - Block public access (keep videos private)
   - Enable encryption

3. **Create IAM Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-tiktok-scheduler-videos/*"
       }
     ]
   }
   ```

## Step 2: Configure Environment Variables

Update your `.env` file or use AWS Systems Manager Parameter Store:

```env
# AWS Configuration
USE_S3_STORAGE=true
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-tiktok-scheduler-videos
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Or use IAM role (recommended for EC2)
# Leave AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY empty
```

## Step 3: Install AWS SDK

The AWS SDK is already added to `package.json`. Install it:

```bash
cd backend
npm install
```

## Step 4: Database Migration (SQLite → PostgreSQL)

For production, use PostgreSQL instead of SQLite:

1. **Create RDS PostgreSQL Instance:**
   - Go to AWS RDS Console
   - Create PostgreSQL database
   - Note connection details

2. **Update Database Connection:**
   - Install `pg` package: `npm install pg`
   - Update `database/db.js` to use PostgreSQL
   - Run migrations

3. **Environment Variables:**
   ```env
   DB_TYPE=postgresql
   DB_HOST=your-rds-endpoint.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=tiktok_scheduler
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

## Step 5: Deploy Backend to EC2

1. **Launch EC2 Instance:**
   - Choose Amazon Linux 2 or Ubuntu
   - Instance type: t3.small or larger
   - Security group: Allow HTTP (80), HTTPS (443), and your app port (5000)

2. **Install Dependencies:**
   ```bash
   # SSH into EC2
   ssh -i your-key.pem ec2-user@your-ec2-ip

   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18

   # Clone your repository
   git clone your-repo-url
   cd social-media-tiktok-scheduler/backend

   # Install dependencies
   npm install
   ```

3. **Set Up Environment:**
   ```bash
   # Create .env file
   nano .env
   # Add all your environment variables
   ```

4. **Set Up IAM Role (Recommended):**
   - Attach IAM role to EC2 instance with S3 permissions
   - Remove AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from .env
   - AWS SDK will use IAM role automatically

5. **Run Application:**
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start server.js --name tiktok-scheduler
   pm2 save
   pm2 startup
   ```

6. **Set Up Nginx (Reverse Proxy):**
   ```bash
   sudo yum install nginx
   
   # Edit /etc/nginx/conf.d/tiktok-scheduler.conf
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

## Step 6: Deploy Frontend

### Option A: S3 + CloudFront (Static Hosting)

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync build/ s3://your-frontend-bucket --delete
   ```

3. **Set Up CloudFront:**
   - Create CloudFront distribution
   - Origin: Your S3 bucket
   - Enable HTTPS
   - Set default root object: `index.html`

### Option B: EC2 (Same Server)

1. **Build and Copy:**
   ```bash
   cd frontend
   npm run build
   scp -r build/* ec2-user@your-ec2-ip:/var/www/html/
   ```

2. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
       }
   }
   ```

## Step 7: Set Up HTTPS (SSL Certificate)

1. **Use AWS Certificate Manager:**
   - Request certificate for your domain
   - Validate domain ownership

2. **Update CloudFront/ALB:**
   - Attach certificate
   - Force HTTPS redirect

## Step 8: Monitoring & Logging

1. **CloudWatch Logs:**
   ```bash
   # Install CloudWatch agent
   wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
   sudo rpm -U ./amazon-cloudwatch-agent.rpm
   ```

2. **Set Up Alarms:**
   - CPU utilization
   - Memory usage
   - Error rates
   - S3 bucket size

## Step 9: Backup & Disaster Recovery

1. **Database Backups:**
   - Enable automated RDS snapshots
   - Set retention period

2. **S3 Versioning:**
   - Enable versioning on S3 bucket
   - Set lifecycle policies

3. **Application Code:**
   - Use Git for version control
   - Tag releases

## Cost Optimization

### S3 Storage:
- Use S3 Standard for active videos
- Move to S3 Glacier for archived videos (after 30 days)
- Set lifecycle policies

### EC2:
- Use Reserved Instances for predictable workloads
- Use Spot Instances for non-critical workloads
- Auto-scaling based on load

### Database:
- Use RDS with automated backups
- Consider Aurora Serverless for variable workloads

## Security Best Practices

1. **IAM Roles:**
   - Use IAM roles instead of access keys
   - Principle of least privilege

2. **Secrets Management:**
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly

3. **Network Security:**
   - Use VPC with private subnets
   - Security groups with minimal access
   - WAF for API protection

4. **Encryption:**
   - Encrypt S3 buckets
   - Use HTTPS everywhere
   - Encrypt RDS at rest

## Environment Variables Summary

```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Database (PostgreSQL)
DB_TYPE=postgresql
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tiktok_scheduler
DB_USER=your_username
DB_PASSWORD=your_password

# AWS S3
USE_S3_STORAGE=true
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-tiktok-scheduler-videos
# Use IAM role instead of keys if possible

# TikTok API
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=https://your-domain.com/api/auth/tiktok/callback

# JWT
JWT_SECRET=your-super-secret-jwt-key-production
```

## Testing Deployment

1. **Test S3 Upload:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "video=@test-video.mp4" \
     http://your-api-domain.com/api/upload/video
   ```

2. **Check S3 Bucket:**
   ```bash
   aws s3 ls s3://your-tiktok-scheduler-videos/videos/
   ```

3. **Monitor Logs:**
   ```bash
   pm2 logs tiktok-scheduler
   ```

## Troubleshooting

**S3 Upload Fails:**
- Check IAM permissions
- Verify bucket name and region
- Check AWS credentials

**Database Connection Issues:**
- Verify security group allows connections
- Check RDS endpoint
- Verify credentials

**Scheduler Not Running:**
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs`
- Verify cron is working

## Next Steps

- [ ] Set up CI/CD pipeline (GitHub Actions, AWS CodePipeline)
- [ ] Implement auto-scaling
- [ ] Set up monitoring dashboards
- [ ] Configure backup strategies
- [ ] Set up staging environment
- [ ] Implement blue-green deployments

Your TikTok Scheduler is now ready for AWS production deployment! 🚀

