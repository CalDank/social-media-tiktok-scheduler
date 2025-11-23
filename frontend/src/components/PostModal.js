import React, { useEffect, useState } from "react";

function toDateInputValue(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(d) {
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

function PostModal({ isOpen, onClose, onSave, editingPost, defaultDate }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [account, setAccount] = useState("primary");
  const [postNow, setPostNow] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const baseDate = defaultDate || new Date();

    if (editingPost) {
      setTitle(editingPost.title || "");
      setCaption(editingPost.caption || "");
      setAccount(editingPost.account || "primary");
      setPostNow(false);
      setDate(toDateInputValue(editingPost.dateTime));
      setTime(toTimeInputValue(editingPost.dateTime));
      setVideoUrl(editingPost.media_url || "");
      setVideoFile(null);
      setVideoPreview(editingPost.media_url || null);
    } else {
      setTitle("");
      setCaption("");
      setAccount("primary");
      setPostNow(false);
      setDate(toDateInputValue(baseDate));
      setTime(toTimeInputValue(baseDate));
      setVideoUrl("");
      setVideoFile(null);
      setVideoPreview(null);
    }
  }, [isOpen, editingPost, defaultDate]);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert("Please select a video file");
        return;
      }
      // Validate file size (max 500MB for TikTok)
      if (file.size > 500 * 1024 * 1024) {
        alert("Video file is too large. Maximum size is 500MB");
        return;
      }
      setVideoFile(file);
      setVideoUrl(""); // Clear URL if file is selected
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
    if (e.target.value) {
      setVideoFile(null); // Clear file if URL is provided
      setVideoPreview(e.target.value);
    } else {
      setVideoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || (!postNow && (!date || !time))) {
      alert("Please fill in title, date and time (unless posting now).");
      return;
    }

    if (!videoFile && !videoUrl.trim()) {
      alert("Please provide a video file or video URL");
      return;
    }

    // If there's a video file, we need to upload it first
    let finalMediaUrl = videoUrl.trim();
    if (videoFile && !videoUrl.trim()) {
      try {
        // Call onSave with the file - parent component will handle upload
        onSave({
          id: editingPost ? editingPost.id : null,
          title: title.trim(),
          caption: caption.trim(),
          date,
          time,
          account,
          postNow,
          videoFile,
          videoUrl: null
        });
        return;
      } catch (error) {
        alert(`Failed to upload video: ${error.message}`);
        return;
      }
    }

    onSave({
      id: editingPost ? editingPost.id : null,
      title: title.trim(),
      caption: caption.trim(),
      date,
      time,
      account,
      postNow,
      videoFile: null,
      videoUrl: finalMediaUrl
    });
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target.id === "modal-backdrop") onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3 id="modal-title">
            {editingPost ? "Edit scheduled post" : "Schedule TikTok post"}
          </h3>
          <button className="icon-button" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="post-form" className="modal-body" onSubmit={handleSubmit}>
          <div className="field-row">
            <label htmlFor="post-title">Internal title</label>
            <input
              id="post-title"
              type="text"
              placeholder="e.g. Product launch teaser"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="post-caption">TikTok caption</label>
            <textarea
              id="post-caption"
              rows="3"
              placeholder="Write the actual TikTok caption here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>
          </div>

          <div className="field-row">
            <label htmlFor="post-video">Video</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                id="post-video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                style={{ marginBottom: "8px" }}
              />
              <div style={{ textAlign: "center", color: "var(--text-soft)", fontSize: "12px" }}>
                OR
              </div>
              <input
                id="post-video-url"
                type="url"
                placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                value={videoUrl}
                onChange={handleVideoUrlChange}
              />
            </div>
            {videoPreview && (
              <div style={{ marginTop: "12px" }}>
                <video
                  src={videoPreview}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    borderRadius: "4px",
                    backgroundColor: "var(--bg-secondary)"
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {videoFile && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-soft)" }}>
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="field-row inline">
            <div>
              <label htmlFor="post-date">Date</label>
              <input
                id="post-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={postNow}
                required={!postNow}
              />
            </div>
            <div>
              <label htmlFor="post-time">Time</label>
              <input
                id="post-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={postNow}
                required={!postNow}
              />
            </div>
          </div>

          <div className="field-row">
            <label htmlFor="post-account">TikTok account</label>
            <select
              id="post-account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              <option value="primary">Main brand account</option>
              <option value="test">Test sandbox account</option>
            </select>
          </div>

          <div className="field-row checkbox-row">
            <label>
              <input
                type="checkbox"
                id="post-now"
                checked={postNow}
                onChange={(e) => setPostNow(e.target.checked)}
              />
              Post immediately (ignore schedule)
            </label>
            <span className="hint">
              In the real system this would trigger the posting service
              directly.
            </span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostModal;
