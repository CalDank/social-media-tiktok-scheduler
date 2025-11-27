# TikTok Developer Portal - URL Configuration Guide

This guide shows you exactly what URLs to enter in TikTok Developer Portal.

## 📋 URLs to Enter

### Step 1: Determine Your GitHub Information

You need:
- **GitHub Username**: Your GitHub username (e.g., `johndoe`, `calvin123`)
- **Repository Name**: Your repo name (likely `social-media-tiktok-scheduler`)

### Step 2: Build Your URLs

**Format:**
```
https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy
https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service
```

**Replace:**
- `YOUR_USERNAME` → Your actual GitHub username
- `REPO_NAME` → Your repository name

---

## 📝 Example URLs

### Example 1: Standard Setup

If your GitHub username is `calvin` and repo is `social-media-tiktok-scheduler`:

**Privacy Policy URL:**
```
https://calvin.github.io/social-media-tiktok-scheduler/privacy-policy
```

**Terms of Service URL:**
```
https://calvin.github.io/social-media-tiktok-scheduler/terms-of-service
```

### Example 2: Different Username

If your GitHub username is `johndoe` and repo is `tiktok-scheduler`:

**Privacy Policy URL:**
```
https://johndoe.github.io/tiktok-scheduler/privacy-policy
```

**Terms of Service URL:**
```
https://johndoe.github.io/tiktok-scheduler/terms-of-service
```

---

## ✅ How to Find Your Exact URLs

### Method 1: Check GitHub Pages Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Look for the line: **"Your site is published at `https://...`"**
4. Use that base URL and add `/privacy-policy` and `/terms-of-service`

### Method 2: Check Your Repository URL

Your repository URL looks like:
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

Convert it to GitHub Pages format:
```
https://YOUR_USERNAME.github.io/REPO_NAME
```

Then add:
- `/privacy-policy` for Privacy Policy
- `/terms-of-service` for Terms of Service

### Method 3: Test After Deployment

After GitHub Pages is enabled:
1. Visit: `https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy`
2. If it loads → That's your Privacy Policy URL ✅
3. Visit: `https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service`
4. If it loads → That's your Terms of Service URL ✅

---

## 🔧 Entering URLs in TikTok Developer Portal

1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Navigate to your app
3. Go to **App Settings** or **Basic Information**
4. Find the fields:
   - **Privacy Policy URL**
   - **Terms of Service URL** (or **Terms of Use URL**)
5. Paste your URLs:
   ```
   Privacy Policy URL: https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy
   Terms of Service URL: https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service
   ```
6. Click **Save** or **Submit**

---

## ⚠️ Important Notes

### URL Format Requirements

- ✅ Must start with `https://` (not `http://`)
- ✅ No trailing slash at the end
- ✅ Use lowercase letters (GitHub Pages URLs are case-sensitive)
- ✅ Use hyphens (`-`) not underscores (`_`) if your repo has them

### Common Mistakes to Avoid

❌ **Wrong:**
```
http://yourusername.github.io/repo-name/privacy-policy/  ← http and trailing slash
```

✅ **Correct:**
```
https://yourusername.github.io/repo-name/privacy-policy  ← https, no trailing slash
```

❌ **Wrong:**
```
https://github.com/yourusername/repo-name/privacy-policy  ← Wrong domain
```

✅ **Correct:**
```
https://yourusername.github.io/repo-name/privacy-policy  ← Correct GitHub Pages domain
```

---

## 🧪 Testing Your URLs

Before submitting to TikTok, test your URLs:

1. **Test Privacy Policy:**
   - Open in browser: `https://YOUR_USERNAME.github.io/REPO_NAME/privacy-policy`
   - Should show the Privacy Policy page ✅

2. **Test Terms of Service:**
   - Open in browser: `https://YOUR_USERNAME.github.io/REPO_NAME/terms-of-service`
   - Should show the Terms of Service page ✅

3. **Test Verification File:**
   - Open in browser: `https://YOUR_USERNAME.github.io/REPO_NAME/tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`
   - Should show the verification code ✅

If all three load correctly, your URLs are ready for TikTok Developer Portal!

---

## 🆘 Troubleshooting

### URLs Return 404 Error

- Wait 2-3 minutes after enabling GitHub Pages
- Verify GitHub Pages is enabled (Settings → Pages)
- Check that you selected `/docs` folder (not root)
- Ensure files are committed and pushed to GitHub
- Try accessing the base URL first: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### TikTok Rejects URLs

- Make sure URLs start with `https://` (not `http://`)
- Remove any trailing slashes
- Verify the URLs work in your browser first
- Check that GitHub Pages deployment succeeded (green checkmark)

### Can't Find Your GitHub Username

1. Go to [GitHub.com](https://github.com)
2. Click your profile picture (top right)
3. Your username is shown in the dropdown menu
4. Or check any of your repository URLs

---

## 📝 Quick Reference Template

Fill in the blanks:

```
Privacy Policy URL:
https://[YOUR_USERNAME].github.io/[REPO_NAME]/privacy-policy

Terms of Service URL:
https://[YOUR_USERNAME].github.io/[REPO_NAME]/terms-of-service
```

**Your specific URLs:**
```
Privacy Policy URL: https://________.github.io/________/privacy-policy
Terms of Service URL: https://________.github.io/________/terms-of-service
```

---

Need help? Check:
- `GITHUB_PAGES_SETUP.md` - Full setup instructions
- `TIKTOK_VERIFICATION.md` - Verification file setup

