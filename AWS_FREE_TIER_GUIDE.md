# AWS Free Tier Hosting Guide - Deploy for FREE! 💰

Yes! AWS offers a **Free Tier** that can host your TikTok Scheduler for **FREE** (or very cheap) for the first 12 months, and some services are **always free**.

---

## 🎉 AWS Free Tier Overview

### **12-Month Free Tier** (New AWS Accounts)
- **EC2**: 750 hours/month of t2.micro or t3.micro instances
- **RDS**: 750 hours/month of db.t2.micro or db.t3.micro
- **S3**: 5GB storage + 20,000 GET requests + 2,000 PUT requests
- **CloudFront**: 50GB data transfer out + 2,000,000 HTTP/HTTPS requests
- **Lambda**: 1 million requests/month
- **Data Transfer**: 100GB/month outbound

### **Always Free Tier** (Even After 12 Months)
- **Lambda**: 1 million requests/month
- **S3**: 5GB storage (with limitations)
- **CloudWatch**: 10 custom metrics + 1GB log ingestion
- **CodeCommit**: 5 users, 50GB storage, 10,000 requests/month

---

## 💰 **FREE Deployment Options**

### **Option 1: Completely FREE (12 Months)** ⭐ Recommended

Perfect for getting started without any cost!

**Architecture:**
```
EC2 t3.micro (Free) → Backend + Frontend
SQLite Database (Free) → No RDS needed
S3 (5GB Free) → Video storage
```

**Cost: $0/month** for first 12 months

