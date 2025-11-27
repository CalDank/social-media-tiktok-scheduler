import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbGet, dbRun } from '../database/db.js';
import { downloadFromS3, isUsingS3 } from './s3Storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export async function uploadVideoToTikTok(videoPathOrS3Key, accessToken, postInfo = {}) {
  try {
    // Handle S3 storage - download file if needed
    let videoPath = videoPathOrS3Key;
    
    if (isUsingS3() && videoPathOrS3Key.startsWith('s3://') || videoPathOrS3Key.startsWith('videos/')) {
      // It's an S3 key, download it temporarily
      const tempPath = path.join(__dirname, '../uploads/temp', `temp-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`);
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const s3Key = videoPathOrS3Key.startsWith('s3://') 
        ? videoPathOrS3Key.replace(/^s3:\/\/[^/]+\//, '')
        : videoPathOrS3Key;
      
      videoPath = await downloadFromS3(s3Key, tempPath);
    }
    
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

    // Clean up temp file if we downloaded from S3
    if (isUsingS3() && videoPath !== videoPathOrS3Key && fs.existsSync(videoPath)) {
      try {
        fs.unlinkSync(videoPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return publish_id;
  } catch (error) {
    // Clean up temp file on error
    if (isUsingS3() && videoPath !== videoPathOrS3Key && fs.existsSync(videoPath)) {
      try {
        fs.unlinkSync(videoPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    console.error('Video upload error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Publish video to TikTok using publish_id
 */
export async function publishVideoToTikTok(publishId, accessToken, caption = '', title = 'Untitled') {
  try {
    // Wait for video processing (TikTok needs time after upload)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Publish the video
    const publishResponse = await axios.post(
      `${TIKTOK_API_BASE}/post/publish/`,
      {
        post_info: {
          title: title,
          description: caption || '',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_id: publishId, // TikTok uses publish_id as video_id for publish
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
      console.log(`Video published successfully to TikTok. Publish ID: ${publishResponse.data.data.publish_id}`);
      return {
        success: true,
        publishId: publishResponse.data.data.publish_id,
        data: publishResponse.data.data
      };
    }

    throw new Error('Publish response missing publish_id');
  } catch (error) {
    console.error('TikTok publish error:', error.response?.data || error.message);
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
