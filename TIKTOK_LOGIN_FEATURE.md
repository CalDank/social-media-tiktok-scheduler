# TikTok Login Feature Guide

## Overview

The TikTok login feature allows users to connect their TikTok accounts to the scheduler so they can post videos directly to TikTok. This feature includes:

- **OAuth 2.0 Integration**: Secure authentication with TikTok's API
- **Connection Management**: Connect/disconnect TikTok accounts
- **Status Display**: Visual indicators showing connection status
- **Error Handling**: Clear error messages and feedback

## Features

### 1. TikTok Connection Component
Located in `frontend/src/components/TikTokConnection.js`, this component provides:
- Connection status checking
- Connect button to initiate OAuth flow
- Disconnect button to remove connection
- Connection information display (connected date, token expiration)
- Error handling and user feedback

### 2. Connection Status in UI
- **Header**: TikTok icon with connection indicator (green dot when connected)
- **Sidebar**: Connection status and management panel
- **Modal**: Full connection management interface accessible from header

### 3. OAuth Flow Handling
- Automatic redirect handling after TikTok authorization
- Success/error toast notifications
- Clean URL management after OAuth callback

## How to Use

### For Users

#### Connecting Your TikTok Account

1. **Via Header Icon**:
   - Click the TikTok icon in the top right header
   - A modal will open with connection options
   - Click "Connect TikTok Account"
   - You'll be redirected to TikTok to authorize the app
   - After authorization, you'll be redirected back
   - A success message will confirm the connection

2. **Via Sidebar**:
   - Click "Manage" next to the TikTok connection status
   - Use the "Connect TikTok Account" button
   - Follow the same OAuth flow

#### Disconnecting Your TikTok Account

1. Open the TikTok connection modal (click TikTok icon in header)
2. Click the "Disconnect" button
3. Confirm the disconnection
4. Your account will be disconnected and you won't be able to post

### Connection Status Indicators

- **Connected**: Green dot on TikTok icon + "Connected" badge in modal
- **Not Connected**: Gray TikTok icon without indicator
- **Token Expired**: Connection will be marked as invalid, automatic refresh will be attempted

## Technical Details

### Backend Endpoints

The feature uses these backend endpoints:

- `GET /api/auth/tiktok/login?account=primary` - Get OAuth authorization URL
- `GET /api/auth/tiktok/callback` - Handle OAuth callback (redirected by TikTok)
- `GET /api/auth/tiktok/status?account=primary` - Check connection status
- `DELETE /api/auth/tiktok/disconnect?account=primary` - Disconnect account

### OAuth Flow

1. User clicks "Connect TikTok Account"
2. Frontend calls `/api/auth/tiktok/login` to get authorization URL
3. User is redirected to TikTok authorization page
4. User authorizes the app
5. TikTok redirects to `/api/auth/tiktok/callback` with authorization code
6. Backend exchanges code for access/refresh tokens
7. Tokens are stored in database
8. User is redirected back to frontend with success status
9. Frontend displays success message and updates connection status

### Token Management

- Access tokens are automatically refreshed when expired
- Refresh tokens are used to obtain new access tokens
- Tokens are stored securely in the database
- Token expiration dates are tracked and displayed

## Setup Requirements

### 1. TikTok API Credentials

You need to set up TikTok API credentials:

1. Go to [TikTok Developers Portal](https://developers.tiktok.com/)
2. Create a new application
3. Get your Client Key and Client Secret
4. Set redirect URI: `http://localhost:5000/api/auth/tiktok/callback` (for development)

### 2. Environment Variables

Add to `backend/.env`:

```env
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:5000/api/auth/tiktok/callback
FRONTEND_URL=http://localhost:3000
```

For production, update the redirect URI to your production domain.

### 3. Database

The `platform_connections` table stores TikTok connections:
- `user_id`: User who owns the connection
- `platform`: Always 'tiktok'
- `account_name`: Account identifier (e.g., 'primary')
- `access_token`: TikTok access token
- `refresh_token`: Token for refreshing access token
- `token_expires_at`: When the access token expires
- `refresh_expires_at`: When the refresh token expires
- `connected_at`: When the connection was established

## Troubleshooting

### "TikTok Client Key not configured"
- Make sure `TIKTOK_CLIENT_KEY` is set in `backend/.env`
- Restart the backend server after adding environment variables

### "TikTok account not connected"
- User hasn't completed OAuth flow
- Connection was disconnected
- Check connection status via the UI or API

### "Failed to connect TikTok account"
- Check TikTok API credentials
- Verify redirect URI matches TikTok app settings
- Check backend logs for detailed error messages
- Ensure TikTok app has required scopes: `user.info.basic`, `video.upload`, `video.publish`

### "Token expired" or Authentication Errors
- Tokens are automatically refreshed when possible
- If refresh fails, user needs to reconnect
- Check token expiration dates in connection status

### OAuth Callback Not Working
- Verify redirect URI in TikTok app settings matches `TIKTOK_REDIRECT_URI`
- Check that `FRONTEND_URL` is set correctly
- Ensure backend is running and accessible
- Check browser console for errors

## Testing

### Manual Testing Steps

1. **Test Connection Flow**:
   - Click TikTok icon in header
   - Click "Connect TikTok Account"
   - Complete OAuth authorization
   - Verify success message appears
   - Check that connection status shows as connected

2. **Test Disconnection**:
   - Open connection modal
   - Click "Disconnect"
   - Confirm disconnection
   - Verify status updates to disconnected

3. **Test Status Display**:
   - Check header icon shows green dot when connected
   - Check sidebar shows connection status
   - Verify connection info displays correctly

4. **Test Error Handling**:
   - Try connecting without TikTok credentials configured
   - Try connecting with invalid credentials
   - Verify error messages display correctly

### Using cURL

```bash
# Check connection status (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/tiktok/status?account=primary

# Get OAuth URL
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/tiktok/login?account=primary

# Disconnect (requires auth token)
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/tiktok/disconnect?account=primary
```

## Security Considerations

1. **Token Storage**: Tokens are stored in the database, not in localStorage
2. **OAuth State**: State parameter is used to prevent CSRF attacks
3. **HTTPS Required**: OAuth requires HTTPS in production
4. **Token Refresh**: Automatic token refresh prevents service interruption
5. **Access Control**: Users can only manage their own connections

## Future Enhancements

Potential improvements:
- Multiple TikTok account support
- Connection status webhook notifications
- Account switching interface
- Connection analytics
- Batch account management
- Token expiration warnings

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify TikTok API credentials are correct
3. Ensure all environment variables are set
4. Check TikTok Developer Portal for API status
5. Review OAuth flow documentation

---

**Note**: This feature requires a TikTok Business or Creator account with API access enabled. Personal accounts may not have access to the posting API.
