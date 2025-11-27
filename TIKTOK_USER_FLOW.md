# TikTok Scheduler - Complete User Flow

This document describes the complete user journey from homepage to posting videos on TikTok.

---

## 📱 **Step 1: Homepage - Scheduler UI**

**URL:** `https://caldank.click`

**What User Sees:**
- TikTok Content Calendar homepage
- Calendar view with scheduled posts
- Sidebar with post list
- TikTok connection status indicator
- "Create Post" button or click on calendar date

**Current Implementation:**
- `frontend/src/App.js` - Main calendar interface
- Shows scheduled posts in calendar grid
- Displays TikTok connection status via `TikTokConnection` component

---

## 🔗 **Step 2: Connect TikTok Account**

**Action:** User clicks **"Connect TikTok Account"** button

**Location:** 
- Sidebar component (`frontend/src/components/Sidebar.js`)
- TikTok Connection component (`frontend/src/components/TikTokConnection.js`)

**What Happens:**
1. Frontend calls: `GET /api/auth/tiktok/login`
2. Backend generates OAuth URL with scopes: `user.info.basic,video.upload,video.publish`
3. User is redirected to TikTok authorization page

**Code Reference:**
- `backend/routes/auth.js` line 96-109
- `frontend/src/components/TikTokConnection.js` line 47-67

**User Message Displayed:**
*"I'm now connecting my TikTok account using TikTok Login Kit."*

---

## 🔐 **Step 3: TikTok OAuth Authorization Screen**

**URL:** `https://www.tiktok.com/v2/auth/authorize/`

**What User Sees:**
- TikTok login page (if not logged in)
- Permission request screen showing:
  - ✅ **user.info.basic** - Access to basic user information
  - ✅ **video.upload** - Upload videos to TikTok
  - ✅ **video.publish** - Publish videos to TikTok

**User Action:**
- Click **"Authorize"** button

**Backend Configuration:**
```javascript
const scope = 'user.info.basic,video.upload,video.publish';
```

**Code Reference:**
- `backend/routes/auth.js` line 105

---

## ✅ **Step 4: OAuth Callback - Redirect Back to App**

**Callback URL:** `https://caldank.click/api/auth/tiktok/callback`

**What Happens:**
1. TikTok redirects user back with authorization code
2. Backend receives callback at `/api/auth/tiktok/callback`
3. Backend exchanges authorization code for access token:
   - Calls: `POST https://open.tiktokapis.com/v2/oauth/token/`
   - Receives: `access_token`, `refresh_token`, expiration times
4. Backend stores tokens in database (`platform_connections` table)
5. Backend redirects user to frontend: `https://caldank.click/auth/tiktok?success=true`

**Frontend Response:**
- Success message displayed: **"Success – TikTok Connected"**
- Toast notification shown
- Connection status updated to "Connected"

**Code Reference:**
- `backend/routes/auth.js` line 111-186
- `frontend/src/App.js` line 104-141 (handles callback URL params)

**Backend Logs Should Show:**
```
TikTok OAuth callback received
Token exchange successful
Storing tokens in database
Redirecting to frontend
```

---

## 🎬 **Step 5: Upload Video Through UI**

### 5.1: Open Post Creation Modal

**Action:** User clicks calendar date or "Create Post" button

**What Opens:**
- Post Modal (`frontend/src/components/PostModal.js`)
- Form fields:
  - Video file upload
  - Caption textarea
  - Date/time picker
  - Account selector (if multiple TikTok accounts)

### 5.2: Select Video File

**Action:** User clicks "Upload Video" button

**What Happens:**
- File picker opens (accepts: `.mp4`, `.mov`, `.avi`, etc.)
- User selects local MP4 file
- File is shown in preview

**Implementation:**
- `frontend/src/components/PostModal.js` - File input handling

### 5.3: Add Caption

**Action:** User types caption in textarea

**Field:** Caption/Description for the TikTok post

### 5.4: Click "Send to TikTok" or "Schedule Post"

**What Happens:**

#### A. If "Post Now":
1. Frontend calls: `POST /api/upload/video`
   - Sends video file via FormData
   - Includes: `video`, `account`, `title` (caption)
2. Backend uploads video to TikTok:
   - Calls `uploadVideoToTikTok()` function
   - Initializes upload: `POST /v2/post/publish/video/init/`
   - Uploads video file: `PUT {upload_url}`
   - Returns `publish_id`
3. Backend publishes immediately:
   - Calls `POST /v2/post/publish/` with `publish_id` and caption
