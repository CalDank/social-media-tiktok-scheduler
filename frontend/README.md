# TikTok Content Calendar – Frontend Prototype

A Buffer-style content scheduling calendar designed for TikTok posts.
This repository contains a standalone **frontend prototype** that demonstrates the full user interface for creating, editing, and managing scheduled TikTok posts inside a calendar layout.
All data is stored in-browser only and resets on refresh.

## Features

### Calendar Interface
- Clean month-view calendar
- Click any date to schedule a post
- Event “pill” previews inside each day
- Multi-post indicators (e.g., “+2 more”)
- Responsive layout for all screen sizes

### Scheduling Modal
- Internal title
- TikTok caption field
- Date & time picker
- TikTok account selector (placeholder)
- “Post now” option
- Editable existing posts

### Sidebar Post List
- Chronological list of all scheduled posts
- Filters: **All, Scheduled, Posted, Failed**
- Status badges with color-coded UI

### Additional UI Features
- Dark mode toggle (saved in localStorage)
- Placeholder TikTok OAuth button
- Fully custom UI built without frameworks

## Tech Stack

| Layer | Technology |
|------|------------|
| UI | HTML, CSS, JavaScript |
| Icons | FontAwesome |
| Theme | CSS Variables (Dark/Light) |
| Data | In-memory (no backend yet) |

## Project Structure
```
/
│── index.html
│── styles.css
│── script.js
│── README.md
└── assets/ (optional)
```

## Roadmap (Upcoming Backend Work)

### Phase 2 – Backend
- Node/Express API
- TikTok OAuth integration
- Refresh token storage
- S3 video uploads
- REST endpoints for posts & accounts
