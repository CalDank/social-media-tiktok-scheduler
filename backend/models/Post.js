import { dbRun, dbGet, dbAll } from '../database/db.js';

export class Post {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.platform = data.platform || 'tiktok';
    this.title = data.title;
    this.caption = data.caption || '';
    this.scheduled_datetime = data.scheduled_datetime;
    this.status = data.status || 'scheduled';
    this.account = data.account || 'primary';
    this.media_url = data.media_url || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.posted_at = data.posted_at;
  }

  // Convert to JSON format expected by frontend
  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      title: this.title,
      caption: this.caption,
      dateTime: new Date(this.scheduled_datetime),
      status: this.status,
      account: this.account,
      media_url: this.media_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
      posted_at: this.posted_at
    };
  }

  // Create a new post
  static async create(userId, postData) {
    const {
      platform = 'tiktok',
      title,
      caption = '',
      scheduled_datetime,
      status = 'scheduled',
      account = 'primary',
      media_url = null
    } = postData;

    const result = await dbRun(
      `INSERT INTO posts (user_id, platform, title, caption, scheduled_datetime, status, account, media_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, platform, title, caption, scheduled_datetime, status, account, media_url]
    );

    return Post.findById(result.lastID);
  }

  // Find post by ID
  static async findById(id) {
    const row = await dbGet('SELECT * FROM posts WHERE id = ?', [id]);
    return row ? new Post(row) : null;
  }

  // Find all posts for a user
  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM posts WHERE user_id = ?';
    const params = [userId];

    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.platform) {
      sql += ' AND platform = ?';
      params.push(filters.platform);
    }

    sql += ' ORDER BY scheduled_datetime ASC';

    const rows = await dbAll(sql, params);
    return rows.map(row => new Post(row));
  }

  // Update post
  async update(updates) {
    const allowedFields = ['title', 'caption', 'scheduled_datetime', 'status', 'account', 'media_url'];
    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return this;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(this.id);

    await dbRun(
      `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return Post.findById(this.id);
  }

  // Delete post
  async delete() {
    await dbRun('DELETE FROM posts WHERE id = ?', [this.id]);
    return true;
  }

  // Mark as posted
  async markAsPosted() {
    return this.update({
      status: 'posted',
      posted_at: new Date().toISOString()
    });
  }

  // Mark as failed
  async markAsFailed() {
    return this.update({
      status: 'failed'
    });
  }
}