**Limitations:**
- Single server (not highly available)
- Limited to 750 hours/month (but that's 24/7 coverage!)
- 5GB S3 storage
- t3.micro has limited CPU/memory

**Setup Time:** ~45 minutes

**Guide:** See `AWS_QUICK_START.md` for step-by-step instructions

---

### **Option 2: Mostly FREE (12 Months)**

Add database for production-ready setup.

**Architecture:**
```
EC2 t3.micro (Free) → Backend
RDS db.t3.micro (Free) → PostgreSQL
S3 (5GB Free) → Video storage
S3 + CloudFront (Free tier) → Frontend hosting
```

**Cost: ~$0-5/month** for first 12 months (only if you exceed free tier)

**Benefits:**
- Production-ready database
- Better performance with PostgreSQL
- Scalable frontend hosting

---

### **Option 3: Always FREE (After 12 Months)**

Minimal-cost setup that stays cheap forever.

**Architecture:**
```
EC2 t2.micro (Spot Instance ~$3-5/month)
OR
AWS Lightsail ($3.50/month - not free but very cheap)
SQLite Database (Free)
S3 (5GB Always Free)
```

**Cost: $3-5/month** after free tier expires

**Or use Lightsail:**
- Lightsail: $3.50/month for nano instance
- Includes: 512MB RAM, 1 vCPU, 20GB SSD, 1TB transfer

---

## 📊 **Cost Comparison**

| Option | First 12 Months | After 12 Months |
|--------|----------------|-----------------|
| **Option 1** (EC2 + SQLite) | **$0** | ~$8-10/month |
| **Option 2** (EC2 + RDS + S3) | **$0** | ~$25-30/month |
| **Option 3** (Lightsail) | **$3.50/month** | **$3.50/month** |
| **Option 4** (Spot Instances) | **$0** | ~$3-5/month |

---

## 🚀 **Quick Start: FREE Deployment**

### **Step 1: Create AWS Account**

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Use a **credit card** (won't be charged if you stay within free tier)
4. Verify phone number and email
5. **Important:** Select "Basic Support - Free"

### **Step 2: Launch FREE EC2 Instance**

1. **EC2 Console** → Launch Instance
2. **AMI**: Amazon Linux 2023 (free tier eligible)
3. **Instance Type**: **t3.micro** ⚠️ Make sure it shows "Free tier eligible"
4. **Key Pair**: Create new, download `.pem` file
5. **Security Group**: Allow SSH (22), HTTP (80), HTTPS (443)
6. Launch

**Cost: $0** (750 hours/month free = 24/7 coverage!)

### **Step 3: Follow Quick Start Guide**

See `AWS_QUICK_START.md` for complete setup instructions.

**Total Setup Time:** ~45 minutes  
**Cost:** $0

---

## ⚠️ **Avoid Charges: Best Practices**

### **1. Always Use Free Tier Eligible Services**

✅ **Use:**
- EC2: t2.micro or t3.micro (not t3.small or larger)
- RDS: db.t2.micro or db.t3.micro
- S3: Standard storage (not Glacier)

❌ **Avoid:**
- Larger instance sizes
- Multiple instances (unless needed)
- Reserved Instances (paid upfront)
- Elastic IPs (charged if not attached)

### **2. Set Up Billing Alerts**

1. **Billing Console** → Preferences
2. Enable "Receive Billing Alerts"
3. **CloudWatch** → Alarms → Create Alarm
4. Select "Billing" metric
5. Set threshold: $1.00
6. Add email notification

**Get notified if you're about to be charged!**

### **3. Monitor Your Usage**

**Check Free Tier Usage:**
- Billing Console → Free Tier
- See what services you're using
- Track remaining free tier benefits

### **4. Clean Up Unused Resources**

**Common mistakes that cause charges:**
- Stopped instances still using EBS storage
- Unused Elastic IPs
- Old S3 buckets with files
- Snapshots and AMIs

**Monthly cleanup:**
```bash
# List all instances (including stopped)
aws ec2 describe-instances

# Delete unused snapshots
aws ec2 describe-snapshots --owner-ids self

# Clean up old S3 objects
aws s3 ls
```

---

## 💡 **Tips to Stay FREE**

### **1. Use t3.micro (Not t3.small)**

- t3.micro: **FREE** (free tier)
- t3.small: ~$15/month
- Always check "Free tier eligible" badge

### **2. Single Instance Setup**

- Run everything on one EC2 instance
- Backend + Frontend + Database (SQLite)
- No RDS needed for small projects

### **3. Use S3 Infrequent Access**

After free tier:
- S3 Standard: $0.023/GB/month
- S3 Infrequent Access: $0.0125/GB/month
- Save 50% if videos aren't accessed often

### **4. Monitor S3 Storage**

- Free tier: 5GB
- After: First 50GB = $1.15/month
- Delete old videos after posting
- Set up lifecycle policies

### **5. Use CloudWatch Logs Wisely**

- Free: 5GB ingestion, 5GB storage
- After: $0.50/GB ingestion
- Don't log everything
- Set retention periods

---

## 📈 **When to Upgrade**

### **Stay FREE if:**
- ✅ Low traffic (< 1000 users)
- ✅ Small videos (< 5GB total)
- ✅ Personal/small business use
- ✅ Testing/development

### **Upgrade when:**
- ❌ High traffic
- ❌ Need database backups (RDS)
- ❌ Need high availability
- ❌ Large video storage needs
- ❌ Production workloads

---

## 🎯 **Recommended FREE Setup**

### **For Testing/Learning:**
```
✅ EC2 t3.micro (Free)
✅ SQLite database (Free)
✅ S3 5GB (Free)
✅ No domain needed (use IP)
✅ HTTP only (no SSL needed for testing)

Cost: $0/month
```

### **For Production (Still FREE):**
```
✅ EC2 t3.micro (Free)
✅ RDS db.t3.micro (Free)
✅ S3 + CloudFront (Free tier)
✅ Certificate Manager (Free SSL)
✅ Route 53 (Optional, ~$0.50/month)

Cost: $0-1/month
```

---

## 📝 **Free Tier Checklist**

Before launching, verify:

- [ ] EC2 instance shows "Free tier eligible"
- [ ] Instance type is t2.micro or t3.micro
- [ ] Only launching 1 instance (not multiple)
- [ ] RDS (if used) is db.t2.micro or db.t3.micro
- [ ] S3 storage under 5GB
- [ ] Billing alerts configured
- [ ] Monitoring usage in Billing Console

---

## 🔄 **Free Tier Limits**

### **EC2 Free Tier:**
- ✅ 750 hours/month of t2.micro or t3.micro
- ✅ Enough for 1 instance running 24/7
- ✅ Multiple instances share the 750 hours

### **RDS Free Tier:**
- ✅ 750 hours/month of db.t2.micro or db.t3.micro
- ✅ 20GB storage included
- ✅ 20GB backup storage

### **S3 Free Tier:**
- ✅ 5GB storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests
- ✅ 15GB data transfer out

---

## 🆓 **Alternative: AWS Lightsail**

If you want a simpler, predictable cost option:

**Lightsail Plans:**
- **$3.50/month**: 512MB RAM, 1 vCPU, 20GB SSD, 1TB transfer
- **$5/month**: 1GB RAM, 1 vCPU, 40GB SSD, 2TB transfer

**Benefits:**
- Fixed monthly cost (no surprises)
- Easy setup (fewer steps)
- Includes everything (instance, storage, transfer)
- Still very cheap after free tier expires

**Perfect for:**
- Small projects
- Predictable budgets
- Simple deployments

---

## ✅ **Summary**

### **YES, You Can Deploy for FREE!**

✅ **First 12 Months:** $0/month  
✅ **After 12 Months:** $3-10/month (minimal)  
✅ **Use Free Tier:** EC2 t3.micro, S3, RDS (optional)  
✅ **Set Alerts:** Monitor billing  
✅ **Stay Within Limits:** Follow best practices  

**Start with the FREE option today!** 🚀

See `AWS_QUICK_START.md` for step-by-step FREE deployment instructions.

---

## 📚 **Resources**

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [Free Tier Usage Calculator](https://calculator.aws/)
- [Billing and Cost Management](https://console.aws.amazon.com/billing/)

---

**Questions?** Check the deployment guides:
- `AWS_QUICK_START.md` - Fast free deployment
- `AWS_HOSTING_GUIDE.md` - Full production setup

