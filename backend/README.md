# TikTok Scheduler Backend API

Backend API for the social media TikTok scheduler application.

## Features

- RESTful API for managing scheduled posts
- JWT-based authentication
- SQLite database for data persistence
- Automated scheduler service that posts at scheduled times
- TikTok API integration (placeholder - ready for production implementation)
- Support for multiple platforms (TikTok, Instagram, YouTube - extensible)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your configuration values.

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   Or just start the server - it will auto-initialize on first run.

4. **Start the server:**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires authentication)

### Posts

All post endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

- `GET /api/posts` - Get all posts for authenticated user
  - Query params: `?status=scheduled&platform=tiktok`

- `GET /api/posts/:id` - Get a single post

- `POST /api/posts` - Create a new post
  ```json
  {
    "title": "My TikTok Post",
    "caption": "This is the caption",
    "date": "2024-01-15",
    "time": "18:00",
    "account": "primary",
    "platform": "tiktok",
    "postNow": false
  }
  ```

- `PUT /api/posts/:id` - Update a post

- `DELETE /api/posts/:id` - Delete a post

## Database Schema

### Users
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `created_at` - Timestamp

### Posts
- `id` - Primary key
- `user_id` - Foreign key to users
- `platform` - Platform name (tiktok, instagram, youtube)
- `title` - Post title
- `caption` - Post caption/description
- `scheduled_datetime` - When to post
- `status` - scheduled, posted, failed
- `account` - Account name (primary, test, etc.)
- `media_url` - URL to media file (future)
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `posted_at` - When post was actually published

### Platform Connections
- Stores OAuth tokens for connected social media accounts
- `user_id`, `platform`, `account_name` - Composite unique key
- `access_token`, `refresh_token` - OAuth tokens
- `token_expires_at` - Token expiration

## Scheduler Service

The scheduler service runs automatically and checks every minute for posts that are due to be published. When a post's scheduled time arrives, it:

1. Retrieves the post from the database
2. Gets the user's TikTok access token
3. Calls the TikTok API to publish the post
4. Updates the post status (posted or failed)

## TikTok API Integration

The TikTok service (`services/tiktokService.js`) currently has a placeholder implementation that simulates posting. To integrate with the real TikTok API:

1. Register your application at [TikTok Developers](https://developers.tiktok.com/)
2. Implement OAuth flow to get access tokens
3. Update `postToTikTok()` function with actual API calls
4. Handle video uploads (TikTok requires video files)

See [TikTok Business API Documentation](https://developers.tiktok.com/doc/) for details.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `DB_PATH` - Path to SQLite database file
- `TIKTOK_CLIENT_KEY` - TikTok OAuth client key
- `TIKTOK_CLIENT_SECRET` - TikTok OAuth client secret
- `TIKTOK_REDIRECT_URI` - OAuth redirect URI
- `FRONTEND_URL` - Frontend URL for CORS

## Development

The backend uses:
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **node-cron** - Task scheduling
- **bcryptjs** - Password hashing

## Production Considerations

- Replace SQLite with PostgreSQL or MySQL for production
- Use environment-specific JWT secrets
- Implement proper error logging
- Add rate limiting
- Set up HTTPS
- Configure proper CORS policies
- Implement token refresh for TikTok OAuth
- Add video upload handling
- Set up monitoring and alerts

