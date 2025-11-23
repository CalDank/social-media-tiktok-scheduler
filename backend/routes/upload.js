import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { uploadVideoToTikTok, getValidAccessToken } from '../services/tiktokService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for video uploads
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

    // Upload to TikTok and get video_id
    try {
      const publishId = await uploadVideoToTikTok(req.file.path, accessToken, { title });
      
      // Store video info - in production, you might want to keep the file or delete it
      // For now, we'll keep the file path for later publishing
      
      res.json({
        success: true,
        videoId: publishId,
        filePath: req.file.path,
        filename: req.file.filename,
        size: req.file.size,
        message: 'Video uploaded successfully. Ready to publish.'
      });
    } catch (error) {
      // Clean up uploaded file on error
      fs.unlinkSync(req.file.path);
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
router.delete('/video/:filename', authenticateToken, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/videos', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Video file deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;

