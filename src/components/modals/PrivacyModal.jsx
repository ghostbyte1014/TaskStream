import React from 'react';
import { ShieldCheck, HeartHandshake, EyeOff, Lock, X } from 'lucide-react';

export function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck className="icon" style={{ color: 'var(--low)', width: 20, height: 20 }} />
            <h3>Simple Privacy Promise</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="icon" />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--low-soft)', padding: 14, borderRadius: 'var(--radius-m)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Lock style={{ color: 'var(--low)', width: 22, height: 22, flex: 'none', marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>Your tasks stay on your device</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.5 }}>
                Everything you write in TaskStream is saved directly on your phone or computer. We don't have servers, so nobody else can ever read your personal to-do list.
              </div>
            </div>
          </div>

          <div className="settings-group">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <EyeOff style={{ color: 'var(--accent)', width: 18, height: 18 }} />
              <h4 style={{ margin: 0 }}>No tracking or ads</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
              We do not track what you click, we do not follow you across the internet, and we will never show ads or sell your data.
            </p>
          </div>

          <div className="settings-group">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <HeartHandshake style={{ color: 'var(--accent)', width: 18, height: 18 }} />
              <h4 style={{ margin: 0 }}>You are in full control</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
              Your information belongs strictly to you. You can export a backup copy of your tasks or erase everything in 1 click whenever you want.
            </p>
          </div>

          <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', textAlign: 'center', borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
            TaskStream • Created by <strong>ghostbyte</strong> (github: ghostbyte1014)
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-primary" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
