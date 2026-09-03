import React from 'react';
import { isToday, isOverdue } from '../utils/dateUtils';
import { Menu, HelpCircle, Sun, Moon, Plus } from 'lucide-react';

export function Topbar({
  state,
  updateState,
  saveStatus,
  onOpenMobileMenu,
  onOpenHelpModal,
  onOpenTaskModal
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const pendingCount = state.tasks.filter(t => !t.completed).length;
  const todayCount = state.tasks.filter(isToday).length;

  const sectionTitles = {
    overview: greeting + ' 👋',
    today: 'Today',
    all: 'All tasks',
    overdue: 'Overdue',
    achievements: 'Achievements'
  };

  const title = sectionTitles[state.currentSection] || greeting;
  const subtext = state.currentSection === 'overview'
    ? pendingCount === 0
      ? "You're all caught up. Nice work."
      : `You have ${pendingCount} task${pendingCount === 1 ? '' : 's'} remaining, ${todayCount} due today.`
    : '';

  const handleThemeToggle = () => {
    updateState(s => {
      const current = s.theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : s.theme;
      return {
        ...s,
        theme: current === 'dark' ? 'light' : 'dark'
      };
    });
  };

  const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="topbar">
      <button
        className="icon-btn menu-btn"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
      >
        <Menu className="icon" />
      </button>

      <div>
        <div className="greet-eyebrow">{dateStr}</div>
        <h2>{title}</h2>
        {subtext && <div className="subtext">{subtext}</div>}
      </div>

      <div className="topbar-actions">
        <span
          className={`save-status ${saveStatus === 'saving' ? 'saving' : ''}`}
          role="status"
          aria-live="polite"
        >
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Not saved' : 'All changes saved'}
        </span>

        <button
          className="icon-btn"
          onClick={onOpenHelpModal}
          aria-label="Help and shortcuts"
          title="Help and shortcuts"
        >
          <HelpCircle className="icon" />
        </button>

        <button
          className="icon-btn"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {isDark ? <Moon className="icon" /> : <Sun className="icon" />}
        </button>

        <button
          id="add-task-btn"
          className="btn-primary desktop-only"
          onClick={() => onOpenTaskModal()}
        >
          <Plus className="icon" style={{ width: 16, height: 16 }} />
          Add task
        </button>
      </div>
    </div>
  );
}
