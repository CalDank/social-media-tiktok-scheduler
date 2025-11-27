import React, { useEffect, useState } from "react";
import "./index.css";
import Calendar from "./components/Calendar";
import Sidebar from "./components/Sidebar";
import PostModal from "./components/PostModal";
import TikTokConnection from "./components/TikTokConnection";

<h1 style={{ color: "red" }}>THIS IS THE NEW VERSION</h1>

/*
  MULTI-PLATFORM READY DESIGN
  ---------------------------
  Platform structure:
  {
    id: "tiktok",
    name: "TikTok",
    icon: "fa-brands fa-tiktok",
    color: "#00C9FF",
    enabled: true
  }

  You can add Instagram, YouTube, etc., later:
  {
    id: "instagram",
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    color: "#E1306C",
    enabled: false
  }
*/

const SUPPORTED_PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: "fa-brands fa-tiktok",
    color: "#00C9FF",
    enabled: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    color: "#E1306C",
    enabled: false, // future release
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: "fa-brands fa-youtube",
    color: "#FF0000",
    enabled: false, // future release
  },
];

/* Helper utilities */
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function matchesFilter(status, filter) {
  if (filter === "all") return true;
  return status === filter;
}

/* Sample TikTok-only data */
const initialPosts = [
  {
    id: 1,
    platform: "tiktok",
    title: "Welcome Teaser",
    caption: "Launching our new Videotto TikTok scheduler!",
    dateTime: new Date(new Date().setHours(18, 0, 0, 0)),
    status: "scheduled",
  },
];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [defaultDate, setDefaultDate] = useState(new Date());
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [tiktokConnectionModal, setTiktokConnectionModal] = useState(false);
  const [showOAuthMessage, setShowOAuthMessage] = useState(false);
  const [oauthMessage, setOauthMessage] = useState({ type: '', text: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  /* THEME HANDLING */
  useEffect(() => {
    const savedTheme = localStorage.getItem("videotto-theme");
    if (savedTheme) {
      document.body.className = savedTheme;
    } else {
      document.body.classList.add("theme-dark");
    }
  }, []);

  /* HANDLE TIKTOK OAUTH CALLBACK */
  useEffect(() => {
    // Check if we're returning from TikTok OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    const account = urlParams.get('account');
    const demo = urlParams.get('demo');

    if (error || success) {
      setShowOAuthMessage(true);
      if (success === 'true') {
        const demoText = demo === 'true' ? ' (Demo Mode)' : '';
        setOauthMessage({ 
          type: 'success', 
          text: `TikTok account${account ? ` (${account})` : ''} connected successfully!${demoText}` 
        });
        setTiktokConnected(true);
        // Refresh connection status
        checkTikTokConnection();
      } else {
        const errorMessages = {
          'no_code': 'TikTok authorization was cancelled or incomplete.',
          'token_failed': 'Failed to authenticate with TikTok. Please try again.',
          'callback_error': 'An error occurred during authentication.',
        };
        setOauthMessage({ 
          type: 'error', 
          text: errorMessages[error] || `Error: ${error}` 
        });
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowOAuthMessage(false);
      }, 5000);
    }
  }, []);

  /* CHECK TIKTOK CONNECTION STATUS */
  const checkTikTokConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setTiktokConnected(false);
        return;
      }

      const { authAPI } = await import('./services/api.js');
      const status = await authAPI.getTikTokStatus('primary');
      setTiktokConnected(status.connected || false);
    } catch (error) {
      console.error('Error checking TikTok connection:', error);
      setTiktokConnected(false);
    }
  };

  // Check connection status on mount
  useEffect(() => {
    checkTikTokConnection();
  }, []);

  const toggleTheme = () => {
    const body = document.body;
    if (body.classList.contains("theme-dark")) {
      body.classList.replace("theme-dark", "theme-light");
    } else {
      body.classList.replace("theme-light", "theme-dark");
    }
    localStorage.setItem("videotto-theme", body.className);
  };

  /* MONTH NAVIGATION */
  const shiftMonth = (offset) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const goToToday = () => setCurrentDate(new Date());

  /* MODALS */
  const openNewPostModal = (date) => {
    setEditingPost(null);
    setDefaultDate(date || new Date());
    setModalOpen(true);
  };

  const openEditPostModal = (post) => {
    setEditingPost(post);
    setDefaultDate(post.dateTime);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  /* SAVE POST (TikTok for now) */
  const showToastMessage = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleSavePost = async (payload) => {
    const { id, title, caption, date, time, postNow, videoFile, videoUrl, account } = payload;

    try {
      let mediaUrl = videoUrl || null;

      // If posting now with video file, upload and publish immediately
      if (videoFile && postNow) {
        const { uploadAPI } = await import('./services/api.js');
        try {
          showToastMessage('info', 'Uploading video to TikTok...');
          const publishResult = await uploadAPI.uploadAndPublish(
            videoFile, 
            account || 'primary', 
            title, 
            caption || ''
          );
          
          // Show success message
          showToastMessage('success', 'Video uploaded and published successfully to TikTok!');
          
          // Create post record with published status
          const dateTime = new Date();
          const newPost = {
            id: Date.now(),
            platform: "tiktok",
            title,
            caption,
            dateTime,
            status: "posted",
            media_url: publishResult.videoId,
            account: account || 'primary',
          };
          setPosts((prev) => [...prev, newPost]);
          setModalOpen(false);
          return;
        } catch (error) {
          showToastMessage('error', `Failed to publish video: ${error.message}`);
          return;
        }
      }

      // If there's a video file (for scheduled posts), upload it to the backend first
      if (videoFile) {
        const { uploadAPI } = await import('./services/api.js');
        try {
          showToastMessage('info', 'Uploading video...');
          const uploadResult = await uploadAPI.uploadVideo(videoFile, account || 'primary', title);
          mediaUrl = uploadResult.filePath; // Store the file path for later posting
          showToastMessage('success', 'Video uploaded successfully. Ready to publish.');
        } catch (error) {
          showToastMessage('error', `Failed to upload video: ${error.message}`);
          return;
        }
      }

      const dateTime = postNow ? new Date() : new Date(`${date}T${time}`);
      const status = postNow ? "posted" : "scheduled";

      if (id) {
        // edit - in production, this would call the API
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, title, caption, dateTime, status, media_url: mediaUrl, account: account || 'primary' }
              : p
          )
        );
      } else {
        // new post - in production, this would call the API
        const newPost = {
          id: Date.now(),
          platform: "tiktok",
          title,
          caption,
          dateTime,
          status,
          media_url: mediaUrl,
          account: account || 'primary',
        };
        setPosts((prev) => [...prev, newPost]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
      showToastMessage('error', `Failed to save post: ${error.message}`);
    }
  };

  /* Visible posts */
  const filteredPosts = posts
    .slice()
    .sort((a, b) => a.dateTime - b.dateTime)
    .filter((p) => matchesFilter(p.status, filter));

  return (
    <div className="app">
      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <i className="fa-solid fa-bolt"></i>
          </span>
          <div>
            <div className="brand-title">Videotto Scheduler</div>
            <div className="brand-subtitle">
              Multi-platform scheduler • TikTok enabled
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          {/* Platform toggle UI */}
          {SUPPORTED_PLATFORMS.map((p) => (
            <button
              key={p.id}
              className="icon-button"
              style={{
                opacity: p.enabled ? 1 : 0.3,
                color: p.enabled 
                  ? (p.id === 'tiktok' && tiktokConnected ? p.color : 'var(--text-soft)')
                  : "var(--text-soft)",
                position: 'relative'
              }}
              title={
                p.id === 'tiktok' && p.enabled
                  ? (tiktokConnected ? `${p.name} connected` : `Connect ${p.name} account`)
                  : p.enabled
                  ? `${p.name} connected`
                  : `${p.name} coming soon`
              }
              onClick={async () => {
                if (p.id === 'tiktok' && p.enabled) {
                  setTiktokConnectionModal(true);
                }
              }}
            >
              <i className={p.icon}></i>
              {p.id === 'tiktok' && tiktokConnected && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid var(--bg)'
                }}></span>
              )}
            </button>
          ))}

          {/* Create new post */}
          <button
            className="btn btn-primary"
            onClick={() => openNewPostModal(new Date())}
          >
            <i className="fa-solid fa-plus"></i>
            New TikTok Post
          </button>

          <button
            className="icon-button"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            <i className="fa-solid fa-moon"></i>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="layout">
        <section className="panel calendar-panel">
          <div className="calendar-toolbar">
            <div className="month-switcher">
              <button
                className="icon-button"
                onClick={() => shiftMonth(-1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className="month-label">
                {currentDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                className="icon-button"
                onClick={() => shiftMonth(1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div className="calendar-toolbar-right">
              <button className="btn btn-ghost" onClick={goToToday}>
                Today
              </button>
              <span className="calendar-view-label">Month view</span>
            </div>
          </div>

          {/* Calendar */}
          <Calendar
            currentDate={currentDate}
            posts={posts}
            filter={filter}
            sameDay={sameDay}
            matchesFilter={matchesFilter}
            onDayClick={openNewPostModal}
          />
        </section>

        {/* Sidebar */}
        <aside className="panel side-panel">
          <Sidebar
            filteredPosts={filteredPosts}
            filter={filter}
            setFilter={setFilter}
            onEditPost={openEditPostModal}
          />
        </aside>
      </main>

      {/* OAUTH MESSAGE TOAST */}
      {showOAuthMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '16px 20px',
          borderRadius: '12px',
          background: oauthMessage.type === 'success' 
            ? 'rgba(34, 197, 94, 0.95)' 
            : 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <i className={`fa-solid ${oauthMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{oauthMessage.text}</span>
          <button
            onClick={() => setShowOAuthMessage(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: 'auto'
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* VIDEO UPLOAD/PUBLISH TOAST */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: showOAuthMessage ? '90px' : '20px',
          right: '20px',
          zIndex: 10000,
          padding: '16px 20px',
          borderRadius: '12px',
          background: toastMessage.type === 'success' 
            ? 'rgba(34, 197, 94, 0.95)'
            : toastMessage.type === 'error'
            ? 'rgba(239, 68, 68, 0.95)'
            : 'rgba(59, 130, 246, 0.95)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <i className={`fa-solid ${
            toastMessage.type === 'success' 
              ? 'fa-check-circle' 
              : toastMessage.type === 'error'
              ? 'fa-exclamation-circle'
              : 'fa-spinner fa-spin'
          }`}></i>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{toastMessage.text}</span>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: 'auto'
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* TIKTOK CONNECTION MODAL */}
      {tiktokConnectionModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.className === 'modal-backdrop') {
              setTiktokConnectionModal(false);
            }
          }}
        >
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Connect TikTok Account</h3>
              <button 
                className="icon-button" 
                onClick={() => setTiktokConnectionModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <TikTokConnection 
                account="primary"
                onConnectionChange={(connected) => {
                  setTiktokConnected(connected);
                  if (connected) {
                    setTimeout(() => setTiktokConnectionModal(false), 1500);
                  }
                }}
              />
              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0, 201, 255, 0.05)',
                border: '1px solid rgba(0, 201, 255, 0.2)',
                fontSize: '12px',
                color: 'var(--text-soft)'
              }}>
                <strong style={{ color: 'var(--text)' }}>What you'll need:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>A TikTok Business or Creator account</li>
                  <li>Permission to post videos on your account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      <PostModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSavePost}
        editingPost={editingPost}
        defaultDate={defaultDate}
      />
    </div>
  );
}

export default App;
