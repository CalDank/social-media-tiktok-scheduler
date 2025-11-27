# Deploy Legal Documents to EC2

The static HTML files for Privacy Policy and Terms of Service have been created in the `frontend/public/` folder. Follow these steps to deploy them to your EC2 instance.

---

## ✅ **Step 1: Verify Files Were Created**

Check that the files exist locally:

```bash
ls frontend/public/privacy-policy.html
ls frontend/public/terms-of-service.html
```

Both commands should show the files.

---

## ✅ **Step 2: Commit and Push to GitHub**

If you're using Git:

```bash
git add frontend/public/privacy-policy.html frontend/public/terms-of-service.html
git commit -m "Add Privacy Policy and Terms of Service HTML files"
git push
```

---

## ✅ **Step 3: On EC2 - Pull Latest Changes**

SSH into your EC2 instance and pull the latest code:

```bash
cd ~/social-media-tiktok-scheduler
git pull
```

---

## ✅ **Step 4: Rebuild Frontend**

Files in the `public/` folder are automatically copied to the `build/` folder when you run `npm run build`. So rebuild the frontend:

```bash
# Load Node.js
source ~/.nvm/nvm.sh
nvm use 18

# Go to frontend directory
cd ~/social-media-tiktok-scheduler/frontend

# Rebuild
npm run build
```

Wait 1-2 minutes for the build to complete.

---

## ✅ **Step 5: Verify Files in Build Folder**

Check that the HTML files were copied to the build folder:

```bash
ls ~/social-media-tiktok-scheduler/frontend/build/privacy-policy.html
ls ~/social-media-tiktok-scheduler/frontend/build/terms-of-service.html
```

Both should exist.

---

## ✅ **Step 6: Restart Nginx (if needed)**

```bash
sudo systemctl restart nginx
```

---

## ✅ **Step 7: Test the URLs**

Your legal documents should now be accessible at:

- **Privacy Policy**: `http://100.26.135.56/privacy-policy.html`
- **Terms of Service**: `http://100.26.135.56/terms-of-service.html`

Or if you have a domain configured:
- **Privacy Policy**: `https://caldank.click/privacy-policy.html`
- **Terms of Service**: `https://caldank.click/terms-of-service.html`

---

## 🎯 **For TikTok Developer Portal**

Use these URLs in your TikTok Developer Portal:

- **Privacy Policy URL**: `https://caldank.click/privacy-policy.html`
- **Terms of Service URL**: `https://caldank.click/terms-of-service.html`

TikTok will accept these `.html` URLs!

---

## 📝 **Quick All-in-One Command**

If you want to do everything at once on EC2:

```bash
source ~/.nvm/nvm.sh && nvm use 18 && cd ~/social-media-tiktok-scheduler && git pull && cd frontend && npm run build && sudo systemctl restart nginx && echo "✅ Deployed! Test at:" && echo "http://100.26.135.56/privacy-policy.html" && echo "http://100.26.135.56/terms-of-service.html"
```

Wait 3-4 minutes for everything to complete.

---

**After deployment, test the URLs in your browser to make sure they work!**

