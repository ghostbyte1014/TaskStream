import React from 'react';
import { fmtDate, fmtTime, isOverdue } from '../utils/dateUtils';
import { GripVertical, Check, Edit2, Trash2 } from 'lucide-react';

export function TaskCard({
  task,
  category,
  onToggle,
  onToggleSubtask,
  onEdit,
  onDelete,
  onOpen,
  draggable = true,
  onDragStart,
  onDragEnd
}) {
  const overdue = isOverdue(task);

  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
      data-priority={task.priority}
      data-task-id={task.id}
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart && onDragStart(e, task.id) : undefined}
      onDragEnd={draggable ? (e) => onDragEnd && onDragEnd(e) : undefined}
    >
      {draggable && (
        <span className="drag-handle" title="Drag to reorder">
          <GripVertical className="icon" style={{ width: 14, height: 14 }} />
        </span>
      )}

      <button
        className="task-check"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
      >
        {task.completed && <Check className="icon" style={{ width: 13, height: 13, stroke: '#fff' }} />}
      </button>

      <div
        className="task-main"
        onClick={() => onOpen ? onOpen(task.id) : onEdit(task.id)}
      >
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
        </div>

        <div className="task-meta">
          <span className="meta-item">
            {category ? `${category.icon} ${category.name}` : '—'}
          </span>
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          {task.dueDate && (
            <span className="meta-item">
              {overdue ? '⚠️ ' : '📅 '}
              {fmtDate(task.dueDate)}
              {task.dueTime ? `, ${fmtTime(task.dueTime)}` : ''}
            </span>
          )}
          {task.recurring && task.recurring !== 'none' && (
            <span className="meta-item">🔁 {task.recurring}</span>
          )}
          {task.amount != null && (
            <span className="meta-item">💲{Number(task.amount).toFixed(2)}</span>
          )}
          {task.completed && (
            <span className="meta-item">
              Completed {task.completedAt ? fmtDate(new Date(task.completedAt).toISOString().slice(0, 10)) : ''}
            </span>
          )}
        </div>

        {task.description && (
          <div className="task-desc">{task.description}</div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-meta" style={{ marginTop: 4 }}>
            {task.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}

        {task.subtasks && task.subtasks.length > 0 && (() => {
          const completedCount = task.subtasks.filter(st => st.completed).length;
          const totalCount = task.subtasks.length;
          const subPct = Math.round((completedCount / totalCount) * 100);

          return (
            <div className="subtasks-container" style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
              <div className="meta-item" style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
                ☑ {completedCount}/{totalCount} subtasks ({subPct}%)
              </div>
              <div className="progress-track" style={{ height: 4, margin: '2px 0 6px' }}>
                <div className="progress-fill" style={{ width: `${subPct}%` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {task.subtasks.map(st => (
                  <label
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12.5,
                      color: st.completed ? 'var(--ink-faint)' : 'var(--ink)',
                      textDecoration: st.completed ? 'line-through' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask && onToggleSubtask(task.id, st.id)}
                      style={{ margin: 0, width: 14, height: 14, accentColor: 'var(--accent)' }}
                    />
                    {st.text}
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="task-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task.id);
          }}
          aria-label="Edit task"
        >
          <Edit2 className="icon" style={{ width: 15, height: 15 }} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Delete task"
        >
          <Trash2 className="icon" style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}
