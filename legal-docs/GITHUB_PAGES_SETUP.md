# GitHub Pages Setup Guide for Legal Documents

This guide covers **TWO OPTIONS** for hosting your legal documents on GitHub Pages for TikTok Developer Portal.

> 💡 **TIP:** If your project is already on GitHub, use **OPTION 1** (host in existing repo) - it's much easier!

---

## 🎯 **OPTION 1: Host in Your Existing Project Repository** ⭐ (Recommended)

This is the easiest option if you already have your project on GitHub.

### Files Location
Create a `/docs` folder in your project root and place:
- `docs/privacy-policy.md`
- `docs/terms-of-service.md`
- `docs/index.md`

### Enable GitHub Pages
1. Go to your **main project repository** on GitHub
2. Click **"Settings"** → **"Pages"**
3. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/docs` ⚠️ **Select `/docs`, not root**
4. Click **"Save"**

### Your URLs Will Be:
```
https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy
https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service
```

See the main setup guide in `docs/GITHUB_PAGES_SETUP.md` for detailed instructions.

---

## 🎯 **OPTION 2: Separate Repository** (Alternative)

### Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `video-scheduler-legal` (or any name you prefer)
4. Description: "Legal documents for Videotto Scheduler"
5. Make it **Public** (required for free GitHub Pages)
6. **Do NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

## Step 2: Upload Files to Repository

### Option A: Using GitHub Web Interface

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop these files from the `legal-docs` folder:
   - `index.md`
   - `privacy-policy.md`
   - `terms-of-service.md`
   - `README.md` (optional)
3. Scroll down and click **"Commit changes"**

### Option B: Using Git Command Line

```bash
# Navigate to the legal-docs folder
cd legal-docs

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Add legal documents"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/video-scheduler-legal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top right of repository page)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **"Save"**

## Step 4: Wait for GitHub Pages to Deploy

- GitHub Pages typically takes 1-2 minutes to deploy
- You'll see a message: "Your site is published at `https://YOUR_USERNAME.github.io/video-scheduler-legal/`"
- The green checkmark indicates successful deployment

## Step 5: Verify Your URLs

After deployment, verify these URLs work (replace `YOUR_USERNAME` with your GitHub username):

- Homepage: `https://YOUR_USERNAME.github.io/video-scheduler-legal/`
- Privacy Policy: `https://YOUR_USERNAME.github.io/video-scheduler-legal/privacy-policy`
- Terms of Service: `https://YOUR_USERNAME.github.io/video-scheduler-legal/terms-of-service`

GitHub Pages automatically converts `.md` files to HTML, so `/privacy-policy` works the same as `/privacy-policy.md`.

## Step 6: Add URLs to TikTok Developer Portal

1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Navigate to your app settings
3. Find the fields for:
   - **Privacy Policy URL**
   - **Terms of Service URL**
4. Enter your GitHub Pages URLs:
   - Privacy Policy: `https://YOUR_USERNAME.github.io/video-scheduler-legal/privacy-policy`
   - Terms of Service: `https://YOUR_USERNAME.github.io/video-scheduler-legal/terms-of-service`
5. Save your changes

## Troubleshooting

### URLs Return 404

- Wait a few minutes after enabling GitHub Pages
- Check that files are in the `main` branch
- Verify file names are exactly: `privacy-policy.md` and `terms-of-service.md`
- Clear your browser cache

### GitHub Pages Not Deploying

- Check repository Settings → Pages to see if there are any error messages
- Verify the repository is Public (required for free GitHub Pages)
- Check Actions tab for deployment errors

### Need to Update Documents

1. Edit the `.md` files in your repository
2. Commit and push changes
3. GitHub Pages will automatically rebuild (takes 1-2 minutes)
4. Changes will be live at the same URLs

## Customization

### Update Contact Information

Edit these files to add your contact details:
- `privacy-policy.md` - Replace `[Your Contact Email]` and `[Your Support URL]`
- `terms-of-service.md` - Replace `[Your Contact Email]` and `[Your Support URL]`

### Add Custom Domain (Optional)

If you have a custom domain:
1. Add a `CNAME` file to your repository with your domain name
2. Configure DNS records as instructed by GitHub
3. Update URLs in TikTok Developer Portal

## Security Note

Since these are public documents on GitHub Pages, avoid including:
- Personal addresses
- Private contact information (use a support email instead)
- Sensitive business information

---

**Next Steps:**
1. ✅ Create GitHub repository
2. ✅ Upload legal documents
3. ✅ Enable GitHub Pages
4. ✅ Add URLs to TikTok Developer Portal
5. ✅ Start using your TikTok scheduler!

