import React from 'react';
import { TaskCard } from '../TaskCard';
import { todayISO, fmtDate } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarView({ state, updateState, onToggleTask, onEditTask, onDeleteTask }) {
  const { tasks, categories, calendarCursor, calendarSelected } = state;
  const { year, month } = calendarCursor;

  const getCategory = (id) => categories.find(c => c.id === id);

  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const titleText = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      muted: false,
      iso: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (startDow + daysInMonth) + 1, muted: true });
  }

  const dowNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIso = todayISO();

  const handlePrevMonth = () => {
    updateState(s => {
      let { year: y, month: m } = s.calendarCursor;
      m--;
      if (m < 0) { m = 11; y--; }
      return { ...s, calendarCursor: { year: y, month: m } };
    });
  };

  const handleNextMonth = () => {
    updateState(s => {
      let { year: y, month: m } = s.calendarCursor;
      m++;
      if (m > 11) { m = 0; y++; }
      return { ...s, calendarCursor: { year: y, month: m } };
    });
  };

  const handleDaySelect = (iso) => {
    updateState(s => ({
      ...s,
      calendarSelected: s.calendarSelected === iso ? null : iso
    }));
  };

  const selectedDayTasks = calendarSelected
    ? tasks.filter(t => t.dueDate === calendarSelected)
    : [];

  return (
    <div className="panel">
      <div className="cal-head">
        <button className="btn-secondary" onClick={handlePrevMonth}>
          <ChevronLeft className="icon" style={{ display: 'inline', width: 14, height: 14 }} /> Prev
        </button>
        <h3 style={{ fontSize: 16 }}>{titleText}</h3>
        <button className="btn-secondary" onClick={handleNextMonth}>
          Next <ChevronRight className="icon" style={{ display: 'inline', width: 14, height: 14 }} />
        </button>
      </div>

      <div className="cal-grid">
        {dowNames.map((d, i) => (
          <div key={i} className="cal-dow">{d}</div>
        ))}
        {cells.map((c, i) => {
          if (c.muted) {
            return (
              <div key={i} className="cal-cell muted">
                <span className="n">{c.day}</span>
              </div>
            );
          }
          const dayTasks = tasks.filter(t => t.dueDate === c.iso);
          const isToday = c.iso === todayIso;
          const isSel = c.iso === calendarSelected;

          return (
            <button
              key={i}
              className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
              onClick={() => handleDaySelect(c.iso)}
            >
              <span className="n">{c.day}</span>
              <span className="cal-dots">
                {dayTasks.slice(0, 4).map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: `var(--${t.priority === 'high' ? 'high' : t.priority === 'medium' ? 'med' : 'low'})`
                    }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {calendarSelected && (
        <div className="cal-day-tasks">
          <h4 style={{ fontSize: 13, marginBottom: 8, color: 'var(--ink-soft)' }}>
            {fmtDate(calendarSelected)}
          </h4>
          {selectedDayTasks.length > 0 ? (
            <div className="task-list">
              {selectedDayTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  category={getCategory(t.category)}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  draggable={false}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="emoji">🎉</span>
              <h4>No tasks scheduled for this day</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
