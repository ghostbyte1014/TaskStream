import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ClearDataModal({ isOpen, onClose, onConfirm }) {
  const [inputValue, setInputValue] = useState('');
  const confirmationText = 'delete taskstream data';

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = inputValue === confirmationText;

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
        <div className="modal-head" style={{ borderBottom: '1px solid var(--danger)', paddingBottom: 15 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertTriangle className="icon" size={20} />
            Are you absolutely sure?
          </h3>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 15 }}>
            Unexpected bad things will happen if you don't read this!
          </p>
          <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            This action <strong>cannot be undone</strong>. This will permanently delete all your tasks, custom categories, history, and application settings from this device.
          </p>
          
          <div style={{ marginBottom: 5, fontSize: 13, color: 'var(--ink-soft)' }}>
            Please type <strong>{confirmationText}</strong> to confirm.
          </div>
          <input
            type="text"
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: '100%', padding: '10px', fontFamily: 'monospace' }}
            autoFocus
          />
        </div>
        <div className="modal-foot">
          <button className="btn-secondary" onClick={onClose} style={{ width: '50%' }}>
            Cancel
          </button>
          <button 
            className="btn-danger" 
            onClick={() => {
              if (isConfirmed) {
                onConfirm();
              }
            }}
            disabled={!isConfirmed}
            style={{ width: '50%', opacity: isConfirmed ? 1 : 0.5, cursor: isConfirmed ? 'pointer' : 'not-allowed' }}
          >
            I understand the consequences, delete this data
          </button>
        </div>
      </div>
    </div>
  );
}
