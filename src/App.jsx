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
import { checkAndSendNotifications } from './utils/notificationScheduler';
import { Plus } from 'lucide-react';
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
    showToast
  } = useTaskState();

  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Register service worker if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });

      // Auto-refresh the page when a new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

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

  // Background Notification Scheduler (checks every 30s)
  useEffect(() => {
    checkAndSendNotifications(state, showToast);
    const timer = setInterval(() => {
      checkAndSendNotifications(state, showToast);
    }, 30000);
    return () => clearInterval(timer);
  }, [state, showToast]);

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
        <div id="celebrate-layer">
          <div className="celebrate-card show" dangerouslySetInnerHTML={{ __html: celebration }} />
        </div>
      )}
    </div>
  );
}

export default App;
