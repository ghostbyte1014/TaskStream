import React, { useEffect, useState } from 'react';
import { useTaskState } from './hooks/useTaskState';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewView } from './components/views/OverviewView';
import { TodayView } from './components/views/TodayView';
import { TasksView } from './components/views/TasksView';
import { AchievementsView } from './components/views/AchievementsView';
import { TaskModal } from './components/modals/TaskModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { HelpModal } from './components/modals/HelpModal';
import { GuidedTour } from './components/modals/GuidedTour';
import { PrivacyModal } from './components/modals/PrivacyModal';
import { ClearDataModal } from './components/modals/ClearDataModal';
import { BackupReminderModal } from './components/modals/BackupReminderModal';
import { checkAndSendNotifications, triggerNativeNotification } from './utils/notificationScheduler';
import { Plus, X } from 'lucide-react';
import './styles/theme.css';

export function App() {
  const {
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
    isBackupReminderOpen,
    setIsBackupReminderOpen,
    isClearDataModalOpen,
    setIsClearDataModalOpen,
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
    requestClearAllData,
    performClearAllData,
    exportData,
    showToast,
    celebrate,
    clearCelebration,
    addInboxMessage,
    cleanupInbox,
    markInboxRead,
    clearInbox,
    clearInboxMessage
  } = useTaskState();

  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Run cleanup once on mount
  useEffect(() => {
    cleanupInbox();
  }, [cleanupInbox]);

  // Version Check & Announcements
  useEffect(() => {
    const CURRENT_VERSION = 'v2.4.12';
    if (state.lastVersionSeen !== CURRENT_VERSION) {
      setTimeout(() => {
        celebrate(`<span class="em">✨</span><div style="font-weight:600;font-size:16px;margin-bottom:4px;">TaskStream v2.4.12</div><div style="font-size:13px;color:var(--ink-soft);line-height:1.4;">New: Daily Habit Rollover<br/>Added: Full Offline Support<br/>Improved: Smart Task Forms</div>`, 8000);
        
        const title = '🎉 TaskStream Updated to v2.4.12';
        const body = 'New: Daily Habit Rollover\nAdded: Full Offline Support\nImproved: Smart Task Forms';
        
        triggerNativeNotification(title, {
          body,
          tag: 'release_v2.4.12'
        });
        
        addInboxMessage({
          id: 'msg_update_' + CURRENT_VERSION,
          title,
          body,
          timestamp: Date.now(),
          read: false,
          type: 'update'
        });
      }, 500); // 0.5s delay
      
      // Update state so they don't see it again
      updateState(s => ({ ...s, lastVersionSeen: CURRENT_VERSION }));
    }
  }, [state.lastVersionSeen, showToast, celebrate, updateState, addInboxMessage]);

  useEffect(() => {
    // Only keeping the PWA install prompt listeners, as vite-plugin-pwa handles service worker registration automatically.

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      showToast('✓ TaskStream installed — find it on your home screen');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  // Background Notification Scheduler (checks every 60s)
  useEffect(() => {
    checkAndSendNotifications(state, showToast, addInboxMessage);
    const interval = setInterval(() => {
      checkAndSendNotifications(state, showToast, addInboxMessage);
    }, 60000);
    return () => clearInterval(interval);
  }, [state, showToast, addInboxMessage]);

  // Backup reminder trigger
  useEffect(() => {
    // 30 days in ms: 2592000000
    const THIRTY_DAYS = 2592000000;
    const now = Date.now();
    const lastReminder = state.lastBackupReminder || now;
    
    // Only remind if they have some data and 30 days have passed
    if (now - lastReminder > THIRTY_DAYS && state.tasks.length > 0) {
      setIsBackupReminderOpen(true);
    }
  }, [state.lastBackupReminder, state.tasks.length, setIsBackupReminderOpen]);

  const handleTriggerInstall = async () => {
    if (!deferredInstallPrompt) {
      showToast('Already installed or browser does not support in-app install');
      return;
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    if (choice && choice.outcome === 'accepted') {
      showToast('✓ Ledger installed');
    }
  };

  // Keyboard shortcuts (N = new task, / = search, Esc = close modal, ? = help)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      
      const anyModalOpen = isTaskModalOpen || isDeleteModalOpen || isCategoryModalOpen || isSettingsModalOpen || isOnboardingModalOpen || isHelpModalOpen || isClearDataModalOpen || isBackupReminderOpen;

      if (e.key === 'Escape') {
        if (anyModalOpen) {
          setIsTaskModalOpen(false);
          setIsDeleteModalOpen(false);
          setIsCategoryModalOpen(false);
          setIsSettingsModalOpen(false);
          setIsOnboardingModalOpen(false);
          setIsHelpModalOpen(false);
          setIsClearDataModalOpen(false);
          if (isBackupReminderOpen) {
            setIsBackupReminderOpen(false);
            updateState(s => ({ ...s, lastBackupReminder: Date.now() }));
          }
        }
        return;
      }

      if (typing) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTaskId(null);
        setIsTaskModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('global-search');
        if (input) input.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTaskModalOpen,
    isDeleteModalOpen,
    isCategoryModalOpen,
    isSettingsModalOpen,
    isOnboardingModalOpen,
    isHelpModalOpen,
    setEditingTaskId,
    setIsTaskModalOpen,
    setIsDeleteModalOpen,
    setIsCategoryModalOpen,
    setIsSettingsModalOpen,
    setIsOnboardingModalOpen,
    setIsHelpModalOpen,
    setIsClearDataModalOpen,
    setIsBackupReminderOpen,
    isBackupReminderOpen,
    updateState
  ]);

  const handleOpenTaskModal = (taskId = null) => {
    setEditingTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTaskId) {
      updateTask(editingTaskId, taskData);
    } else {
      createTask(taskData);
    }
  };

  return (
    <div id="app">
      <Sidebar
        state={state}
        updateState={updateState}
        onOpenTaskModal={handleOpenTaskModal}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isMobileOpen={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        deferredInstallPrompt={deferredInstallPrompt}
        onTriggerInstall={handleTriggerInstall}
      />

      <main>
        <Topbar
          state={state}
          updateState={updateState}
          saveStatus={saveStatus}
          onOpenMobileMenu={() => setIsSidebarOpenMobile(true)}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onOpenTaskModal={handleOpenTaskModal}
          markInboxRead={markInboxRead}
          clearInbox={clearInbox}
          clearInboxMessage={clearInboxMessage}
        />

        <div className="content">
          {state.currentSection === 'overview' && (
            <OverviewView
              state={state}
              onToggleTask={toggleTask}
              onToggleSubtask={toggleSubtask}
              onEditTask={handleOpenTaskModal}
              onDeleteTask={deleteTask}
            />
          )}

          {state.currentSection === 'today' && (
            <TodayView
              state={state}
              onToggleTask={toggleTask}
              onToggleSubtask={toggleSubtask}
              onEditTask={handleOpenTaskModal}
              onDeleteTask={deleteTask}
            />
          )}

          {(state.currentSection === 'all' || state.currentSection === 'overdue') && (
            <TasksView
              state={state}
              updateState={updateState}
              onToggleTask={toggleTask}
              onToggleSubtask={toggleSubtask}
              onEditTask={handleOpenTaskModal}
              onDeleteTask={deleteTask}
            />
          )}

          {state.currentSection === 'achievements' && (
            <AchievementsView state={state} />
          )}
        </div>
      </main>

      <button
        className="fab"
        id="fab-add"
        onClick={() => handleOpenTaskModal()}
        aria-label="Add task"
      >
        <Plus className="icon" style={{ width: 24, height: 24, stroke: 'currentColor' }} />
      </button>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTaskId(null);
        }}
        editingTaskId={editingTaskId}
        tasks={state.tasks}
        categories={state.categories}
        defaultCategory={state.filters.category}
        onSave={handleSaveTask}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId) {
            performDelete(pendingDeleteId);
          }
          setIsDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={addCategory}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        state={state}
        updateState={updateState}
        onClearAllData={requestClearAllData}
        onExportData={exportData}
        showToast={showToast}
        deferredInstallPrompt={deferredInstallPrompt}
        onTriggerInstall={handleTriggerInstall}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={performClearAllData}
      />

      <BackupReminderModal
        isOpen={isBackupReminderOpen}
        onClose={() => {
          setIsBackupReminderOpen(false);
          updateState(s => ({ ...s, lastBackupReminder: Date.now() }));
        }}
        onExport={() => {
          exportData();
          setIsBackupReminderOpen(false);
          updateState(s => ({ ...s, lastBackupReminder: Date.now() }));
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onDontShowAgain={() => updateState(s => ({ ...s, onboardingSeen: true }))}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onReplayTour={startTourWithSampleData}
      />

      <GuidedTour
        isActive={isTourActive}
        currentSection={state.currentSection}
        onFinishAndClearData={finishTourAndClearMockData}
        onSkip={skipTour}
        onNavigateSection={(sec) => updateState(s => ({ ...s, currentSection: sec }))}
        onOpenMobileMenu={() => setIsSidebarOpenMobile(true)}
      />

      {/* TOAST REGION */}
      <div id="toast-region" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span>{t.msg}</span>
            {t.actionLabel && (
              <button
                onClick={() => {
                  if (t.onAction) t.onAction();
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* CELEBRATION LAYER */}
      {celebration && (
        <div id="celebrate-layer" onClick={clearCelebration}>
          <div className="celebrate-card show" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={clearCelebration}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)' }}
              aria-label="Close notification"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div dangerouslySetInnerHTML={{ __html: celebration }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
