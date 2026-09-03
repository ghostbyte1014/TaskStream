import React from 'react';
import { TaskCard } from '../TaskCard';
import { isToday, timeBucket } from '../../utils/dateUtils';

export function TodayView({ state, onToggleTask, onToggleSubtask, onEditTask, onDeleteTask }) {
  const { tasks, categories, settings } = state;

  const todays = tasks.filter(t => isToday(t) && (!t.completed || settings.showCompleted));
  const doneToday = todays.filter(t => t.completed).length;
  const pct = todays.length ? Math.round((doneToday / todays.length) * 100) : 0;

  const getCategory = (id) => categories.find(c => c.id === id);

  const groups = { morning: [], afternoon: [], evening: [], anytime: [] };
  todays.forEach(t => groups[timeBucket(t)].push(t));

  const labels = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    anytime: 'Anytime'
  };

  return (
    <section id="section-today">
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>Today's progress</h3>
        {todays.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🎉</span>
            <h4>No tasks today!</h4>
            <p>Enjoy your free time.</p>
          </div>
        ) : (
          <div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="field-help">
              {doneToday} of {todays.length} tasks completed ({pct}%)
            </div>
            {doneToday === todays.length && todays.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                🎉 You're all done for today. Amazing work!
              </div>
            )}
          </div>
        )}
      </div>

      {todays.length > 0 && (
        <div className="today-groups">
          {Object.keys(labels).map(k => {
            if (!groups[k].length) return null;
            return (
              <div key={k}>
                <div className="today-group-title">{labels[k]}</div>
                <div className="task-list">
                  {groups[k].map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      category={getCategory(t.category)}
                      onToggle={onToggleTask}
                      onToggleSubtask={onToggleSubtask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      draggable={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
