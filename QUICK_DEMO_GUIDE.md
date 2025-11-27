# Quick Demo Mode Guide 🎬

Demo mode lets you test the complete TikTok scheduler **without TikTok API credentials**!

---

## ✅ **How to Enable Demo Mode**

### Option 1: Automatic (Recommended)
Just **don't add** TikTok credentials to your `.env` file. Demo mode activates automatically!

### Option 2: Explicit Flag
Add to `backend/.env`:
```env
DEMO_MODE=true
```

---

## 🚀 **What Works in Demo Mode**

### ✅ Complete User Flow

1. **Connect TikTok Account**
   - Click "Connect TikTok Account"
   - No redirect to TikTok
   - Shows "Connected" after 1-2 seconds
   - Mock tokens stored in database

2. **Upload Video**
   - Select video file
   - Upload works normally
   - Shows success message

3. **Publish Video**
   - Check "Post Now"
   - Click "Save post"
   - Shows "Uploading..." toast
   - Shows "Published successfully!" toast
   - Post appears as "posted"

---

## 📝 **Backend `.env` File (Demo Mode)**

For demo mode, your `backend/.env` only needs:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./data/scheduler.db
FRONTEND_URL=http://localhost:3000

# Don't add TikTok credentials - demo mode activates automatically!
# TIKTOK_CLIENT_KEY=
# TIKTOK_CLIENT_SECRET=
```

---

## 🎯 **Testing the Demo**

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the flow:**
   - Register/Login
   - Click "Connect TikTok Account"
   - Wait 1-2 seconds → See "Connected!"
   - Create a post with video
   - Check "Post Now"
   - See success messages!

---

## 📊 **Console Output (Demo Mode)**

When you upload/publish videos, you'll see:

```
🎬 DEMO MODE: Simulating video upload and publish
  - Title: My Video
  - Caption: Check this out!
  - File: video.mp4 (5.23 MB)
  - Account: primary
```

---

## 🔄 **Switching to Real Mode Later**

When you get TikTok API credentials:

1. **Add to `.env`:**
   ```env
   TIKTOK_CLIENT_KEY=your_actual_key
   TIKTOK_CLIENT_SECRET=your_actual_secret
   TIKTOK_REDIRECT_URI=https://caldank.click/api/auth/tiktok/callback
   ```

2. **Remove demo connections:**
   - Disconnect TikTok account in UI
   - Reconnect (will use real TikTok OAuth)

3. **Restart backend**

---

## ✅ **Demo Mode Features**

- ✅ All UI features work
- ✅ Success/error messages
- ✅ Database storage
- ✅ Connection status
- ✅ Video upload (to your server)
- ✅ Post scheduling
- ✅ Calendar display

**Perfect for demos, testing, and development!** 🚀

