import React, { useState, useEffect } from "react";
import TikTokConnection from "./TikTokConnection";

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function formatTime(d) {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function Sidebar({ filteredPosts, filter, setFilter, onEditPost }) {
  const [showConnection, setShowConnection] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  useEffect(() => {
    checkTikTokConnection();
  }, []);

  const checkTikTokConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setTiktokConnected(false);
        return;
      }

      const { authAPI } = await import('../services/api.js');
      const status = await authAPI.getTikTokStatus('primary');
      setTiktokConnected(status.connected || false);
    } catch (error) {
      console.error('Error checking TikTok connection:', error);
      setTiktokConnected(false);
    }
  };

  const handleFilterClick = (value) => {
    setFilter(value);
  };

  return (
    <>
      <h2 className="panel-title">Scheduled Posts</h2>
      
      {/* TikTok Connection Section - Optional for testing */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <p className="panel-subtitle" style={{ margin: 0 }}>
            {tiktokConnected 
              ? '✓ TikTok account connected' 
              : '🧪 Test Mode - TikTok optional'}
          </p>
          <button
            onClick={() => setShowConnection(!showConnection)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'var(--text)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showConnection ? 'Hide' : 'Manage'}
          </button>
        </div>
        
        {showConnection && (
          <TikTokConnection 
            account="primary"
            onConnectionChange={(connected) => {
              setTiktokConnected(connected);
              checkTikTokConnection();
            }}
          />
        )}
      </div>

      <div id="post-filters" className="chip-row">
        {["all", "draft", "scheduled", "posted", "failed"].map((value) => (
          <button
            key={value}
            className={`chip ${filter === value ? "chip-active" : ""}`}
            data-filter={value}
            onClick={() => handleFilterClick(value)}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      <div id="scheduled-posts-list" className="post-list">
        {filteredPosts.length === 0 ? (
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af"
            }}
          >
            No posts in this filter yet. Click “New scheduled post” or tap a
            date in the calendar.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => onEditPost(post)}
            >
              <div className="post-card-left">
                <i className="fa-brands fa-tiktok"></i>
              </div>
              <div className="post-card-main">
                <div className="post-card-title">{post.title}</div>
                <div className="post-card-caption">{post.caption}</div>
                <div className="post-card-meta-row">
                  <span>
                    {post.dateTime ? (
                      <>
                        {formatDate(post.dateTime)} · {formatTime(post.dateTime)}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>No date set</span>
                    )}
                  </span>
                  <span className={`post-status ${post.status}`}>
                    {post.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Sidebar;
