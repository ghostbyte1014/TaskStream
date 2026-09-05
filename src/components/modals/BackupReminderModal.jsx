import React from 'react';
import { Download, Clock } from 'lucide-react';

export function BackupReminderModal({ isOpen, onClose, onExport }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 10000 }}>
      <div className="modal small" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>Time for a backup!</h3>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Because TaskStream is a secure, local-first app, your data lives safely on your device and <strong>not</strong> in the cloud.
          </p>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            This means if you clear your browser history or change devices, your tasks could be lost. We recommend downloading a backup file every so often just to be safe!
          </p>
        </div>
        <div className="modal-foot" style={{ flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }} 
            onClick={() => {
              onExport();
              onClose();
            }}
          >
            <Download size={18} />
            Export Backup Now
          </button>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center' }} 
            onClick={onClose}
          >
            <Clock size={18} />
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
