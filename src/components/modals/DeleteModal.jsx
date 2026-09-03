import React from 'react';

export function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Delete this task?</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            This task will be permanently removed. You can undo right after deleting.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
