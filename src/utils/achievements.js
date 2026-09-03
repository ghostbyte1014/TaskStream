import { isToday } from './dateUtils';

export const ACHIEVEMENT_DEFS = [
  { id: 'first', emoji: '🏆', title: 'First Task', desc: 'Complete your first task.', check: s => s.tasks.some(t => t.completed) },
  { id: 'streak7', emoji: '🔥', title: '7 Day Streak', desc: 'Maintain a 7-day streak.', check: s => s.streak.count >= 7 },
  { id: 'century', emoji: '💯', title: 'Century', desc: 'Complete 100 tasks.', check: s => s.tasks.filter(t => t.completed).length >= 100 },
  { id: 'productive', emoji: '⚡', title: 'Productive Day', desc: 'Complete 10 tasks in one day.', check: s => maxTasksCompletedInADay(s) >= 10 },
  { id: 'perfect', emoji: '🎯', title: 'Perfect Day', desc: 'Complete every task scheduled for today.', check: s => isPerfectToday(s) },
];

export function maxTasksCompletedInADay(state) {
  const map = {};
  state.tasks.forEach(t => {
    if (t.completed && t.completedAt) {
      const k = new Date(t.completedAt).toISOString().slice(0, 10);
      map[k] = (map[k] || 0) + 1;
    }
  });
  return Object.values(map).reduce((m, v) => Math.max(m, v), 0);
}

export function isPerfectToday(state) {
  const todays = state.tasks.filter(isToday);
  return todays.length > 0 && todays.every(t => t.completed);
}

export function checkAchievements(state) {
  const unlockedNow = [];
  const currentUnlocked = state.achievementsUnlocked || [];
  ACHIEVEMENT_DEFS.forEach(def => {
    const already = currentUnlocked.includes(def.id);
    if (!already && def.check(state)) {
      currentUnlocked.push(def.id);
      unlockedNow.push(def);
    }
  });
  return unlockedNow;
}
