import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { dbGet, dbRun } from '../database/db.js';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(userId, account) {
  try {
    const connection = await dbGet(
      `SELECT refresh_token, refresh_expires_at FROM platform_connections 
       WHERE user_id = ? AND platform = 'tiktok' AND account_name = ?`,
      [userId, account]
    );

    if (!connection || !connection.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Check if refresh token is expired
    if (connection.refresh_expires_at && new Date(connection.refresh_expires_at) < new Date()) {
      throw new Error('Refresh token expired');
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    const response = await axios.post(
      `${TIKTOK_API_BASE}/oauth/token/`,
      new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data.data || !response.data.data.access_token) {
      throw new Error('Failed to refresh token');
    }

    const { access_token, refresh_token, expires_in, refresh_expires_in } = response.data.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
    const refreshExpiresAt = refresh_expires_in ? new Date(Date.now() + refresh_expires_in * 1000) : null;

    // Update tokens in database
    await dbRun(
      `UPDATE platform_connections 
       SET access_token = ?, refresh_token = ?, token_expires_at = ?, refresh_expires_at = ?
       WHERE user_id = ? AND platform = 'tiktok' AND account_name = ?`,
      [access_token, refresh_token, tokenExpiresAt.toISOString(), refreshExpiresAt?.toISOString() || null, userId, account]
    );

    return access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(userId, account) {
  const connection = await dbGet(
    `SELECT access_token, token_expires_at FROM platform_connections 
     WHERE user_id = ? AND platform = 'tiktok' AND account_name = ?`,
    [userId, account]
  );

  if (!connection || !connection.access_token) {
    throw new Error('No TikTok connection found');
  }

  // Check if token is expired or expires soon (within 5 minutes)
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
  if (expiresAt && expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    console.log('Token expired or expiring soon, refreshing...');
    return await refreshTikTokToken(userId, account);
  }

  return connection.access_token;
}

/**
 * Upload video to TikTok and get video_id
 */
export async function uploadVideoToTikTok(videoPath, accessToken, postInfo = {}) {
  try {
    // Step 1: Initialize video upload
    const initResponse = await axios.post(
      `${TIKTOK_API_BASE}/post/publish/video/init/`,
      {
        post_info: {
          title: postInfo.title || 'Untitled',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!initResponse.data.data || !initResponse.data.data.upload_url) {
      throw new Error('Failed to initialize video upload');
    }

    const { upload_url, publish_id } = initResponse.data.data;

    // Step 2: Upload video file
    const videoFile = fs.createReadStream(videoPath);
    const formData = new FormData();
    formData.append('video', videoFile);

    const uploadResponse = await axios.put(upload_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (uploadResponse.status !== 200) {
      throw new Error('Failed to upload video');
    }

    // Step 3: Get video_id
    const queryResponse = await axios.post(
      `${TIKTOK_API_BASE}/post/publish/status/fetch/`,
      {
        publish_id: publish_id,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Wait a bit and check status
    await new Promise(resolve => setTimeout(resolve, 2000));

    return publish_id;
  } catch (error) {
    console.error('Video upload error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Post to TikTok using TikTok API
 */
export async function postToTikTok(post) {
  try {
    // Get valid access token
    const accessToken = await getValidAccessToken(post.user_id, post.account);

    if (!post.media_url) {
      throw new Error('No video URL or file provided');
    }

    // If media_url is a file path, upload it first
    let videoId = null;
    if (fs.existsSync(post.media_url)) {
      // It's a file path, upload it
      videoId = await uploadVideoToTikTok(post.media_url, accessToken, {
        title: post.title,
      });
    } else {
      // Assume it's already a video_id or we need to handle URL differently
      // TikTok API typically requires uploading the video first
      throw new Error('Video must be uploaded as a file, not a URL');
    }

    // Step 4: Publish the post
    const publishResponse = await axios.post(
      `${TIKTOK_API_BASE}/post/publish/`,
      {
        post_info: {
          title: post.title,
          description: post.caption || '',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_id: videoId,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (publishResponse.data.data && publishResponse.data.data.publish_id) {
      console.log(`Post ${post.id} published successfully to TikTok. Publish ID: ${publishResponse.data.data.publish_id}`);
      return true;
    }

    throw new Error('Publish response missing publish_id');
  } catch (error) {
    console.error('TikTok API error:', error.response?.data || error.message);
    
    // If token error, try refreshing
    if (error.response?.status === 401) {
      try {
        await refreshTikTokToken(post.user_id, post.account);
        // Retry once
        return await postToTikTok(post);
      } catch (refreshError) {
        console.error('Failed to refresh token and retry:', refreshError);
      }
    }
    
    return false;
  }
}
