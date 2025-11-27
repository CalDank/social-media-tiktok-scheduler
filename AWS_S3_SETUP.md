# AWS S3 Bucket Setup Guide

## Overview

You'll need **TWO separate S3 buckets** for your TikTok Scheduler:

1. **Video Storage Bucket** - Stores uploaded video files
2. **Frontend Hosting Bucket** (Optional) - Hosts your React frontend

---

## Bucket 1: Video Storage Bucket

### Purpose
Stores video files that users upload before posting to TikTok.

### Bucket Name
Example: `tiktok-scheduler-videos` or `your-app-name-videos`

### What Goes In This Bucket
- **Video files only** - Uploaded by users through the app
- Files are organized by user ID: `videos/{userId}/{timestamp}-{random}.mp4`
- Videos are automatically uploaded when users create posts

### Setup Steps

1. **Create the Bucket:**
   ```bash
   aws s3 mb s3://tiktok-scheduler-videos --region us-east-1
   ```

2. **Configure Bucket Settings:**
   - **Versioning**: Enable (optional, for backup)
   - **Encryption**: Enable (SSE-S3 or SSE-KMS)
   - **Public Access**: Block ALL public access
   - **CORS**: Not needed (backend handles uploads)

3. **Set Lifecycle Policy:**
   - Delete videos older than 30 days (after posting)
   - Or move to Glacier for archival

4. **Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowAppUpload",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:role/your-ec2-role"
         },
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::tiktok-scheduler-videos/*"
       }
     ]
   }
   ```

5. **Update Your `.env`:**
   ```env
   USE_S3_STORAGE=true
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=tiktok-scheduler-videos
   ```

### File Structure in Bucket
```
tiktok-scheduler-videos/
├── videos/
│   ├── 1/                    # User ID 1
│   │   ├── 1703123456789-123456789.mp4
│   │   └── 1703123457890-987654321.mp4
│   ├── 2/                    # User ID 2
│   │   └── 1703123458901-456789123.mp4
│   └── ...
```

### Important Notes
- ✅ Videos are **private** (not publicly accessible)
- ✅ Backend downloads videos temporarily when posting to TikTok
- ✅ Videos can be deleted after successful posting
- ✅ Use lifecycle policies to auto-cleanup old videos

---

## Bucket 2: Frontend Hosting Bucket (Optional)

### Purpose
Hosts your React frontend as a static website.

### Bucket Name
Example: `tiktok-scheduler-frontend` or `your-app-name-web`

### What Goes In This Bucket
- **Build files from `frontend/build/` directory**
- All files from running `npm run build` in the frontend folder

### Setup Steps

1. **Create the Bucket:**
   ```bash
   aws s3 mb s3://tiktok-scheduler-frontend --region us-east-1
   ```

2. **Build Your Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Upload Build Files:**
   ```bash
   aws s3 sync build/ s3://tiktok-scheduler-frontend --delete
   ```

4. **Enable Static Website Hosting:**
   - Go to S3 Console → Your Bucket → Properties
   - Scroll to "Static website hosting"
   - Enable it
   - Set index document: `index.html`
   - Set error document: `index.html` (for React Router)

5. **Set Bucket Policy for Public Read:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::tiktok-scheduler-frontend/*"
       }
     ]
   }
   ```

6. **Unblock Public Access:**
   - Go to Permissions → Block public access
   - Uncheck "Block all public access"
   - Confirm

### File Structure in Bucket
```
tiktok-scheduler-frontend/
├── index.html
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   └── main.[hash].js
│   └── media/
│       └── ...
├── manifest.json
├── robots.txt
└── favicon.ico
```

### Important Notes
- ✅ This bucket is **publicly accessible** (for website hosting)
- ✅ Use CloudFront in front of it for better performance
- ✅ Update `REACT_APP_API_URL` in build to point to your backend

---

## Quick Setup Commands

### Video Storage Bucket
```bash
# Create bucket
aws s3 mb s3://tiktok-scheduler-videos --region us-east-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket tiktok-scheduler-videos \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket tiktok-scheduler-videos \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Frontend Hosting Bucket
```bash
# Create bucket
aws s3 mb s3://tiktok-scheduler-frontend --region us-east-1

# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://tiktok-scheduler-frontend --delete

# Enable static hosting
aws s3 website s3://tiktok-scheduler-frontend \
  --index-document index.html \
  --error-document index.html
```

---

## Recommended: Use CloudFront for Frontend

Instead of direct S3 hosting, use CloudFront CDN:

1. **Create CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Enable HTTPS
   - Set default root object: `index.html`
   - Add custom domain (optional)

2. **Benefits:**
   - Faster loading (CDN)
   - HTTPS/SSL
   - Custom domain
   - Better caching

---

## Cost Optimization

### Video Storage Bucket
- **S3 Standard**: For active videos (frequent access)
- **S3 Intelligent-Tiering**: Automatically moves to cheaper storage
- **Lifecycle Policy**: Delete after 30 days or move to Glacier

### Frontend Bucket
- **CloudFront**: Caches files, reduces S3 requests
- **Compression**: Enable gzip compression
- **Small files**: Very cheap to host

---

## Security Checklist

### Video Storage Bucket ✅
- [ ] Block all public access
- [ ] Enable encryption
- [ ] Use IAM roles (not access keys)
- [ ] Set up lifecycle policies
- [ ] Enable versioning (optional)

### Frontend Bucket ✅
- [ ] Only index.html and static assets
- [ ] Use CloudFront with HTTPS
- [ ] Set proper CORS if needed
- [ ] Enable CloudFront access logs

---

## Summary

**Video Storage Bucket:**
- Stores: User-uploaded video files
- Access: Private (backend only)
- Files: `videos/{userId}/{filename}.mp4`

**Frontend Hosting Bucket:**
- Stores: React build files (`frontend/build/`)
- Access: Public (for website)
- Files: `index.html`, `static/`, etc.

Both buckets serve different purposes and should be kept separate!





