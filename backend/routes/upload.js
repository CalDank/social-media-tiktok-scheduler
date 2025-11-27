import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { uploadVideoToTikTok, getValidAccessToken } from '../services/tiktokService.js';
import { uploadToS3, generateVideoKey, deleteFromS3, isUsingS3 } from '../services/s3Storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for video uploads
// If using S3, we'll still need to temporarily store the file before uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Upload video file
router.post('/video', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const account = req.body.account || 'primary';
    const title = req.body.title || 'Untitled';

    // Get valid access token
    let accessToken;
    try {
      accessToken = await getValidAccessToken(req.user.userId, account);
    } catch (error) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ 
        error: 'TikTok account not connected. Please connect your TikTok account first.',
        requiresAuth: true
      });
    }

    // Upload to S3 (if enabled) or keep local
    let storageLocation = req.file.path;
    let s3Key = null;
    
    if (isUsingS3()) {
      try {
        s3Key = generateVideoKey(req.user.userId, req.file.filename);
        const s3Result = await uploadToS3(req.file.path, s3Key, req.file.mimetype);
        storageLocation = s3Result.location;
        
        // Delete local file after S3 upload
        fs.unlinkSync(req.file.path);
      } catch (s3Error) {
        console.error('S3 upload failed, keeping local file:', s3Error);
        // Continue with local storage if S3 fails
      }
    }

    // Upload to TikTok and get video_id
    try {
      // For TikTok upload, we need the actual file
      // If using S3, we'll need to download it temporarily or stream it
      let videoPathForTikTok = req.file.path;
      
      if (isUsingS3() && s3Key) {
        // Download from S3 temporarily for TikTok upload
        const tempPath = path.join(__dirname, '../uploads/temp', req.file.filename);
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const { downloadFromS3 } = await import('../services/s3Storage.js');
        videoPathForTikTok = await downloadFromS3(s3Key, tempPath);
      }
      
      const publishId = await uploadVideoToTikTok(videoPathForTikTok, accessToken, { title });
      
      // Clean up temp file if we downloaded from S3
      if (isUsingS3() && s3Key && videoPathForTikTok !== req.file.path) {
        try {
          fs.unlinkSync(videoPathForTikTok);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      res.json({
        success: true,
        videoId: publishId,
        filePath: storageLocation,
        s3Key: s3Key,
        filename: req.file.filename,
        size: req.file.size,
        storageType: isUsingS3() ? 's3' : 'local',
        message: 'Video uploaded successfully. Ready to publish.'
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (isUsingS3() && s3Key) {
        await deleteFromS3(s3Key);
      } else {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload video',
      details: error.response?.data || null
    });
  }
});

// Delete uploaded video file
router.delete('/video/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    
    // Check if it's an S3 key or local filename
    if (isUsingS3() && key.startsWith('videos/')) {
      // It's an S3 key
      const deleted = await deleteFromS3(key);
      if (deleted) {
        res.json({ message: 'Video file deleted from S3' });
      } else {
        res.status(404).json({ error: 'File not found in S3' });
      }
    } else {
      // It's a local filename
      const filePath = path.join(__dirname, '../uploads/videos', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Video file deleted' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;

