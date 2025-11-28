import React from "react";

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'draft':
      return { bg: 'rgba(156, 163, 175, 0.2)', border: 'rgba(156, 163, 175, 0.4)', icon: 'fa-edit' };
    case 'scheduled':
      return { bg: 'linear-gradient(135deg, #00c9ff 0%, #ff67e0 100%)', border: 'rgba(0, 201, 255, 0.6)', icon: 'fa-clock' };
    case 'posted':
      return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', icon: 'fa-check-circle' };
    case 'failed':
      return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', icon: 'fa-exclamation-circle' };
    default:
      return { bg: 'rgba(156, 163, 175, 0.2)', border: 'rgba(156, 163, 175, 0.4)', icon: 'fa-circle' };
  }
};

function Calendar({ currentDate, posts, filter, sameDay, matchesFilter, onDayClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Mon = 0
  const daysFromPrevMonth = startWeekday;
  const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    const dayNumber = cellIndex - daysFromPrevMonth + 1;
    const cellDate = new Date(year, month, dayNumber);

    const isOutside = dayNumber < 1 || dayNumber > daysInMonth;
    const isToday = !isOutside && sameDay(cellDate, today);

    // Get all posts for this day
    const postsForDay = posts.filter((p) => {
      if (!p.dateTime) {
        // Drafts without dates - show on today's date when viewing current month
        if (p.status === 'draft' && sameDay(cellDate, today) && 
            year === today.getFullYear() && month === today.getMonth()) {
          return true;
        }
        return false;
      }
      return sameDay(p.dateTime, cellDate);
    });
    
    const visiblePosts = postsForDay.filter((p) =>
      matchesFilter(p.status, filter)
    );

    // Group posts by status for better display
    const postsByStatus = visiblePosts.reduce((acc, post) => {
      if (!acc[post.status]) acc[post.status] = [];
      acc[post.status].push(post);
      return acc;
    }, {});

    cells.push(
      <div
        key={cellIndex}
        className={`calendar-day${isOutside ? " outside" : ""}`}
        onClick={() => {
          if (!isOutside) onDayClick(cellDate);
        }}
      >
        <div className={`day-number${isToday ? " today" : ""}`}>
          {cellDate.getDate()}
        </div>

        {visiblePosts.length > 0 && (
          <div className="day-posts-container">
            {Object.entries(postsByStatus).slice(0, 3).map(([status, statusPosts]) => {
              const statusColors = getStatusColor(status);
              const post = statusPosts[0];
              return (
                <div
                  key={status}
                  className="day-post-preview"
                  style={{
                    background: statusColors.bg,
                    border: `1px solid ${statusColors.border}`,
                    color: status === 'scheduled' ? '#020617' : 'var(--text)',
                    marginTop: '4px'
                  }}
                  title={`${statusPosts.length} ${status} post${statusPosts.length > 1 ? 's' : ''}`}
                >
                  <i className={`fa-solid ${statusColors.icon}`}></i>
                  {post.dateTime ? (
                    <>
                      <span className="day-post-preview-time">
                        {post.dateTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <span className="day-post-preview-title">
                        · {post.title}
                      </span>
                    </>
                  ) : (
                    <span className="day-post-preview-title">
                      {post.title}
                    </span>
                  )}
                  {statusPosts.length > 1 && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '9px',
                      opacity: 0.8,
                      fontWeight: '700'
                    }}>
                      +{statusPosts.length - 1}
                    </span>
                  )}
                </div>
              );
            })}
            {visiblePosts.length > 3 && (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  color: "var(--text-soft)",
                  textAlign: "center",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.05)"
                }}
              >
                +{visiblePosts.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-grid header-row">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>
      <div id="calendar-body" className="calendar-grid body-rows">
        {cells}
      </div>
    </div>
  );
}

export default Calendar;
