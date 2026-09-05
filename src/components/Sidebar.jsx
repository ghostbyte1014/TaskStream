import React from 'react';
import { isToday, isOverdue } from '../utils/dateUtils';
import {
  LayoutGrid,
  CalendarDays,
  ListTodo,
  AlertCircle,
  Award,
  Plus,
  Download,
  Settings,
  Search
} from 'lucide-react';

export function Sidebar({
  state,
  updateState,
  onOpenTaskModal,
  onOpenCategoryModal,
  onOpenSettingsModal,
  isMobileOpen,
  onCloseMobile,
  deferredInstallPrompt,
  onTriggerInstall
}) {
  const { currentSection, filters, categories, tasks, streak, settings } = state;

  const todayCount = tasks.filter(isToday).length;
  const allCount = tasks.filter(t => settings.showCompleted || !t.completed).length;
  const overdueCount = tasks.filter(isOverdue).length;

  const handleNavClick = (section) => {
    updateState(s => {
      const nextFilters = { ...s.filters };
      if (section === 'overdue') {
        nextFilters.status = 'overdue';
      }
      return {
        ...s,
        currentSection: section,
        filters: nextFilters
      };
    });
    if (onCloseMobile) onCloseMobile();
  };

  const handleCategoryClick = (catId) => {
    updateState(s => ({
      ...s,
      filters: { ...s.filters, category: catId || null },
      currentSection: ['overview', 'today', 'achievements'].includes(s.currentSection) ? 'all' : s.currentSection
    }));
    if (onCloseMobile) onCloseMobile();
  };

  const handlePriorityClick = (priority) => {
    updateState(s => ({
      ...s,
      filters: {
        ...s.filters,
        priority: s.filters.priority === priority ? null : priority
      },
      currentSection: 'all'
    }));
  };

  return (
    <>
      <div
        id="sidebar-scrim"
        className={isMobileOpen ? 'open' : ''}
        onClick={onCloseMobile}
      />
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <img
            src="/icon-192.png"
            alt="TaskStream"
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flex: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          />
          <div>
            <h1>TaskStream</h1>
            <span>live task stream</span>
          </div>
        </div>

        <div className="side-search">
          <Search className="icon" />
          <input
            type="text"
            id="global-search"
            placeholder="Search tasks… (press /)"
            aria-label="Search tasks"
            value={state.search || ''}
            onChange={(e) => {
              const val = e.target.value;
              updateState(s => ({
                ...s,
                search: val,
                currentSection: val && s.currentSection !== 'all' ? 'all' : s.currentSection
              }));
            }}
          />
        </div>

        <nav className="primary-nav" aria-label="Sections">
          <button
            className={`nav-item ${currentSection === 'overview' ? 'active' : ''}`}
            data-nav="overview"
            onClick={() => handleNavClick('overview')}
          >
            <LayoutGrid className="icon" />
            Overview
          </button>
          <button
            className={`nav-item ${currentSection === 'today' ? 'active' : ''}`}
            data-nav="today"
            onClick={() => handleNavClick('today')}
          >
            <CalendarDays className="icon" />
            Today <span className="count">{todayCount}</span>
          </button>
          <button
            className={`nav-item ${currentSection === 'all' ? 'active' : ''}`}
            data-nav="all"
            onClick={() => handleNavClick('all')}
          >
            <ListTodo className="icon" />
            All tasks <span className="count">{allCount}</span>
          </button>
          <button
            className={`nav-item warn ${currentSection === 'overdue' ? 'active' : ''}`}
            data-nav="overdue"
            onClick={() => handleNavClick('overdue')}
          >
            <AlertCircle className="icon" />
            Overdue <span className="count">{overdueCount}</span>
          </button>
          <button
            className={`nav-item ${currentSection === 'achievements' ? 'active' : ''}`}
            data-nav="achievements"
            onClick={() => handleNavClick('achievements')}
          >
            <Award className="icon" />
            Achievements
          </button>
        </nav>

        <div>
          <div className="side-section-title">Categories</div>
          <div className="cat-list">
            <button
              className={`cat-item ${!filters.category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(null)}
            >
              <span className="dot" style={{ background: 'var(--ink-faint)' }} /> All categories{' '}
              <span className="n">{allCount}</span>
            </button>
            {categories.map(c => {
              const n = tasks.filter(t => t.category === c.id && (!t.completed || settings.showCompleted)).length;
              return (
                <button
                  key={c.id}
                  className={`cat-item ${filters.category === c.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(c.id)}
                >
                  <span style={{ fontSize: '13px' }}>{c.icon}</span> {c.name} <span className="n">{n}</span>
                </button>
              );
            })}
          </div>
          <button className="cat-add-btn" onClick={onOpenCategoryModal}>
            + New category
          </button>
        </div>

        <div className="side-section-title">Priority</div>
        <div className="chip-row" style={{ padding: '0 6px' }}>
          {['high', 'medium', 'low'].map(p => (
            <button
              key={p}
              className={`chip ${filters.priority === p ? 'active' : ''}`}
              onClick={() => handlePriorityClick(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {(() => {
          const allTags = Array.from(
            new Set(tasks.flatMap(t => t.tags || []))
          ).filter(Boolean);

          if (allTags.length === 0) return null;

          return (
            <div>
              <div className="side-section-title">Tags</div>
              <div className="chip-row" style={{ padding: '0 6px', gap: 4 }}>
                {allTags.map(tag => {
                  const isActive = filters.tag === tag;
                  return (
                    <button
                      key={tag}
                      className={`tag-pill ${isActive ? 'active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid var(--line-strong)',
                        background: isActive ? 'var(--accent)' : 'var(--bg-elev)',
                        color: isActive ? 'var(--accent-ink)' : 'var(--ink-soft)'
                      }}
                      onClick={() => {
                        updateState(s => ({
                          ...s,
                          filters: {
                            ...s.filters,
                            tag: s.filters.tag === tag ? null : tag
                          },
                          currentSection: 'all'
                        }));
                      }}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="sidebar-foot">
          {deferredInstallPrompt && (
            <button className="settings-link" onClick={onTriggerInstall}>
              <Download className="icon" />
              Install app
            </button>
          )}
          <div className="streak-chip">
            <span style={{ fontSize: '18px' }}>🔥</span>
            <span>
              <strong>{streak.count}</strong> day streak
            </span>
          </div>
          <button className="settings-link" onClick={onOpenSettingsModal}>
            <Settings className="icon" />
            Settings
          </button>

          <div
            className="sidebar-copyright"
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--line-soft)',
              fontSize: 11,
              color: 'var(--ink-faint)',
              lineHeight: 1.4,
              textAlign: 'center'
            }}
          >
            <div>© {new Date().getFullYear()} <strong>TaskStream</strong></div>
            <div>Created by <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>ghostbyte</span></div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>v1.0.0 • Mobile First PWA</div>
          </div>
        </div>
      </aside>
    </>
  );
}
