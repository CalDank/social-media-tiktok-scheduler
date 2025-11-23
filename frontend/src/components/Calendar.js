import React from "react";

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

    const postsForDay = posts.filter((p) => sameDay(p.dateTime, cellDate));
    const visiblePosts = postsForDay.filter((p) =>
      matchesFilter(p.status, filter)
    );

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
          <>
            <div className="day-post-preview">
              <i className="fa-brands fa-tiktok"></i>
              <span className="day-post-preview-time">
                {visiblePosts[0].dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
              <span className="day-post-preview-title">
                · {visiblePosts[0].title}
              </span>
            </div>
            {postsForDay.length > 1 && (
              <div
                style={{
                  marginTop: "2px",
                  fontSize: "10px",
                  color: "#9ca3af"
                }}
              >
                +{postsForDay.length - 1} more
              </div>
            )}
          </>
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
