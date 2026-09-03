import React from 'react';
import { TaskCard } from '../TaskCard';
import { isToday, isOverdue, isUpcoming } from '../../utils/dateUtils';

export function OverviewView({ state, onToggleTask, onToggleSubtask, onEditTask, onDeleteTask }) {
  const { tasks, categories, streak } = state;

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const todayCount = tasks.filter(isToday).length;
  const overdueCount = tasks.filter(isOverdue).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const getCategory = (id) => categories.find(c => c.id === id);

  // 7 days completion
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = tasks.filter(
      t => t.completed && t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === iso
    ).length;
    days.push({
      date: iso,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count,
      isToday: i === 0
    });
  }

  const max = Math.max(1, ...days.map(d => d.count));
  const totalWeek = days.reduce((a, b) => a + b.count, 0);
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  const avg = (totalWeek / 7).toFixed(1);

  // Today progress
  const todays = tasks.filter(isToday);
  const doneToday = todays.filter(t => t.completed).length;
  const todayPct = todays.length ? Math.round((doneToday / todays.length) * 100) : 0;

  // Lists
  const overdueTasks = tasks.filter(isOverdue).slice(0, 5);
  const upcomingTasks = tasks
    .filter(t => !t.completed && (isToday(t) || isUpcoming(t)))
    .sort((a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9'))
    .slice(0, 5);

  // Renewals & Events (horizon 14 days)
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);
  const horizonIso = horizon.toISOString().slice(0, 10);
  const renewals = tasks
    .filter(t => !t.completed && (t.category === 'subscriptions' || t.category === 'events') && t.dueDate && t.dueDate <= horizonIso)
    .sort((a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9'));

  const monthlySpend = tasks
    .filter(t => t.category === 'subscriptions' && t.amount != null && (t.recurring === 'monthly' || t.recurring === 'none'))
    .reduce((sum, t) => sum + (t.recurring === 'monthly' ? Number(t.amount) : 0), 0);

  return (
    <section id="section-overview">
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">📋 Total tasks</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">⏳ Pending</div>
          <div className="value">{pending}</div>
        </div>
        <div className="stat-card good">
          <div className="label">✅ Completed</div>
          <div className="value">{completed}</div>
        </div>
        <div className="stat-card">
          <div className="label">🔥 Today</div>
          <div className="value">{todayCount}</div>
        </div>
        <div className={`stat-card ${overdueCount ? 'warn' : ''}`}>
          <div className="label">⚠️ Overdue</div>
          <div className="value">{overdueCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">📊 Completion</div>
          <div className="value">{rate}%</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>Last 7 days</h3>
          <div className="chart-bars">
            {days.map((d, i) => (
              <div key={i} className={`chart-col ${d.isToday ? 'today' : ''}`}>
                <div
                  className="bar"
                  style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                  title={`${d.count} completed`}
                />
                <div className="bar-label">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="chart-meta">
            <div>
              <strong>{totalWeek}</strong>completed this week
            </div>
            <div>
              <strong>{best.count ? best.label : '—'}</strong>most productive day
            </div>
            <div>
              <strong>{avg}</strong>avg per day
            </div>
            <div>
              <strong>{streak.count}🔥</strong>current streak
            </div>
          </div>
        </div>

        <div className="panel">
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
                <div className="progress-fill" style={{ width: `${todayPct}%` }} />
              </div>
              <div className="field-help">
                {doneToday} of {todays.length} tasks completed ({todayPct}%)
              </div>
              {doneToday === todays.length && todays.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                  🎉 You're all done for today. Amazing work!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Overdue <span className="sub">needs attention</span></h3>
          <div className="task-list">
            {overdueTasks.length === 0 ? (
              <div className="empty-state">
                <span className="emoji">✨</span>
                <h4>You're all caught up!</h4>
                <p>No overdue tasks — great job staying organized.</p>
              </div>
            ) : (
              overdueTasks.map(t => (
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
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <h3>Up next</h3>
          <div className="task-list">
            {upcomingTasks.length === 0 ? (
              <div className="empty-state">
                <span className="emoji">✨</span>
                <h4>You're completely caught up!</h4>
                <p>Great job staying organized.</p>
              </div>
            ) : (
              upcomingTasks.map(t => (
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
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>
          Upcoming renewals &amp; events{' '}
          <span className="sub">
            {monthlySpend > 0 ? `≈ $${monthlySpend.toFixed(2)}/mo in tracked subscriptions` : ''}
          </span>
        </h3>
        <div className="task-list">
          {renewals.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">✨</span>
              <h4>No upcoming renewals or events</h4>
              <p>Items in Subscriptions or Events categories with due dates will appear here.</p>
            </div>
          ) : (
            renewals.map(t => (
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
