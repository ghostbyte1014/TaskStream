import React, { useState } from 'react';

export function OnboardingModal({ isOpen, onClose, onDontShowAgain }) {
  const [dontShow, setDontShow] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShow && onDontShowAgain) {
      onDontShowAgain();
    }
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={handleClose}>
      <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Welcome to TaskStream 👋</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 12 }}>
            A few things that make this fast to use:
          </p>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13.5, color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Add task</strong> or press <kbd className="kbd">N</kbd> to capture something in seconds.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>/</strong> jumps to search from anywhere.
            </li>
            <li>
              Everything saves automatically to this browser — no account, no sign-up.
            </li>
            <li>
              Nothing overdue is ever hidden — check the <strong style={{ color: 'var(--ink)' }}>Overdue</strong> tab any time.
            </li>
          </ul>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-soft)' }}>
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />{' '}
            Don't show this again
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn-primary" onClick={handleClose}>
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