4. Success messages shown:
   - ✅ "Video uploaded successfully"
   - ✅ "Video published successfully"

#### B. If "Schedule Post":
1. Frontend uploads video: `POST /api/upload/video`
   - Gets back `videoId` (publish_id) and `filePath`
2. Frontend creates scheduled post: `POST /api/posts`
   - Stores: video info, caption, scheduled time, status="scheduled"
3. Backend cron job (runs every minute):
   - Checks for due posts
   - Calls `postToTikTok()` function
   - Publishes video at scheduled time
   - Updates post status to "posted"

**Code Reference:**
- `frontend/src/services/api.js` line 128-153 (upload API)
- `frontend/src/App.js` line 203-252 (save post handler)
- `backend/routes/upload.js` line 47-143 (video upload endpoint)
- `backend/services/tiktokService.js` line 102-208 (upload to TikTok)
- `backend/services/tiktokService.js` line 213-283 (publish to TikTok)
- `backend/services/scheduler.js` (cron job for scheduled posts)

**Console Logs/Toast Messages:**
```javascript
✅ "Video uploaded successfully"
✅ "Video published successfully" (if post now)
✅ "Post scheduled successfully" (if scheduled)
```

---

## 📊 **Flow Diagram**

```
┌─────────────────────────────────────┐
│  1. Homepage (caldank.click)       │
│     - Calendar UI                   │
│     - Connect TikTok button         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Click "Connect TikTok Account"  │
│     GET /api/auth/tiktok/login      │
│     → Redirect to TikTok OAuth      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. TikTok OAuth Screen             │
│     Permissions:                    │
│     - user.info.basic               │
│     - video.upload                  │
│     - video.publish                 │
│     → Click "Authorize"             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Callback                        │
│     /api/auth/tiktok/callback       │
│     → Exchange code for tokens      │
│     → Store in database             │
│     → Redirect to frontend          │
│     → Show "Success" message        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Upload Video                    │
│     a. Select video file            │
│     b. Add caption                  │
│     c. Click "Send to TikTok"       │
│        POST /api/upload/video       │
│        → Upload to TikTok           │
│        → Get video_id               │
│        → Publish (if post now)      │
│        → OR Schedule (if later)     │
└─────────────────────────────────────┘
```

---

## 🔍 **API Endpoints Used**

### Authentication:
- `GET /api/auth/tiktok/login` - Get OAuth URL
- `GET /api/auth/tiktok/callback` - Handle OAuth callback
- `GET /api/auth/tiktok/status` - Check connection status

### Video Upload:
- `POST /api/upload/video` - Upload video file
  - Body: `FormData` with `video`, `account`, `title`
  - Returns: `{ videoId, filePath, success }`

### Posting:
- `POST /api/posts` - Create scheduled post
- Backend automatically publishes at scheduled time

---

## 📝 **Required Permissions (Scopes)**

The app requests these TikTok permissions:

1. **user.info.basic**
   - Access to basic user profile information
   - Used to identify connected TikTok account

2. **video.upload**
   - Upload video files to TikTok servers
   - Required for posting videos

3. **video.publish**
   - Publish uploaded videos to TikTok
   - Required for making videos live

**Code Location:** `backend/routes/auth.js:105`

---

## ✅ **Verification Checklist**

To verify the complete flow is working:

- [ ] Homepage loads at `https://caldank.click`
- [ ] "Connect TikTok Account" button is visible
- [ ] Clicking button redirects to TikTok OAuth page
- [ ] Permissions are shown: `user.info.basic`, `video.upload`, `video.publish`
- [ ] After authorization, redirects back to app
- [ ] "Success – TikTok Connected" message appears
- [ ] Connection status shows "Connected"
- [ ] Can open post creation modal
- [ ] Can upload video file (MP4)
- [ ] Can add caption
- [ ] "Send to TikTok" button works
- [ ] Video uploads successfully
- [ ] Video publishes successfully (if post now)
- [ ] Post schedules successfully (if scheduled)
- [ ] Console shows success messages

---

## 🐛 **Troubleshooting**

### Issue: "TikTok account not connected"
**Solution:** Complete OAuth flow again

### Issue: Video upload fails
**Check:**
- TikTok account is connected
- Video file format is supported (MP4, MOV, etc.)
- Video size is under 500MB
- Backend logs for error details

### Issue: Post doesn't publish
**Check:**
- Access token is valid (auto-refreshed)
- Video was uploaded successfully
- Scheduled time has passed (if scheduled)
- Backend cron job is running

---

**Last Updated:** Based on current implementation  
**Status:** ✅ All features implemented

