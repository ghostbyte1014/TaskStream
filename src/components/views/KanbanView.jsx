import React, { useState } from 'react';
import { TaskCard } from '../TaskCard';
import { todayISO } from '../../utils/dateUtils';

export function KanbanView({ state, updateState, onToggleTask, onEditTask, onDeleteTask }) {
  const { tasks, categories } = state;
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const getCategory = (id) => categories.find(c => c.id === id);

  const cols = [
    { key: 'todo', title: 'To do', filter: t => !t.completed && (!t.dueDate || t.dueDate >= todayISO()) },
    { key: 'progress', title: 'In progress', filter: t => !t.completed && t.dueDate && t.dueDate < todayISO() },
    { key: 'done', title: 'Done', filter: t => t.completed },
  ];

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    setDragOverCol(colKey);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colKey) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedTaskId) return;

    if (colKey === 'done') {
      const targetTask = tasks.find(t => t.id === draggedTaskId);
      if (targetTask && !targetTask.completed) {
        onToggleTask(draggedTaskId);
      }
    } else {
      updateState(s => {
        const nextTasks = s.tasks.map(t => {
          if (t.id === draggedTaskId) {
            if (colKey === 'progress') {
              const yesterday = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
              return { ...t, completed: false, completedAt: null, dueDate: yesterday };
            } else {
              return { ...t, completed: false, completedAt: null };
            }
          }
          return t;
        });
        return { ...s, tasks: nextTasks };
      });
    }

    setDraggedTaskId(null);
  };

  return (
    <div className="kanban">
      {cols.map(c => {
        const colTasks = tasks.filter(c.filter);
        const isOver = dragOverCol === c.key;

        return (
          <div
            key={c.key}
            className={`kanban-col ${isOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, c.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, c.key)}
          >
            <h4>
              {c.title} <span>{colTasks.length}</span>
            </h4>
            <div className="task-list">
              {colTasks.length > 0 ? (
                colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    category={getCategory(t.category)}
                    onToggle={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    draggable={true}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              ) : (
                <div className="field-help" style={{ padding: 10 }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
