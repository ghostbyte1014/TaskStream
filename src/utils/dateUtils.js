export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(task) {
  return !task.completed && task.dueDate && task.dueDate < todayISO();
}

export function isToday(task) {
  return task.dueDate === todayISO();
}

export function isUpcoming(task) {
  return !task.completed && task.dueDate && task.dueDate > todayISO();
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

export function fmtTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

export function timeBucket(task) {
  if (!task.dueTime) return 'anytime';
  const h = Number(task.dueTime.split(':')[0]);
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
