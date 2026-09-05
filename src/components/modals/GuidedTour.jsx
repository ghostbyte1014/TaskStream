import React, { useState, useEffect, useRef } from 'react';
import { Lock, Sparkles, X, ChevronLeft, CheckCircle2 } from 'lucide-react';

export function GuidedTour({
  isActive,
  currentSection,
  onFinishAndClearData,
  onSkip,
  onNavigateSection,
  onOpenMobileMenu
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actionCompleted, setActionCompleted] = useState(false);
  const onNavRef = useRef(onNavigateSection);

  useEffect(() => {
    onNavRef.current = onNavigateSection;
  }, [onNavigateSection]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 760;

  // Build steps dynamically based on screen size (mobile vs desktop)
  const steps = [
    ...(isMobile ? [{
      id: 'open-mobile-menu',
      title: '1. Open Mobile Menu ☰',
      instruction: 'Tap the top-left menu icon (☰) to open the navigation drawer.',
      targetSelector: '.menu-btn',
      actionType: 'click',
      section: 'overview',
      onBeforeAction: () => onOpenMobileMenu && onOpenMobileMenu()
    }] : []),
    {
      id: 'nav-all',
      title: isMobile ? '2. Navigate Sections 🗂️' : '1. Navigate Sections 🗂️',
      instruction: 'Click on "All tasks" in the sidebar to open your full task list.',
      targetSelector: 'button[data-nav="all"]',
      actionType: 'click',
      section: 'overview'
    },
    {
      id: 'view-board',
      title: isMobile ? '3. Switch Views ▦' : '2. Switch Views ▦',
      instruction: 'Click the "▦ Board" button in the toolbar to see the Kanban columns.',
      targetSelector: '.view-toggle button[data-view="board"]',
      actionType: 'click',
      section: 'all'
    },
    {
      id: 'open-task-modal',
      title: isMobile ? '4. Create a Task ⚡' : '3. Create a Task ⚡',
      instruction: 'Click the "+ Add task" button (or tap the floating + button) to open the task creator.',
      targetSelector: isMobile ? '#fab-add' : '#add-task-btn',
      actionType: 'click',
      section: 'all'
    },
    {
      id: 'type-title',
      title: isMobile ? '5. Practice Typing a Title 📝' : '4. Practice Typing a Title 📝',
      instruction: 'Type anything in the "Task title" input field inside the form.',
      targetSelector: '#f-title',
      actionType: 'input',
      section: 'all'
    },
    {
      id: 'finish-tour',
      title: isMobile ? '6. Ready for a Fresh Start! 🎉' : '5. Ready for a Fresh Start! 🎉',
      instruction: 'Click "Finish & Clear Mock Data" to clear sample tasks and start your real workspace.',
      targetSelector: null,
      actionType: 'finish',
      section: 'all'
    }
  ];

  const currentStep = steps[currentStepIndex] || steps[0];

  // Navigate section if step specifies and currentSection doesn't match yet
  useEffect(() => {
    if (isActive && currentStep.section && currentSection !== currentStep.section) {
      if (onNavRef.current) {
        onNavRef.current(currentStep.section);
      }
    }
  }, [isActive, currentStepIndex, currentStep.section, currentSection]);

  // Attach highlight class and action event listeners to target element
  useEffect(() => {
    if (!isActive) return;

    setActionCompleted(currentStep.actionType === 'finish');

    let targetEl = null;
    let pollInterval = null;
    let actionHandled = false;

    const attachListener = () => {
      if (currentStep.targetSelector) {
        targetEl = document.querySelector(currentStep.targetSelector);
      }
      if (targetEl) {
        targetEl.classList.add('tour-target-highlight');

        const handleUserAction = () => {
          if (actionHandled) return;
          actionHandled = true;
          setActionCompleted(true);

          if (currentStep.onBeforeAction) {
            currentStep.onBeforeAction();
          }

          setTimeout(() => {
            if (targetEl) targetEl.classList.remove('tour-target-highlight');
            setCurrentStepIndex(prev => {
              if (prev < steps.length - 1) return prev + 1;
              return prev;
            });
          }, 350);
        };

        if (currentStep.actionType === 'click') {
          targetEl.addEventListener('click', handleUserAction, { once: true });
        } else if (currentStep.actionType === 'input') {
          targetEl.addEventListener('input', handleUserAction, { once: true });
        }
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    attachListener();
    if (!targetEl && currentStep.targetSelector) {
      pollInterval = setInterval(attachListener, 100);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (targetEl) {
        targetEl.classList.remove('tour-target-highlight');
      }
    };
  }, [isActive, currentStepIndex, currentStep.targetSelector, currentStep.actionType]);

  if (!isActive) return null;

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep.targetSelector) {
        const el = document.querySelector(prevStep.targetSelector);
        if (el) el.classList.remove('tour-target-highlight');
      }
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));
    onSkip();
  };

  const handleFinish = () => {
    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));
    onFinishAndClearData();
  };

  return (
    <div
      className="modal-overlay open"
      style={{
        zIndex: 250,
        background: 'rgba(15,13,10,0.4)',
        backdropFilter: 'none',
        pointerEvents: 'none' // allow clicking through to highlighted target elements
      }}
    >
      <div
        className="modal small"
        role="dialog"
        aria-modal="true"
        style={{
          pointerEvents: 'auto',
          position: 'fixed',
          bottom: isMobile ? 12 : 24,
          right: isMobile ? 12 : 24,
          left: isMobile ? 12 : 'auto',
          width: isMobile ? 'calc(100% - 24px)' : 'calc(100% - 48px)',
          maxWidth: 420,
          border: '2px solid var(--accent)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-l)',
          zIndex: 320
        }}
      >
        <div className="modal-head" style={{ padding: '14px 18px', background: 'var(--bg-sunken)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles className="icon" style={{ color: 'var(--accent)', width: 18, height: 18 }} />
            <h3 style={{ fontSize: 15 }}>
              Interactive Walkthrough ({currentStepIndex + 1}/{steps.length})
            </h3>
          </div>
          <button className="icon-btn" onClick={handleSkip} aria-label="Skip" title="Skip tutorial">
            <X className="icon" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '18px 20px' }}>
          <h4 style={{ fontSize: 16, marginBottom: 8, color: 'var(--ink)' }}>{currentStep.title}</h4>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
            {currentStep.instruction}
          </p>

          {currentStep.actionType !== 'finish' && (
            <div
              style={{
                marginTop: 14,
                padding: '8px 12px',
                borderRadius: 'var(--radius-s)',
                background: actionCompleted ? 'var(--low-soft)' : 'var(--accent-soft)',
                color: actionCompleted ? 'var(--low)' : 'var(--accent)',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {actionCompleted ? (
                <>
                  <CheckCircle2 style={{ width: 16, height: 16 }} /> Action completed! Advancing…
                </>
              ) : (
                <>
                  <Lock style={{ width: 15, height: 15 }} /> Perform highlighted action above to continue
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot" style={{ padding: '12px 18px', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-text" onClick={handleSkip} style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
            Skip
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            {currentStepIndex > 0 && (
              <button className="btn-secondary" onClick={handlePrev} style={{ padding: '6px 12px', fontSize: 13 }}>
                <ChevronLeft style={{ display: 'inline', width: 14, height: 14 }} /> Back
              </button>
            )}
            {currentStep.actionType === 'finish' && (
              <button className="btn-primary" onClick={handleFinish} style={{ padding: '7px 14px', fontSize: 13 }}>
                <CheckCircle2 style={{ width: 15, height: 15 }} /> Finish &amp; Clear Mock Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
