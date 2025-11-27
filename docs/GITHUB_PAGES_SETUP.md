# GitHub Pages Setup Guide for Legal Documents

This guide covers **TWO OPTIONS** for hosting your legal documents on GitHub Pages for TikTok Developer Portal.

---

## 🎯 **OPTION 1: Host in Your Existing Project Repository** ⭐ (Recommended)

This is the **easiest** option if you already have your project on GitHub. Your legal documents will live alongside your code.

### Step 1: Files Are Already Created

The legal documents are already in the `/docs` folder:
- `docs/privacy-policy.md`
- `docs/terms-of-service.md`
- `docs/index.md`

### Step 2: Commit and Push to GitHub

If you haven't already, commit these files to your repository:

```bash
# Make sure you're in the root of your project
git add docs/
git commit -m "Add legal documents for TikTok Developer Portal"
git push
```

### Step 3: Enable GitHub Pages

1. Go to your **main project repository** on GitHub (e.g., `social-media-tiktok-scheduler`)
2. Click **"Settings"** (top right)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/docs` ⚠️ **Important: Select `/docs` folder, not root**
5. Click **"Save"**

### Step 4: Get Your URLs

After GitHub Pages deploys (1-2 minutes), your URLs will be:

**Format:**
```
https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy
https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service
```

**Example:** If your repo is `social-media-tiktok-scheduler` and your username is `johndoe`:
- Privacy Policy: `https://johndoe.github.io/social-media-tiktok-scheduler/privacy-policy`
- Terms of Service: `https://johndoe.github.io/social-media-tiktok-scheduler/terms-of-service`

### Step 4.5: TikTok Site Verification File ✅

A TikTok site verification file (`tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`) has been added to your `/docs` folder.

**Verify it's accessible:**
- URL: `https://YOUR_USERNAME.github.io/REPO_NAME/tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`
- It should display: `tiktok-developers-site-verification=ZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre`

This file is required for URL prefix verification in TikTok Developer Portal.

### Step 5: Add to TikTok Developer Portal

1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Navigate to your app settings
3. Add the URLs from Step 4
4. Save your changes

---

## 🎯 **OPTION 2: Separate Repository** (Alternative)

If you prefer a separate repository for legal documents, use this option.

### Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `video-scheduler-legal` (or any name you prefer)
4. Make it **Public** (required for free GitHub Pages)
5. **Do NOT** initialize with README
6. Click **"Create repository"**

### Step 2: Upload Files

#### Option A: Using GitHub Web Interface

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop files from the `legal-docs` folder:
   - `index.md`
   - `privacy-policy.md`
   - `terms-of-service.md`
3. Click **"Commit changes"**

#### Option B: Using Git Command Line

```bash
# Navigate to the legal-docs folder
cd legal-docs

# Initialize git repository
git init
git add .
git commit -m "Initial commit: Add legal documents"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/video-scheduler-legal.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)` ⚠️ **Select root, not `/docs`**
3. Click **"Save"**

### Step 4: Get Your URLs

Your URLs will be:
- Privacy Policy: `https://YOUR_USERNAME.github.io/video-scheduler-legal/privacy-policy`
- Terms of Service: `https://YOUR_USERNAME.github.io/video-scheduler-legal/terms-of-service`

---

## 🔍 Which Option Should I Choose?

### Choose **OPTION 1** (Existing Repo) if:
- ✅ Your project is already on GitHub
- ✅ You want everything in one place
- ✅ You want simpler URL structure
- ✅ You don't mind legal docs being in your main repo

### Choose **OPTION 2** (Separate Repo) if:
- ✅ You want to keep legal docs separate from code
- ✅ You might reuse the same legal docs for multiple projects
- ✅ You want a dedicated repository for legal documents

---

## ✅ Verification Checklist

After setting up, verify:

- [ ] GitHub Pages shows "Your site is published at..."
- [ ] Privacy Policy URL loads correctly in browser
- [ ] Terms of Service URL loads correctly in browser
- [ ] **TikTok verification file is accessible** (e.g., `https://YOUR_USERNAME.github.io/REPO_NAME/tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`)
- [ ] URLs are added to TikTok Developer Portal
- [ ] Contact information is updated in both documents

---

## 🔧 Troubleshooting

### URLs Return 404

- Wait 2-3 minutes after enabling GitHub Pages
- Check repository Settings → Pages for deployment status
- Verify file names are exactly: `privacy-policy.md` and `terms-of-service.md`
- For Option 1: Make sure you selected `/docs` folder, not root
- Clear browser cache

### GitHub Pages Not Deploying

- Check repository Settings → Pages for error messages
- Verify repository is **Public** (required for free GitHub Pages)
- Check Actions tab for deployment errors
- Ensure files are in the correct branch (`main` or `master`)

### Need to Update Documents

1. Edit the `.md` files in your repository
2. Commit and push changes
3. GitHub Pages will automatically rebuild (1-2 minutes)
4. Changes will be live at the same URLs

---

## 📝 Customization

### Update Contact Information

Before going live, edit these files and replace:
- `[Your Contact Email]` → Your actual email address
- `[Your Support URL]` → Your support page URL (optional)
- `[Your Jurisdiction]` → Your location for legal purposes

**Files to update:**
- `docs/privacy-policy.md` (or `legal-docs/privacy-policy.md`)
- `docs/terms-of-service.md` (or `legal-docs/terms-of-service.md`)

---

## 🔒 Security Notes

Since these documents are public:
- ✅ Use a support email, not a personal email
- ✅ Don't include physical addresses
- ✅ Don't include sensitive business information
- ✅ Keep contact information professional

---

## 🚀 Next Steps

1. ✅ Choose your hosting option (Option 1 recommended)
2. ✅ Update contact information in documents
3. ✅ Enable GitHub Pages
4. ✅ Add URLs to TikTok Developer Portal
5. ✅ Start connecting TikTok accounts!

---

**Questions?** Check the main setup documentation or contact support.

