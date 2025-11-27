# Environment Variables Setup

## Quick Setup

Create a file named `.env` in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# TikTok API Configuration
TIKTOK_CLIENT_KEY=aw5d18mvgthjsqy8
TIKTOK_CLIENT_SECRET=SFeNY4iLs38Ld11drqL3Mt8vZZKttYyL
TIKTOK_REDIRECT_URI=http://localhost:5000/api/auth/tiktok/callback

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_PATH=./data/scheduler.db

# AWS S3 Configuration (Optional - uncomment if using S3)
# USE_S3_STORAGE=false
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=your-bucket-name
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Steps to Create the File

### Option 1: Using Command Line
```bash
cd backend
cat > .env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# TikTok API Configuration
TIKTOK_CLIENT_KEY=aw5d18mvgthjsqy8
TIKTOK_CLIENT_SECRET=SFeNY4iLs38Ld11drqL3Mt8vZZKttYyL
TIKTOK_REDIRECT_URI=http://localhost:5000/api/auth/tiktok/callback

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_PATH=./data/scheduler.db
EOF
```

### Option 2: Using a Text Editor
1. Open your text editor
2. Create a new file in the `backend` folder
3. Name it exactly `.env` (with the dot at the beginning)
4. Copy and paste the content above
5. Save the file

### Option 3: Using VS Code
1. Right-click on the `backend` folder in VS Code
2. Select "New File"
3. Name it `.env`
4. Paste the content above
5. Save (Ctrl+S or Cmd+S)

## Verification

After creating the `.env` file, verify it's configured correctly:

```bash
# Make sure the file exists
ls -la backend/.env

# Check that it's in .gitignore (it should be)
cat backend/.gitignore | grep .env
```

## Important Notes

⚠️ **Security:**
- The `.env` file is already in `.gitignore` - this is good!
- Never commit your `.env` file to git
- Keep your `TIKTOK_CLIENT_SECRET` and `JWT_SECRET` private

⚠️ **TikTok Redirect URI:**
- Make sure the redirect URI in your `.env` matches exactly what you set in your TikTok Developer Portal
- Default: `http://localhost:5000/api/auth/tiktok/callback`
- For production, you'll need to update this to your production domain

## Testing

After creating the `.env` file, restart your backend server:

```bash
cd backend
npm start
```

The server should start without errors. If you see any errors about missing environment variables, double-check your `.env` file.

## Next Steps

1. ✅ Create `.env` file with your credentials
2. ✅ Restart backend server
3. ✅ Test TikTok connection in the frontend
4. ✅ Connect your TikTok account
5. ✅ Start scheduling posts!

Your TikTok credentials are now configured! 🎉

