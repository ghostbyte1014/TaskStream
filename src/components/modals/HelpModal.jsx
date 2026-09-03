import React from 'react';
import { X } from 'lucide-react';

export function HelpModal({ isOpen, onClose, onReplayTour }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Help &amp; shortcuts</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="icon" />
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-row">
            <div className="t">New task</div>
            <kbd className="kbd">N</kbd>
          </div>
          <div className="settings-row">
            <div className="t">Search</div>
            <kbd className="kbd">/</kbd>
          </div>
          <div className="settings-row">
            <div className="t">Close dialog</div>
            <kbd className="kbd">Esc</kbd>
          </div>
          <div className="settings-row">
            <div className="t">Reorder tasks</div>
            <span className="d">Drag the handle, or set sort to "Manual order"</span>
          </div>
          {onReplayTour && (
            <div className="settings-row" style={{ marginTop: 10 }}>
              <div>
                <div className="t">Guided Tutorial</div>
                <div className="d">Replay interactive walkthrough with sample tasks</div>
              </div>
              <button className="btn-secondary" onClick={onReplayTour}>
                Start tour
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 14 }}>
            Your data lives only in this browser. Use Settings → Export to back it up before clearing your browser data.
          </p>

          <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--line-strong)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>TaskStream v1.0.0</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
              Created with ❤️ by <strong>ghostbyte</strong>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 3 }}>
              © {new Date().getFullYear()} TaskStream. All rights reserved. • Offline PWA Edition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
