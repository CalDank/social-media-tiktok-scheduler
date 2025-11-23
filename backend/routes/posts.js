import express from 'express';
import { Post } from '../models/Post.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all posts for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, platform } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (platform) filters.platform = platform;

    const posts = await Post.findByUserId(req.user.userId, filters);
    res.json(posts.map(post => post.toJSON()));
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify post belongs to user
    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(post.toJSON());
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { title, caption, date, time, postNow, account, platform, media_url, videoId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Determine scheduled datetime
    let scheduled_datetime;
    let status = 'scheduled';

    if (postNow) {
      scheduled_datetime = new Date().toISOString();
      status = 'scheduled'; // Will be updated by scheduler
    } else {
      if (!date || !time) {
        return res.status(400).json({ error: 'Date and time are required when not posting immediately' });
      }
      scheduled_datetime = new Date(`${date}T${time}`).toISOString();
    }

    const postData = {
      platform: platform || 'tiktok',
      title: title.trim(),
      caption: caption ? caption.trim() : '',
      scheduled_datetime,
      status,
      account: account || 'primary',
      media_url: media_url || null
    };

    const post = await Post.create(req.user.userId, postData);

    // If posting now, trigger immediate posting
    if (postNow && media_url) {
      const { postToTikTok } = await import('../services/tiktokService.js');
      try {
        const success = await postToTikTok(post);
        if (success) {
          await post.markAsPosted();
        } else {
          await post.markAsFailed();
        }
      } catch (error) {
        console.error('Immediate post error:', error);
        await post.markAsFailed();
      }
    }

    res.status(201).json(post.toJSON());
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify post belongs to user
    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, caption, date, time, account, platform, postNow } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (caption !== undefined) updates.caption = caption.trim();
    if (account !== undefined) updates.account = account;
    if (platform !== undefined) updates.platform = platform;

    // Handle date/time updates
    if (date && time) {
      updates.scheduled_datetime = new Date(`${date}T${time}`).toISOString();
    }

    // Handle immediate posting
    if (postNow) {
      updates.scheduled_datetime = new Date().toISOString();
      updates.status = 'posted';
    }

    const updatedPost = await post.update(updates);
    res.json(updatedPost.toJSON());
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify post belongs to user
    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await post.delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

