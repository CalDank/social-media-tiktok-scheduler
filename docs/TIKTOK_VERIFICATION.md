# TikTok Site Verification Setup

This file explains how to verify your URL prefix in TikTok Developer Portal using the site verification file.

## Verification File

The TikTok site verification file is included in the `/docs` folder:
- **Filename**: `tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`
- **Content**: `tiktok-developers-site-verification=ZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre`

## Purpose

This file is required by TikTok Developer Portal to verify that you own the domain/URL prefix where your legal documents are hosted.

## How to Verify It's Working

After GitHub Pages is enabled and deployed:

1. **Check the file is accessible:**
   - Visit: `https://YOUR_USERNAME.github.io/REPO_NAME/tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`
   - You should see the verification code displayed

2. **Verify in TikTok Developer Portal:**
   - Go to [TikTok Developer Portal](https://developers.tiktok.com/)
   - Navigate to your app settings
   - In the URL prefix verification section, TikTok will check for this file
   - If accessible, verification will pass automatically

## Troubleshooting

### File Not Accessible (404 Error)

- **Wait 2-3 minutes** after enabling GitHub Pages
- Check that the file is in the `/docs` folder and committed to GitHub
- Verify the filename is exactly: `tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt`
- Ensure GitHub Pages is using the `/docs` folder (not root)
- Clear your browser cache

### Verification Fails in TikTok Portal

- Double-check the URL prefix matches exactly (including `https://`)
- Ensure the file is accessible via the URL
- Make sure there are no extra characters or spaces in the URL
- Try accessing the file directly in a new incognito/private window

## File Location in Project

```
docs/
  ├── tiktokZITDEP8m7vgBnTFGtUfo0bLHfbzdBrre.txt  ← Verification file
  ├── privacy-policy.md
  ├── terms-of-service.md
  └── index.md
```

## What TikTok Checks

TikTok's system will:
1. Take your URL prefix (e.g., `https://username.github.io/repo-name/`)
2. Append the verification filename
3. Try to access it via HTTP
4. Verify the content matches the expected verification code

If all checks pass, your URL prefix will be verified! ✅

---

**Note:** This file must remain accessible at the same URL. Don't delete or move it after verification.

