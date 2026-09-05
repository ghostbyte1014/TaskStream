import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ConfirmActionModal({ isOpen, onClose, onConfirm, title, description, confirmText, isDanger }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal" 
        role="dialog" 
        aria-modal="true" 
        style={{ maxWidth: 400 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDanger ? <AlertCircle className="icon warn-icon" style={{ color: 'var(--danger)' }} /> : null}
            {title}
          </h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
        
        <div className="modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '15px 20px', borderTop: '1px solid var(--line-soft)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className={isDanger ? 'btn-danger' : 'btn-primary'} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
