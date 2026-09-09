export const STORAGE_KEY = 'taskManagerState_v1';

export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', icon: '💼', color: '#B5541F', custom: false },
  { id: 'personal', name: 'Personal', icon: '🏠', color: '#3F7757', custom: false },
  { id: 'study', name: 'Study', icon: '📚', color: '#9C7A22', custom: false },
  { id: 'health', name: 'Health', icon: '🏋️', color: '#A23B33', custom: false },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#5B6EA2', custom: false },
  { id: 'ideas', name: 'Ideas', icon: '💡', color: '#7A579C', custom: false },
  { id: 'subscriptions', name: 'Subscriptions', icon: '💳', color: '#2C6E9E', custom: false },
  { id: 'events', name: 'Events', icon: '🎫', color: '#2C7A7B', custom: false },
];

export function uid() {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function defaultState() {
  return {
    tasks: [],
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    filters: { status: 'all', priority: null, category: null, tag: null },
    search: '',
    sortBy: 'dueDate',
    currentView: 'list',
    currentSection: 'overview',
    theme: 'system',
    density: 'comfortable',
    settings: {
      theme: 'system',
      compactDensity: false,
      showCompleted: true,
      soundEffects: true,
      notifications: true,
      notificationSettings: {
        enabled: true,
        deadlines: true,
        leadTimeMinutes: 15,
        overdue: true,
        subscriptions: true,
        dailyBriefing: true,
        briefingTime: '09:00',
        streakReminder: true,
        streakReminderTime: '18:00',
        achievements: true
      },
      confirmDelete: true,
      autoMoveCompleted: false 
    },
    streak: { count: 0, lastCompletedDate: null },
    achievementsUnlocked: [],
    sampleDataSeen: false,
    onboardingSeen: false,
    tutorialCompleted: false,
    calendarCursor: { year: new Date().getFullYear(), month: new Date().getMonth() },
    calendarSelected: null,
    lastBackupReminder: Date.now(),
    lastVersionSeen: '',
    inbox: [],
  };
}

export function storageAvailable() {
  try {
    const k = '__lt_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

export const STORAGE_OK = storageAvailable();

export function seedSampleData(s) {
  const today = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  const mk = over => ({
    id: uid(),
    title: '',
    description: '',
    dueDate: null,
    dueTime: null,
    priority: 'medium',
    category: 'work',
    tags: [],
    subtasks: [],
    estimatedDuration: null,
    recurring: 'none',
    reminder: null,
    notes: '',
    completed: false,
    completedAt: null,
    createdAt: Date.now(),
    order: 0,
    sample: true,
    ...over,
  });

  s.tasks = [
    mk({ title: 'Review project requirements', category: 'work', priority: 'medium', completed: true, completedAt: Date.now() - 3600e3, dueDate: iso(today), order: 0 }),
    mk({ title: 'Finish presentation', category: 'work', priority: 'high', dueDate: iso(today), dueTime: '20:00', order: 1, description: 'Prepare slides and review talking points.', subtasks: [{ id: 'st_1', text: 'Draft outline', completed: true }, { id: 'st_2', text: 'Design slides', completed: false }, { id: 'st_3', text: 'Practice speech', completed: false }] }),
    mk({ title: 'Team meeting', category: 'work', priority: 'medium', dueDate: iso(today), dueTime: '10:00', order: 2 }),
    mk({ title: 'Go for a 30-minute walk', category: 'health', priority: 'low', dueDate: iso(today), dueTime: '18:00', order: 3, recurring: 'daily' }),
    mk({ title: 'Buy groceries', category: 'shopping', priority: 'low', dueDate: iso(new Date(today.getTime() + 86400e3)), order: 4 }),
    mk({ title: 'Submit report', category: 'work', priority: 'high', dueDate: iso(new Date(today.getTime() - 86400e3)), order: 5 }),
    mk({ title: 'Read a chapter', category: 'study', priority: 'low', dueDate: iso(new Date(today.getTime() + 2 * 86400e3)), order: 6, tags: ['reading'] }),
  ];
  s.sampleDataSeen = true;
  return s;
}

export function loadState() {
  if (!STORAGE_OK) {
    return seedSampleData(defaultState());
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedSampleData(defaultState());
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tasks)) throw new Error('corrupt');
    const merged = Object.assign(defaultState(), parsed);
    merged.categories = Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : DEFAULT_CATEGORIES.map(c => ({ ...c }));
    merged.settings = Object.assign(defaultState().settings, parsed.settings || {});
    merged.streak = Object.assign({ count: 0, lastCompletedDate: null }, parsed.streak || {});
    merged.inbox = Array.isArray(parsed.inbox) ? parsed.inbox : [];
    return merged;
  } catch (e) {
    console.warn('LocalStorage data was invalid, resetting.', e);
    return seedSampleData(defaultState());
  }
}

export function saveStateToStorage(state) {
  if (!STORAGE_OK) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Failed to save to LocalStorage', e);
    return false;
  }
}
