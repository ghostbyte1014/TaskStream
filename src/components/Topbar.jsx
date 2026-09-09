import React, { useState, useEffect, useRef } from 'react';
import { isToday, isOverdue } from '../utils/dateUtils';
import { Menu, HelpCircle, Sun, Moon, Plus, Bell, X, Trash2 } from 'lucide-react';

export function Topbar({
  state,
  updateState,
  saveStatus,
  onOpenMobileMenu,
  onOpenHelpModal,
  onOpenTaskModal,
  markInboxRead,
  clearInbox,
  clearInboxMessage
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const [showInbox, setShowInbox] = useState(false);
  const inboxRef = useRef(null);

  const unreadCount = (state.inbox || []).filter(m => !m.read).length;

  const handleToggleInbox = () => {
    if (!showInbox && unreadCount > 0) {
      markInboxRead();
    }
    setShowInbox(!showInbox);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (inboxRef.current && !inboxRef.current.contains(event.target)) {
        setShowInbox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div style={{ position: 'relative' }} ref={inboxRef}>
          <button
            className="icon-btn"
            onClick={handleToggleInbox}
            aria-label="Notifications"
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell className="icon" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                backgroundColor: 'var(--red)',
                borderRadius: '50%',
                border: '2px solid var(--surface)'
              }} />
            )}
          </button>
          
          {showInbox && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 400,
              backgroundColor: isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(128, 128, 128, 0.2)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Notifications</h3>
                {(state.inbox || []).length > 0 && (
                  <button onClick={clearInbox} style={{ background: 'transparent', border: 'none', color: 'var(--ink-faint)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 style={{ width: 14, height: 14 }} /> Clear all
                  </button>
                )}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {(state.inbox || []).length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
                    No notifications yet
                  </div>
                ) : (
                  (state.inbox || []).map(msg => (
                    <div key={msg.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'relative', display: 'flex', gap: 12 }}>
                      {!msg.read && <div style={{ width: 6, height: 6, backgroundColor: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                      <div style={{ flex: 1, paddingRight: 24 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{msg.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: 2, whiteSpace: 'pre-wrap' }}>{msg.body}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: 4 }}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button 
                        onClick={() => clearInboxMessage(msg.id)}
                        style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer' }}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
