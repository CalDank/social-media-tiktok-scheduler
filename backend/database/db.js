import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/scheduler.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

// Promisify database methods
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function initDatabase() {
  const db = getDatabase();
  
  // Create users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create posts table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      platform TEXT NOT NULL DEFAULT 'tiktok',
      title TEXT NOT NULL,
      caption TEXT,
      scheduled_datetime DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      account TEXT NOT NULL DEFAULT 'primary',
      media_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      posted_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
  `);
  
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)
  `);
  
  await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled_datetime ON posts(scheduled_datetime)
  `);

  // Create platform_connections table for OAuth tokens
  await dbRun(`
    CREATE TABLE IF NOT EXISTS platform_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      account_name TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at DATETIME,
      refresh_expires_at DATETIME,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, platform, account_name)
    )
  `);

  console.log('Database tables created/verified');
}

