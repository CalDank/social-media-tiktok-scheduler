# TikTok Content Scheduler

A full-stack web application for scheduling and managing TikTok content posts. Plan your content in advance with an intuitive calendar interface and automatically publish to TikTok at scheduled times.

## Features

- 📅 **Calendar View**: Visual calendar interface to schedule and manage posts
- 🔐 **User Authentication**: Secure JWT-based authentication system
- 🎬 **TikTok Integration**: Connect your TikTok account and publish directly
- 📤 **File Upload**: Upload videos and images with AWS S3 storage
- ⏰ **Automated Scheduling**: Background scheduler service that publishes posts at scheduled times
- 🎨 **Modern UI**: Clean, responsive design with dark theme support
- 🔄 **Multi-Platform Ready**: Architecture designed to support Instagram, YouTube Shorts, and more in the future

## Tech Stack

### Frontend
- React 19
- React Scripts
- Font Awesome Icons

### Backend
- Node.js with Express
- SQLite Database
- JWT Authentication
- AWS S3 for file storage
- TikTok API Integration
- Node-cron for scheduled tasks

## Project Structure

```
social-media-tiktok-scheduler/
├── backend/
│   ├── database/          # Database configuration and initialization
│   ├── middleware/        # Authentication middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes (auth, posts, upload)
│   ├── scripts/           # Database initialization scripts
│   ├── services/          # Business logic (TikTok, S3, scheduler)
│   └── server.js          # Express server entry point
├── frontend/
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # React components
│       └── services/      # API service layer
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TikTok Developer Account (for TikTok integration)
- AWS Account (for S3 storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-tiktok-scheduler
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables**

   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-secret-key-here
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=your-aws-region
   AWS_S3_BUCKET=your-bucket-name
   
   # TikTok API Configuration
   TIKTOK_CLIENT_KEY=your-tiktok-client-key
   TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
   TIKTOK_REDIRECT_URI=http://localhost:3000/tiktok/callback
   ```

2. **Initialize Database**
   ```bash
   cd backend
   npm run init-db
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### Upload
- `POST /api/upload` - Upload file to S3

### Health Check
- `GET /api/health` - Check API status

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Connect TikTok**: Link your TikTok account through the connection interface
3. **Create Posts**: Click on any date in the calendar to create a new scheduled post
4. **Upload Media**: Upload videos or images for your posts
5. **Schedule**: Set the date and time for your post to be published
6. **Auto-Publish**: The scheduler service will automatically publish posts at their scheduled times

## Development

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize the database

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

