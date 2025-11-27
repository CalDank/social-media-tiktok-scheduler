# Demo Mode Setup 🎬

This guide explains how to run the TikTok Scheduler in **Demo Mode** without TikTok API credentials.

---

## 🎯 **What is Demo Mode?**

Demo mode simulates the complete TikTok integration flow without requiring:
- TikTok Developer Portal account
- TikTok Client Key & Secret
- Actual TikTok API calls

**Everything works exactly the same in the UI**, but operations are simulated.

---

## ✅ **How to Enable Demo Mode**

### Option 1: Automatic (No TikTok Credentials)

If you don't have `TIKTOK_CLIENT_KEY` in your `.env` file, demo mode activates automatically.

### Option 2: Explicit Flag

Add this to your `backend/.env` file:

```env
DEMO_MODE=true
```

---

## 🚀 **What Works in Demo Mode**

### ✅ TikTok Connection
- Click "Connect TikTok Account"
- Connection is simulated (no redirect to TikTok)
- Shows "Connected" status after 1-2 seconds
- Stores mock tokens in database

### ✅ Video Upload
- Upload video files through UI
- Shows "Uploading..." toast
- Simulates upload process (2 second delay)
- Returns success message

### ✅ Video Publishing
- Click "Post Now" to publish immediately
- Shows "Uploading video to TikTok..." toast
- Simulates upload and publish (2-3 second delay)
- Shows "Video published successfully!" toast

### ✅ Scheduled Posts
- Create scheduled posts
- Posts appear in calendar
- Status shows as "scheduled" or "posted"

---

## 📝 **Demo Mode Indicators**

### Console Logs:
```
🎬 DEMO MODE: Simulating video upload
  - Title: My Video
  - File: video.mp4 (5.23 MB)
  - Account: primary

🎬 DEMO MODE: Simulating video upload and publish
  - Title: My Video
  - Caption: Check this out!
  - File: video.mp4 (5.23 MB)
```

### API Responses:
- Responses include `"demo": true` flag
- Messages say "(Demo Mode)" in success messages

### UI:
- All UI elements work exactly the same
- Success/error messages appear as normal
- Connection status shows correctly

---

## 🔄 **Switching to Real Mode**

When you're ready to use the real TikTok API:

1. **Remove demo flag** (if you set it):
   ```env
   # Remove or comment out:
   # DEMO_MODE=true
   ```

2. **Add TikTok credentials** to `backend/.env`:
   ```env
   TIKTOK_CLIENT_KEY=your_actual_client_key
   TIKTOK_CLIENT_SECRET=your_actual_client_secret
   TIKTOK_REDIRECT_URI=https://caldank.click/api/auth/tiktok/callback
   ```

3. **Restart backend server**

4. **Reconnect TikTok account** (old demo connection won't work)

---

## 🎬 **Demo Flow Example**

### 1. Connect TikTok
```
User clicks "Connect TikTok Account"
→ Demo mode simulates connection
→ Shows "Connected" after 1 second
→ Mock tokens stored in database
```

### 2. Upload & Publish Video
```
User selects video file
User adds caption
User clicks "Post Now"
→ Shows "Uploading video to TikTok..." (blue toast)
→ Simulates upload (2 seconds)
→ Shows "Video published successfully!" (green toast)
→ Post appears in calendar as "posted"
```

### 3. View Console Logs
```
Backend console shows:
🎬 DEMO MODE: Simulating video upload and publish
  - Title: My Awesome Video
  - Caption: This is amazing!
  - File: video.mp4 (10.5 MB)
  - Account: primary
```

---

## 📊 **Database in Demo Mode**

Demo mode still uses the real database:
- Users are stored normally
- Posts are stored normally
- Platform connections store mock tokens (starting with `demo_`)
- Everything persists between restarts

---

## ⚠️ **Important Notes**

1. **Demo tokens don't work** with real TikTok API
   - When switching to real mode, disconnect and reconnect

2. **Video files are still uploaded** to your server
   - Files are saved locally (or S3 if configured)
   - Just not sent to TikTok

3. **All UI features work** exactly as they will in production
   - Perfect for testing and demos!

4. **No TikTok account needed** for demo mode
   - Great for development and presentations

---

## 🎯 **Perfect For**

- ✅ Development and testing
- ✅ UI/UX demonstrations
- ✅ Client presentations
- ✅ Testing before TikTok API approval
- ✅ Learning the flow before going live

---

**Demo mode makes it easy to test everything before getting TikTok API access! 🚀**

