# TikTok Real Integration Setup Guide

## ✅ Implementation Complete!

The real TikTok integration has been implemented. Here's what you need to do to make it work:

## Step 1: Get TikTok API Credentials

1. **Go to TikTok Developers Portal:**
   - Visit https://developers.tiktok.com/
   - Sign in with your TikTok account

2. **Create an Application:**
   - Click "Create an app"
   - Fill in app details
   - Select scopes: `user.info.basic`, `video.upload`, `video.publish`
   - Set redirect URI: `http://localhost:5000/api/auth/tiktok/callback`

3. **Get Your Credentials:**
   - Copy your **Client Key**
   - Copy your **Client Secret**

## Step 2: Update Environment Variables

Edit `backend/.env` and add your TikTok credentials:

```env
TIKTOK_CLIENT_KEY=your_actual_client_key_here
TIKTOK_CLIENT_SECRET=your_actual_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:5000/api/auth/tiktok/callback
```

## Step 3: Restart Backend Server

```bash
cd backend
npm start
```

## Step 4: Connect Your TikTok Account

1. **In the frontend:**
   - Click the TikTok icon in the top bar
   - You'll be redirected to TikTok to authorize the app
   - After authorization, you'll be redirected back

2. **Verify Connection:**
   - The TikTok icon should show as connected
   - You can now schedule posts!

## How It Works

### Video Upload Flow:
1. User selects video file in the post form
2. Video is uploaded to your server (`/api/upload/video`)
3. Server uploads video to TikTok and gets `video_id`
4. Video file is stored locally (or you can configure cloud storage)
5. When post is scheduled, the video is published to TikTok

### Posting Flow:
1. Scheduler checks for due posts every minute
2. For each due post:
   - Gets valid access token (refreshes if needed)
   - Uses stored video file path
   - Calls TikTok API to publish
   - Updates post status (posted/failed)

### OAuth Flow:
1. User clicks "Connect TikTok"
2. Redirected to TikTok authorization page
3. User authorizes the app
4. TikTok redirects back with authorization code
5. Backend exchanges code for access/refresh tokens
6. Tokens stored in database

## API Endpoints Added

### Authentication:
- `GET /api/auth/tiktok/login` - Get TikTok OAuth URL
- `GET /api/auth/tiktok/callback` - Handle OAuth callback
- `GET /api/auth/tiktok/status` - Check connection status
- `DELETE /api/auth/tiktok/disconnect` - Disconnect account

### Upload:
- `POST /api/upload/video` - Upload video file
- `DELETE /api/upload/video/:filename` - Delete uploaded video

## Important Notes

⚠️ **TikTok API Requirements:**
- Your TikTok account must be a Business or Content Creator account
- Videos must be uploaded as files (not URLs)
- Maximum video size: 500MB
- API has rate limits

⚠️ **Token Management:**
- Access tokens expire (typically 24 hours)
- Refresh tokens are used automatically
- Tokens are stored securely in the database

⚠️ **Video Storage:**
- Videos are stored in `backend/uploads/videos/`
- Consider using cloud storage (S3, etc.) for production
- Videos are kept until post is published (or manually deleted)

## Testing

1. **Test OAuth:**
   ```bash
   # Get auth URL (requires authentication)
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/auth/tiktok/login
   ```

2. **Test Video Upload:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "video=@/path/to/video.mp4" \
     -F "account=primary" \
     -F "title=Test Video" \
     http://localhost:5000/api/upload/video
   ```

3. **Test Post Creation:**
   - Use the frontend to create a post
   - Select a video file
   - Schedule it
   - Wait for the scheduled time
   - Check TikTok to see if it posted!

## Troubleshooting

**"TikTok account not connected" error:**
- Make sure you've completed OAuth flow
- Check connection status: `GET /api/auth/tiktok/status`

**"Token expired" error:**
- Token refresh should happen automatically
- If it fails, disconnect and reconnect your account

**"Video upload failed" error:**
- Check video file size (max 500MB)
- Check video format (TikTok supports common video formats)
- Check TikTok API status

**"Failed to publish" error:**
- Check TikTok API logs
- Verify your account has posting permissions
- Check if video was uploaded successfully

## Production Considerations

1. **Use HTTPS:** OAuth requires HTTPS in production
2. **Cloud Storage:** Store videos in S3/Cloud Storage instead of local filesystem
3. **Error Monitoring:** Set up error tracking (Sentry, etc.)
4. **Rate Limiting:** Implement rate limiting for API calls
5. **Video Cleanup:** Automatically delete videos after posting
6. **Backup:** Backup database regularly
7. **Security:** Use environment variables, never commit secrets

## Next Steps

- [ ] Get TikTok API credentials
- [ ] Update `.env` file
- [ ] Test OAuth connection
- [ ] Test video upload
- [ ] Test scheduled posting
- [ ] Set up production environment
- [ ] Configure cloud storage
- [ ] Set up monitoring

Your TikTok scheduler is now ready for real posting! 🎉

