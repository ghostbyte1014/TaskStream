import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TaskModal({
  isOpen,
  onClose,
  editingTaskId,
  tasks,
  categories,
  defaultCategory,
  onSave
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('work');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [tags, setTags] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [reminder, setReminder] = useState('');
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState(false);

  const applyTemplate = (template) => {
    setTitle(template.title);
    setDescription(template.description || '');
    setCategory(template.category || 'work');
    setPriority(template.priority || 'medium');
    setEstimatedDuration(template.estimatedDuration ? String(template.estimatedDuration) : '');
    setTags((template.tags || []).join(', '));
    setSubtasks((template.subtasks || []).map((st, i) => ({ id: 'st_' + Date.now() + '_' + i, text: st, completed: false })));
  };

  useEffect(() => {
    if (isOpen) {
      if (editingTaskId) {
        const t = tasks.find(item => item.id === editingTaskId);
        if (t) {
          setTitle(t.title || '');
          setDescription(t.description || '');
          setDueDate(t.dueDate || '');
          setDueTime(t.dueTime || '');
          setPriority(t.priority || 'medium');
          setCategory(t.category || 'work');
          setEstimatedDuration(t.estimatedDuration != null ? String(t.estimatedDuration) : '');
          setAmount(t.amount != null ? String(t.amount) : '');
          setTags((t.tags || []).join(', '));
          setSubtasks(t.subtasks || []);
          setRecurring(t.recurring || 'none');
          setReminder(t.reminder || '');
          setNotes(t.notes || '');
        }
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setDueTime('');
        setPriority('medium');
        setCategory(defaultCategory || (categories[0] ? categories[0].id : 'work'));
        setEstimatedDuration('');
        setAmount('');
        setTags('');
        setSubtasks([]);
        setNewSubtaskText('');
        setRecurring('none');
        setReminder('');
        setNotes('');
      }
      setTitleError(false);
    }
  }, [isOpen, editingTaskId, tasks, categories, defaultCategory]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: 'st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (stId) => {
    setSubtasks(prev => prev.filter(st => st.id !== stId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const parsedTags = tags.split(',').map(s => s.trim()).filter(Boolean);
    const data = {
      title: title.trim(),
      description,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority,
      category,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : null,
      amount: amount !== '' ? Number(amount) : null,
      tags: parsedTags,
      subtasks,
      recurring,
      reminder: reminder || null,
      notes,
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{editingTaskId ? 'Edit task' : 'New task'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!editingTaskId && (
              <div className="field" style={{ background: 'var(--bg-sunken)', padding: 10, borderRadius: 'var(--radius-m)', marginBottom: 16 }}>
                <label style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-faint)', marginBottom: 6 }}>
                  ⚡ Quick Templates
                </label>
                <div className="chip-row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyTemplate({
                      title: 'Weekly Planning & Review',
                      description: 'Review accomplishments, organize upcoming priorities, and clear inbox.',
                      category: 'work',
                      priority: 'medium',
                      estimatedDuration: 45,
                      tags: ['planning', 'weekly'],
                      subtasks: ['Review inbox & emails', 'Check upcoming calendar events', 'Set top 3 priorities for the week']
                    })}
                  >
                    📅 Weekly Review
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyTemplate({
                      title: 'Pay monthly subscription bill',
                      category: 'subscriptions',
                      priority: 'high',
                      tags: ['billing', 'finance'],
                      subtasks: ['Check invoice amount', 'Process payment online', 'Save receipt']
                    })}
                  >
                    💳 Bill Payment
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyTemplate({
                      title: '30-minute workout session',
                      category: 'health',
                      priority: 'low',
                      estimatedDuration: 30,
                      tags: ['fitness', 'health'],
                      subtasks: ['Warmup & stretching (5 min)', 'Main workout routine (20 min)', 'Cooldown (5 min)']
                    })}
                  >
                    🏋️ Workout Routine
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyTemplate({
                      title: 'Deep Focus Study Sprint',
                      category: 'study',
                      priority: 'medium',
                      estimatedDuration: 60,
                      tags: ['study', 'focus'],
                      subtasks: ['Review chapter notes', 'Complete practice exercise', 'Summarize key takeaways']
                    })}
                  >
                    📚 Study Sprint
                  </button>
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="f-title">Task title *</label>
              <input
                type="text"
                id="f-title"
                required
                maxLength={140}
                placeholder="e.g. Finish project presentation"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(false);
                }}
                autoFocus
              />
              {titleError && (
                <div className="field-help" style={{ color: 'var(--high)', display: 'block' }}>
                  Please enter a title.
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="f-desc">Description</label>
              <textarea
                id="f-desc"
                maxLength={500}
                placeholder="Add more detail…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field field-row">
              <div>
                <label htmlFor="f-date">Due date</label>
                <input
                  type="date"
                  id="f-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="f-time">Due time</label>
                <input
                  type="time"
                  id="f-time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Priority</label>
              <div className="priority-select">
                <button
                  type="button"
                  className={`priority-opt ${priority === 'low' ? 'sel' : ''}`}
                  data-p="low"
                  onClick={() => setPriority('low')}
                >
                  🟢 Low
                </button>
                <button
                  type="button"
                  className={`priority-opt ${priority === 'medium' ? 'sel' : ''}`}
                  data-p="medium"
                  onClick={() => setPriority('medium')}
                >
                  🟡 Medium
                </button>
                <button
                  type="button"
                  className={`priority-opt ${priority === 'high' ? 'sel' : ''}`}
                  data-p="high"
                  onClick={() => setPriority('high')}
                >
                  🔴 High
                </button>
              </div>
            </div>

            <div className="field field-row">
              <div>
                <label htmlFor="f-category">Category</label>
                <select
                  id="f-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-duration">Estimated time (min)</label>
                <input
                  type="number"
                  id="f-duration"
                  min="0"
                  step="5"
                  placeholder="60"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="f-amount">
                Amount <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional — useful for subscriptions or paid events)</span>
              </label>
              <input
                type="number"
                id="f-amount"
                min="0"
                step="0.01"
                placeholder="e.g. 9.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="f-tags">
                Tags <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(comma separated)</span>
              </label>
              <input
                type="text"
                id="f-tags"
                placeholder="urgent, client, q3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Subtasks / Checklist</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Add a subtask item…"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddSubtask}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-sunken)', padding: 8, borderRadius: 'var(--radius-s)' }}>
                  {subtasks.map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>☑ {st.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        style={{ border: 'none', background: 'none', color: 'var(--ink-faint)', fontSize: 14 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field field-row">
              <div>
                <label htmlFor="f-recur">Repeat</label>
                <select
                  id="f-recur"
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value)}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Every day</option>
                  <option value="weekday">Every weekday</option>
                  <option value="weekly">Every week</option>
                  <option value="monthly">Every month</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-reminder">Reminder</label>
                <input
                  type="datetime-local"
                  id="f-reminder"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="f-notes">Notes</label>
              <textarea
                id="f-notes"
                maxLength={500}
                placeholder="Optional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTaskId ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
