import React from "react";

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
  const handleFilterClick = (value) => {
    setFilter(value);
  };

  return (
    <>
      <h2 className="panel-title">Scheduled TikTok posts</h2>
      <p className="panel-subtitle">
        Frontend-only prototype. In production this would be backed by an API
        and TikTok posting service.
      </p>

      <div id="post-filters" className="chip-row">
        {["all", "scheduled", "posted", "failed"].map((value) => (
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
                    {formatDate(post.dateTime)} · {formatTime(post.dateTime)}
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
