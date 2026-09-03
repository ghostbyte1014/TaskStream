import { useState, useEffect, useCallback, useRef } from 'react';
import { loadState, saveStateToStorage, uid, defaultState, seedSampleData } from '../utils/storage';
import { isToday, isOverdue, todayISO, isUpcoming } from '../utils/dateUtils';
import { checkAchievements } from '../utils/achievements';

export function useTaskState() {
  const [state, setStateState] = useState(() => loadState());
  const [saveStatus, setSaveStatus] = useState('saved');
  const [toasts, setToasts] = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isTourActive, setIsTourActive] = useState(!state.tutorialCompleted);

  const lastDeletedRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Apply theme & density to document element
  useEffect(() => {
    let effective = state.theme;
    if (effective === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.setAttribute('data-density', state.density);
  }, [state.theme, state.density]);

  // Handle system color scheme changes live when theme === 'system'
  useEffect(() => {
    const handler = () => {
      if (state.theme === 'system') {
        const effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', effective);
      }
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [state.theme]);

  // Auto-save state changes
  const saveState = useCallback((newState) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const ok = saveStateToStorage(newState);
      setSaveStatus(ok ? 'saved' : 'error');
    }, 120);
  }, []);

  const updateState = useCallback((updater) => {
    setStateState(prevState => {
      const nextState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      saveState(nextState);
      return nextState;
    });
  }, [saveState]);

  // Toast trigger
  const showToast = useCallback((msg, actionLabel = null, onAction = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, actionLabel, onAction }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, actionLabel ? 4800 : 2800);
  }, []);

  // Celebration overlay
  const celebrate = useCallback((htmlContent) => {
    setCelebration(htmlContent);
    setTimeout(() => {
      setCelebration(null);
    }, 1800);
  }, []);

  const checkAndCelebrate = useCallback((currentState) => {
    const unlocked = checkAchievements(currentState);
    if (unlocked.length > 0) {
      unlocked.forEach((a, i) => {
        setTimeout(() => {
          celebrate(`<span class="em">${a.emoji}</span><div style="font-weight:600;">Achievement unlocked</div><div style="font-size:12px;color:var(--ink-soft);">${a.title}</div>`);
        }, i * 600);
      });
    }
  }, [celebrate]);

  // Streak logic
  const updateStreak = (s) => {
    const todayStr = todayISO();
    const last = s.streak.lastCompletedDate;
    if (last === todayStr) return;
    const yesterday = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
    if (last === yesterday) {
      s.streak.count += 1;
    } else {
      s.streak.count = 1;
    }
    s.streak.lastCompletedDate = todayStr;
  };

  // Task actions
  const createTask = useCallback((taskData) => {
    updateState(s => {
      const maxOrder = s.tasks.reduce((m, t) => Math.max(m, t.order || 0), 0);
      const newTask = {
        id: uid(),
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        dueDate: taskData.dueDate || null,
        dueTime: taskData.dueTime || null,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'work',
        tags: taskData.tags || [],
        estimatedDuration: taskData.estimatedDuration || null,
        amount: (taskData.amount != null && !isNaN(taskData.amount)) ? Number(taskData.amount) : null,
        recurring: taskData.recurring || 'none',
        reminder: taskData.reminder || null,
        notes: taskData.notes?.trim() || '',
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
        order: maxOrder + 1,
        sample: false,
      };
      const nextTasks = [...s.tasks, newTask];
      const nextState = { ...s, tasks: nextTasks };
      checkAndCelebrate(nextState);
      return nextState;
    });
    showToast('✓ Task created');
  }, [updateState, showToast, checkAndCelebrate]);

  const updateTask = useCallback((id, taskData) => {
    updateState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...taskData } : t)
    }));
    showToast('✓ Task updated');
  }, [updateState, showToast]);

  const performDelete = useCallback((id) => {
    updateState(s => {
      const idx = s.tasks.findIndex(t => t.id === id);
      if (idx === -1) return s;
      lastDeletedRef.current = { task: s.tasks[idx], index: idx };
      return {
        ...s,
        tasks: s.tasks.filter(t => t.id !== id)
      };
    });
    showToast('Task deleted', 'Undo', () => {
      if (lastDeletedRef.current) {
        const { task, index } = lastDeletedRef.current;
        updateState(s => {
          const nextTasks = [...s.tasks];
          nextTasks.splice(Math.min(index, nextTasks.length), 0, task);
          return { ...s, tasks: nextTasks };
        });
        lastDeletedRef.current = null;
        showToast('Task restored');
      }
    });
  }, [updateState, showToast]);

  const deleteTask = useCallback((id) => {
    if (state.settings.confirmDelete) {
      setPendingDeleteId(id);
      setIsDeleteModalOpen(true);
    } else {
      performDelete(id);
    }
  }, [state.settings.confirmDelete, performDelete]);

  const toggleTask = useCallback((id) => {
    let wasCompleted = false;
    updateState(s => {
      const nextTasks = s.tasks.map(t => {
        if (t.id === id) {
          const completed = !t.completed;
          wasCompleted = completed;
          return {
            ...t,
            completed,
            completedAt: completed ? Date.now() : null
          };
        }
        return t;
      });

      const updatedStreak = { ...s.streak };
      if (wasCompleted) {
        updateStreak({ streak: updatedStreak });
      }

      const nextState = { ...s, tasks: nextTasks, streak: updatedStreak };
      if (wasCompleted) {
        checkAndCelebrate(nextState);
      }
      return nextState;
    });

    if (wasCompleted) {
      celebrate(`<span class="em">✅</span><div style="font-weight:600;">Nice work!</div>`);
      showToast('✓ Task completed');
    } else {
      showToast('Task marked as not completed');
    }
  }, [updateState, showToast, celebrate, checkAndCelebrate]);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    updateState(s => ({
      ...s,
      tasks: s.tasks.map(t => {
        if (t.id === taskId) {
          const nextSubtasks = (t.subtasks || []).map(st => {
            if (st.id === subtaskId) {
              return { ...st, completed: !st.completed };
            }
            return st;
          });
          return { ...t, subtasks: nextSubtasks };
        }
        return t;
      })
    }));
  }, [updateState]);

  const addCategory = useCallback((name, icon = '📌') => {
    const palette = ['#B5541F', '#3F7757', '#9C7A22', '#A23B33', '#5B6EA2', '#7A579C', '#2C7A7B'];
    updateState(s => ({
      ...s,
      categories: [
        ...s.categories,
        { id: 'c_' + uid(), name, icon, color: palette[s.categories.length % palette.length], custom: true }
      ]
    }));
    showToast('✓ Category added');
  }, [updateState, showToast]);

  const finishTourAndClearMockData = useCallback(() => {
    setIsTourActive(false);
    updateState(s => ({
      ...s,
      tasks: s.tasks.filter(t => !t.sample), // remove sample mock tasks
      tutorialCompleted: true,
      onboardingSeen: true
    }));
    showToast('✨ Mock data cleared — welcome to your fresh workspace!');
  }, [updateState, showToast]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    updateState(s => ({
      ...s,
      tutorialCompleted: true
    }));
  }, [updateState]);

  const startTourWithSampleData = useCallback(() => {
    updateState(s => {
      const seeded = seedSampleData({ ...s });
      return {
        ...seeded,
        tutorialCompleted: false
      };
    });
    setIsTourActive(true);
    setIsHelpModalOpen(false);
    setIsSettingsModalOpen(false);
  }, [updateState]);

  const clearAllData = useCallback(() => {
    if (window.confirm('This will permanently delete all tasks and settings. Continue?')) {
      localStorage.removeItem('taskManagerState_v1');
      const fresh = defaultState();
      updateState(fresh);
      showToast('All data cleared');
    }
  }, [updateState, showToast]);

  return {
    state,
    updateState,
    saveStatus,
    toasts,
    celebration,
    editingTaskId,
    setEditingTaskId,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    pendingDeleteId,
    setPendingDeleteId,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    isHelpModalOpen,
    setIsHelpModalOpen,
    isSidebarOpenMobile,
    setIsSidebarOpenMobile,
    isTourActive,
    setIsTourActive,
    finishTourAndClearMockData,
    skipTour,
    startTourWithSampleData,
    createTask,
    updateTask,
    deleteTask,
    performDelete,
    toggleTask,
    toggleSubtask,
    addCategory,
    clearAllData,
    showToast,
    celebrate,
  };
}
