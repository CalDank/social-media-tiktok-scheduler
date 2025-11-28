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
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const baseDate = defaultDate || new Date();

    if (editingPost) {
      setTitle(editingPost.title || "");
      setCaption(editingPost.caption || "");
      setAccount(editingPost.account || "primary");
      setPostNow(false);
      setSaveAsDraft(editingPost.status === "draft");
      setDate(editingPost.dateTime ? toDateInputValue(editingPost.dateTime) : toDateInputValue(baseDate));
      setTime(editingPost.dateTime ? toTimeInputValue(editingPost.dateTime) : toTimeInputValue(baseDate));
      setVideoUrl(editingPost.media_url || "");
      setVideoFile(null);
      setVideoPreview(editingPost.media_url || null);
    } else {
      setTitle("");
      setCaption("");
      setAccount("primary");
      setPostNow(false);
      setSaveAsDraft(false);
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
    if (!title.trim()) {
      alert("Please fill in the title.");
      return;
    }

    // For drafts, date/time/video are optional
    // For testing, video is optional even for scheduled posts
    if (!saveAsDraft) {
      if (!postNow && (!date || !time)) {
        alert("Please fill in date and time (unless posting now).");
        return;
      }
      // Video is optional for testing purposes
      // if (!videoFile && !videoUrl.trim()) {
      //   alert("Please provide a video file or video URL");
      //   return;
      // }
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
          saveAsDraft,
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
      saveAsDraft,
      videoFile: null,
      videoUrl: finalMediaUrl
    });
  };

  if (!isOpen) return null;

  const handlePostImmediately = () => {
    if (!title.trim()) {
      alert("Please fill in the title.");
      return;
    }

    // Post immediately with current form data
    onSave({
      id: editingPost ? editingPost.id : null,
      title: title.trim(),
      caption: caption.trim(),
      date: date || toDateInputValue(new Date()),
      time: time || toTimeInputValue(new Date()),
      account,
      postNow: true,
      saveAsDraft: false,
      videoFile: videoFile,
      videoUrl: videoUrl.trim() || null
    });
  };

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target.id === "modal-backdrop" || e.target.className === "modal-backdrop") {
          onClose();
        }
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
            <label htmlFor="post-video">
              Video 
              <span style={{ color: 'var(--text-soft)', fontSize: '11px', fontWeight: 'normal', marginLeft: '4px' }}>(optional - test mode)</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label 
                htmlFor="post-video-file" 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "2px dashed rgba(0, 201, 255, 0.3)",
                  background: "rgba(0, 201, 255, 0.05)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  gap: "8px",
                  color: "var(--accent)",
                  fontWeight: "500",
                  fontSize: "13px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 201, 255, 0.5)";
                  e.currentTarget.style.background = "rgba(0, 201, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 201, 255, 0.3)";
                  e.currentTarget.style.background = "rgba(0, 201, 255, 0.05)";
                }}
              >
                <i className="fa-solid fa-upload"></i>
                <span>Choose Video File</span>
              </label>
              <input
                id="post-video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                style={{ display: "none" }}
              />
              <div style={{ 
                textAlign: "center", 
                color: "var(--text-soft)", 
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600"
              }}>
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
              <div style={{ 
                marginTop: "16px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
              }}>
                <video
                  src={videoPreview}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "240px",
                    display: "block"
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {videoFile && (
              <div style={{ 
                marginTop: "12px", 
                fontSize: "12px", 
                color: "var(--text-soft)",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 201, 255, 0.08)",
                border: "1px solid rgba(0, 201, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i className="fa-solid fa-file-video" style={{ color: "var(--accent)" }}></i>
                <span>
                  <strong>{videoFile.name}</strong> ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <div className="field-row inline">
            <div>
              <label htmlFor="post-date">Date {saveAsDraft && <span style={{ color: 'var(--text-soft)', fontSize: '11px', fontWeight: 'normal' }}>(optional)</span>}</label>
              <input
                id="post-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={postNow}
                required={!postNow && !saveAsDraft}
              />
            </div>
            <div>
              <label htmlFor="post-time">Time {saveAsDraft && <span style={{ color: 'var(--text-soft)', fontSize: '11px', fontWeight: 'normal' }}>(optional)</span>}</label>
              <input
                id="post-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={postNow}
                required={!postNow && !saveAsDraft}
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
                id="save-as-draft"
                checked={saveAsDraft}
                onChange={(e) => {
                  setSaveAsDraft(e.target.checked);
                  if (e.target.checked) {
                    setPostNow(false);
                  }
                }}
              />
              Save as draft (date, time, and video optional)
            </label>
          </div>

          <div className="field-row checkbox-row">
            <label>
              <input
                type="checkbox"
                id="post-now"
                checked={postNow}
                onChange={(e) => {
                  setPostNow(e.target.checked);
                  if (e.target.checked) {
                    setSaveAsDraft(false);
                  }
                }}
                disabled={saveAsDraft}
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
            {editingPost && editingPost.status === "draft" && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePostImmediately}
                style={{ 
                  background: 'linear-gradient(135deg, #00c9ff 0%, #ff67e0 100%)'
                }}
              >
                <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i>
                Post Immediately
              </button>
            )}
            {saveAsDraft ? (
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--text-soft)' }}>
                Save as Draft
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                Save post
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostModal;
