import React from 'react';
import { TaskCard } from '../TaskCard';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';
import { isToday, isOverdue, isUpcoming } from '../../utils/dateUtils';

export function TasksView({ state, updateState, onToggleTask, onToggleSubtask, onEditTask, onDeleteTask }) {
  const { tasks, categories, filters, sortBy, currentView, search, settings, currentSection } = state;

  const getCategory = (id) => categories.find(c => c.id === id);

  const effectiveStatus = currentSection === 'overdue' ? 'overdue' : filters.status;

  const matchesSearch = (t, q) => {
    if (!q) return true;
    q = q.toLowerCase();
    const catName = getCategory(t.category)?.name || '';
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  };

  const matchesStatusFilter = (t, status) => {
    switch (status) {
      case 'active': return !t.completed;
      case 'completed': return t.completed;
      case 'today': return isToday(t);
      case 'upcoming': return isUpcoming(t);
      case 'overdue': return isOverdue(t);
      default: return true;
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (!settings.showCompleted && t.completed) return false;
    if (!matchesStatusFilter(t, effectiveStatus)) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.tag && !(t.tags || []).includes(filters.tag)) return false;
    if (!matchesSearch(t, search)) return false;
    return true;
  });

  const pOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return a.order - b.order;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (a.dueDate + (a.dueTime || '99:99')).localeCompare(b.dueDate + (b.dueTime || '99:99'));
      case 'priority':
        return pOrder[a.priority] - pOrder[b.priority] || a.order - b.order;
      case 'created':
        return b.createdAt - a.createdAt;
      case 'alpha':
        return a.title.localeCompare(b.title);
      case 'status':
        return (a.completed === b.completed ? 0 : a.completed ? 1 : -1) || a.order - b.order;
      case 'manual':
      default:
        return a.order - b.order;
    }
  });

  const emptyContext = search
    ? 'search'
    : effectiveStatus === 'overdue'
    ? 'overdue'
    : effectiveStatus === 'completed'
    ? 'completed'
    : 'default';

  const emptyVariants = {
    search: { em: '🔎', t: 'No tasks found', d: 'Try a different search term.' },
    today: { em: '🎉', t: 'No tasks today!', d: 'Enjoy your free time.' },
    overdue: { em: '✨', t: "You're all caught up!", d: 'No overdue tasks — great job staying organized.' },
    completed: { em: '📭', t: 'Nothing completed yet', d: 'Finished tasks will show up here.' },
    default: { em: '✨', t: "You're completely caught up!", d: 'Great job staying organized.' }
  };
  const empty = emptyVariants[emptyContext] || emptyVariants.default;

  return (
    <section id="section-all">
      <div className="toolbar">
        <div className="chip-row">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' }
          ].map(chip => (
            <button
              key={chip.id}
              className={`chip ${effectiveStatus === chip.id ? 'active' : ''}`}
              onClick={() => {
                updateState(s => ({
                  ...s,
                  currentSection: chip.id === 'overdue' ? 'overdue' : 'all',
                  filters: { ...s.filters, status: chip.id }
                }));
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="toolbar-spacer" />

        <select
          className="select-mini"
          value={sortBy}
          onChange={(e) => updateState(s => ({ ...s, sortBy: e.target.value }))}
          aria-label="Sort tasks"
        >
          <option value="dueDate">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
          <option value="created">Sort: Newest</option>
          <option value="alpha">Sort: A–Z</option>
          <option value="status">Sort: Status</option>
          <option value="manual">Sort: Manual order</option>
        </select>

        <div className="view-toggle">
          <button
            data-view="list"
            className={currentView === 'list' ? 'active' : ''}
            onClick={() => updateState(s => ({ ...s, currentView: 'list' }))}
          >
            ☷ List
          </button>
          <button
            data-view="board"
            className={currentView === 'board' ? 'active' : ''}
            onClick={() => updateState(s => ({ ...s, currentView: 'board' }))}
          >
            ▦ Board
          </button>
          <button
            data-view="calendar"
            className={currentView === 'calendar' ? 'active' : ''}
            onClick={() => updateState(s => ({ ...s, currentView: 'calendar' }))}
          >
            📅 Calendar
          </button>
        </div>
      </div>

      {search && (
        <div className="field-help" style={{ marginBottom: 8 }}>
          {sortedTasks.length} task{sortedTasks.length === 1 ? '' : 's'} found
        </div>
      )}

      {currentView === 'list' && (
        <div className="task-list">
          {sortedTasks.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">{empty.em}</span>
              <h4>{empty.t}</h4>
              <p>{empty.d}</p>
            </div>
          ) : (
            sortedTasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                category={getCategory(t.category)}
                onToggle={onToggleTask}
                onToggleSubtask={onToggleSubtask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                draggable={sortBy === 'manual'}
              />
            ))
          )}
        </div>
      )}

      {currentView === 'board' && (
        <KanbanView
          state={state}
          updateState={updateState}
          onToggleTask={onToggleTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {currentView === 'calendar' && (
        <CalendarView
          state={state}
          updateState={updateState}
          onToggleTask={onToggleTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </section>
  );
}
