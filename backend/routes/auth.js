import express from 'express';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun } from '../database/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbRun(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    // Generate token
    const token = generateToken(result.lastID);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.lastID, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TikTok OAuth - Start OAuth flow
router.get('/tiktok/login', authenticateToken, async (req, res) => {
  // DEMO MODE: Simulate OAuth flow without actual TikTok API
  if (process.env.DEMO_MODE === 'true' || !process.env.TIKTOK_CLIENT_KEY) {
    const account = req.query.account || 'primary';
    const userId = req.user.userId;
    
    try {
      const { dbGet, dbRun } = await import('../database/db.js');
      
      // Create mock tokens
      const mockAccessToken = `demo_access_token_${Date.now()}`;
      const mockRefreshToken = `demo_refresh_token_${Date.now()}`;
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const refreshExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      
      // Check if connection exists
      const existing = await dbGet(
        'SELECT id FROM platform_connections WHERE user_id = ? AND platform = ? AND account_name = ?',
        [userId, 'tiktok', account]
      );

      if (existing) {
        await dbRun(
          `UPDATE platform_connections 
           SET access_token = ?, refresh_token = ?, token_expires_at = ?, refresh_expires_at = ?, connected_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [mockAccessToken, mockRefreshToken, tokenExpiresAt.toISOString(), refreshExpiresAt.toISOString(), existing.id]
        );
      } else {
        await dbRun(
          `INSERT INTO platform_connections (user_id, platform, account_name, access_token, refresh_token, token_expires_at, refresh_expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, 'tiktok', account, mockAccessToken, mockRefreshToken, tokenExpiresAt.toISOString(), refreshExpiresAt.toISOString()]
        );
      }
      
      console.log('🎬 DEMO MODE: TikTok account connected successfully');
    } catch (error) {
      console.error('Demo mode connection error:', error);
    }
    
    // Return demo auth URL that simulates the flow
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const demoAuthUrl = `${frontendUrl}/auth/tiktok?demo=true&success=true&account=${account}`;
    
    return res.json({ 
      authUrl: demoAuthUrl,
      demo: true,
      message: 'Demo mode: Simulating TikTok connection...'
    });
  }
  
  // REAL MODE: Use actual TikTok OAuth
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5000/api/auth/tiktok/callback';
  const state = Buffer.from(JSON.stringify({ userId: req.user.userId, account: req.query.account || 'primary' })).toString('base64');

  const scope = 'user.info.basic,video.upload,video.publish';
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  
  res.json({ authUrl });
});

// TikTok OAuth - Handle callback
router.get('/tiktok/callback', async (req, res) => {
  // DEMO MODE: Handle demo callback
  const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.TIKTOK_CLIENT_KEY;
  if (isDemoMode) {
    const { demo } = req.query;
    if (demo === 'true') {
      // Demo callback already handled in login route
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/tiktok?success=true&demo=true`);
    }
  }
  
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tiktok?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tiktok?error=no_code`);
    }

    // Decode state to get userId and account
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, account } = stateData;

    // Exchange code for access token
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5000/api/auth/tiktok/callback';

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.data || !tokenData.data.access_token) {
      console.error('TikTok token error:', tokenData);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tiktok?error=token_failed`);
    }

    const { access_token, refresh_token, expires_in, refresh_expires_in } = tokenData.data;

    // Calculate expiration dates
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
    const refreshExpiresAt = refresh_expires_in ? new Date(Date.now() + refresh_expires_in * 1000) : null;

    // Store or update connection
    const existing = await dbGet(
      'SELECT id FROM platform_connections WHERE user_id = ? AND platform = ? AND account_name = ?',
      [userId, 'tiktok', account]
    );

    if (existing) {
      await dbRun(
        `UPDATE platform_connections 
         SET access_token = ?, refresh_token = ?, token_expires_at = ?, refresh_expires_at = ?, connected_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [access_token, refresh_token, tokenExpiresAt.toISOString(), refreshExpiresAt?.toISOString() || null, existing.id]
      );
    } else {
      await dbRun(
        `INSERT INTO platform_connections (user_id, platform, account_name, access_token, refresh_token, token_expires_at, refresh_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'tiktok', account, access_token, refresh_token, tokenExpiresAt.toISOString(), refreshExpiresAt?.toISOString() || null]
      );
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tiktok?success=true&account=${account}`);
  } catch (error) {
    console.error('TikTok callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tiktok?error=callback_error`);
  }
});

// Get TikTok connection status
router.get('/tiktok/status', authenticateToken, async (req, res) => {
  // DEMO MODE: Check for demo connection
  const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.TIKTOK_CLIENT_KEY;
  if (isDemoMode) {
    const { dbGet } = await import('../database/db.js');
    const account = req.query.account || 'primary';
    const connection = await dbGet(
      `SELECT id, connected_at, token_expires_at, refresh_expires_at 
       FROM platform_connections 
       WHERE user_id = ? AND platform = 'tiktok' AND account_name = ?`,
      [req.user.userId, account]
    );

    if (connection) {
      return res.json({
        connected: true,
        demo: true,
        connectedAt: connection.connected_at,
        expiresAt: connection.token_expires_at,
        account: account
      });
    }
    return res.json({ connected: false, demo: true });
  }
  try {
    const account = req.query.account || 'primary';
    const connection = await dbGet(
      `SELECT account_name, connected_at, token_expires_at,
              CASE WHEN token_expires_at > datetime('now') THEN 1 ELSE 0 END as is_valid
       FROM platform_connections 
       WHERE user_id = ? AND platform = 'tiktok' AND account_name = ?`,
      [req.user.userId, account]
    );

    if (!connection) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      account: connection.account_name,
      connectedAt: connection.connected_at,
      expiresAt: connection.token_expires_at,
      isValid: connection.is_valid === 1
    });
  } catch (error) {
    console.error('Get TikTok status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disconnect TikTok account
router.delete('/tiktok/disconnect', authenticateToken, async (req, res) => {
  try {
    const account = req.query.account || 'primary';
    await dbRun(
      'DELETE FROM platform_connections WHERE user_id = ? AND platform = ? AND account_name = ?',
      [req.user.userId, 'tiktok', account]
    );
    res.json({ message: 'TikTok account disconnected' });
  } catch (error) {
    console.error('Disconnect TikTok error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

