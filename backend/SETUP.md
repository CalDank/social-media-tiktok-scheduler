# Backend Setup Guide

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Create a `.env` file in the `backend` directory with the following content:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret (change this in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Database
   DB_PATH=./data/scheduler.db

   # TikTok API Configuration
   TIKTOK_CLIENT_KEY=your_tiktok_client_key
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   TIKTOK_REDIRECT_URI=http://localhost:5000/api/auth/tiktok/callback

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

4. **Initialize database (optional - auto-initializes on first run):**
   ```bash
   npm run init-db
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will be running on `http://localhost:5000`

## Testing the API

### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Create a post (replace TOKEN with your JWT token):
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "My First Post",
    "caption": "This is a test caption",
    "date": "2024-12-25",
    "time": "18:00",
    "account": "primary"
  }'
```

### Get all posts:
```bash
curl http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN"
```

