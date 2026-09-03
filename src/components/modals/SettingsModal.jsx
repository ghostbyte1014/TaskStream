import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { defaultState, seedSampleData } from '../../utils/storage';

export function SettingsModal({
  isOpen,
  onClose,
  state,
  updateState,
  onClearAllData,
  showToast,
  deferredInstallPrompt,
  onTriggerInstall,
  onOpenPrivacyModal
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const { theme, density, settings } = state;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-manager-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('✓ Backup downloaded');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.tasks)) throw new Error('Invalid format');
        updateState(s => ({
          ...defaultState(),
          ...parsed,
          categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : s.categories
        }));
        showToast('✓ Tasks imported');
        onClose();
      } catch (err) {
        showToast('⚠️ Could not import — invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNotificationChange = (e) => {
    const checked = e.target.checked;
    if (checked && 'Notification' in window) {
      Notification.requestPermission().then(perm => {
        const granted = perm === 'granted';
        updateState(s => ({
          ...s,
          settings: { ...s.settings, notifications: granted }
        }));
        if (granted) {
          showToast('🔔 Native reminders enabled!');
          try {
            new Notification('🔔 Notifications Enabled', {
              body: 'You will receive reminders for upcoming deadlines, overdue tasks, and subscription renewals!',
              icon: '/icon-192.png'
            });
          } catch (err) {}
        } else {
          showToast('⚠️ Notifications were blocked by browser settings');
        }
      });
    } else {
      updateState(s => ({
        ...s,
        settings: { ...s.settings, notifications: false }
      }));
      showToast('Notifications disabled');
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X className="icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-group">
            <h4>Appearance</h4>
            <div className="settings-row">
              <div className="t">Theme</div>
              <div className="seg">
                {['light', 'dark', 'system'].map(opt => (
                  <button
                    key={opt}
                    className={theme === opt ? 'active' : ''}
                    onClick={() => updateState(s => ({ ...s, theme: opt }))}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row">
              <div className="t">Density</div>
              <div className="seg">
                {['comfortable', 'compact'].map(opt => (
                  <button
                    key={opt}
                    className={density === opt ? 'active' : ''}
                    onClick={() => updateState(s => ({ ...s, density: opt }))}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-group">
            <h4>Behavior</h4>
            <div className="settings-row">
              <div>
                <div className="t">Confirm before deleting</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.confirmDelete}
                  onChange={(e) => updateState(s => ({ ...s, settings: { ...s.settings, confirmDelete: e.target.checked } }))}
                />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="t">Show completed tasks</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.showCompleted}
                  onChange={(e) => updateState(s => ({ ...s, settings: { ...s.settings, showCompleted: e.target.checked } }))}
                />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>
          </div>

          <div className="settings-group">
            <h4>Notifications &amp; Reminders</h4>
            <div className="settings-row">
              <div>
                <div className="t">Enable browser native notifications</div>
                <div className="d">Receive system popups on desktop &amp; mobile</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={handleNotificationChange}
                />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>

            {settings.notifications && (
              <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="settings-row">
                  <div>
                    <div className="t">⏰ Deadline &amp; Due Time Alerts</div>
                    <div className="d">Alert at exact due time &amp; in advance</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings?.deadlines ?? true}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        settings: {
                          ...s.settings,
                          notificationSettings: {
                            ...(s.settings.notificationSettings || {}),
                            deadlines: e.target.checked
                          }
                        }
                      }))}
                    />
                    <span className="track" />
                    <span className="thumb" />
                  </label>
                </div>

                {settings.notificationSettings?.deadlines !== false && (
                  <div className="settings-row">
                    <div className="t">Advance warning timing</div>
                    <select
                      className="select-mini"
                      value={settings.notificationSettings?.leadTimeMinutes ?? 15}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        settings: {
                          ...s.settings,
                          notificationSettings: {
                            ...(s.settings.notificationSettings || {}),
                            leadTimeMinutes: Number(e.target.value)
                          }
                        }
                      }))}
                    >
                      <option value={5}>5 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                )}

                <div className="settings-row">
                  <div>
                    <div className="t">⚠️ Overdue Task Warnings</div>
                    <div className="d">Alert when tasks pass due date</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings?.overdue ?? true}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        settings: {
                          ...s.settings,
                          notificationSettings: {
                            ...(s.settings.notificationSettings || {}),
                            overdue: e.target.checked
                          }
                        }
                      }))}
                    />
                    <span className="track" />
                    <span className="thumb" />
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="t">💳 Subscription Renewal Warnings</div>
                    <div className="d">Remind 24 hours before renewal date</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings?.subscriptions ?? true}
                      onChange={(e) => updateState(s => ({
                        ...s,
                        settings: {
                          ...s.settings,
                          notificationSettings: {
                            ...(s.settings.notificationSettings || {}),
                            subscriptions: e.target.checked
                          }
                        }
                      }))}
                    />
                    <span className="track" />
                    <span className="thumb" />
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="t">☀️ Daily Morning Briefing</div>
                    <div className="d">Summary of tasks scheduled for today</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {settings.notificationSettings?.dailyBriefing !== false && (
                      <input
                        type="time"
                        className="input-field"
                        style={{ width: 105, padding: '3px 8px', fontSize: 13 }}
                        aria-label="Morning briefing time"
                        value={settings.notificationSettings?.briefingTime || '09:00'}
                        onChange={(e) => updateState(s => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            notificationSettings: {
                              ...(s.settings.notificationSettings || {}),
                              briefingTime: e.target.value
                            }
                          }
                        }))}
                      />
                    )}
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings?.dailyBriefing ?? true}
                        onChange={(e) => updateState(s => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            notificationSettings: {
                              ...(s.settings.notificationSettings || {}),
                              dailyBriefing: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="track" />
                      <span className="thumb" />
                    </label>
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="t">🔥 Streak Protection Reminder</div>
                    <div className="d">Alert if no task completed today</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {settings.notificationSettings?.streakReminder !== false && (
                      <input
                        type="time"
                        className="input-field"
                        style={{ width: 105, padding: '3px 8px', fontSize: 13 }}
                        aria-label="Streak protection reminder time"
                        value={settings.notificationSettings?.streakReminderTime || '18:00'}
                        onChange={(e) => updateState(s => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            notificationSettings: {
                              ...(s.settings.notificationSettings || {}),
                              streakReminderTime: e.target.value
                            }
                          }
                        }))}
                      />
                    )}
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings?.streakReminder ?? true}
                        onChange={(e) => updateState(s => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            notificationSettings: {
                              ...(s.settings.notificationSettings || {}),
                              streakReminder: e.target.checked
                            }
                          }
                        }))}
                      />
                      <span className="track" />
                      <span className="thumb" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="settings-group">
            <h4>Data</h4>
            {deferredInstallPrompt && (
              <div className="settings-row">
                <div>
                  <div className="t">Install as an app</div>
                  <div className="d">Add TaskStream to your home screen for offline, full-screen use</div>
                </div>
                <button className="btn-secondary" onClick={onTriggerInstall}>
                  Install
                </button>
              </div>
            )}

            <div className="settings-row">
              <div>
                <div className="t">Export tasks</div>
                <div className="d">Download a JSON backup</div>
              </div>
              <button className="btn-secondary" onClick={handleExport}>
                Export
              </button>
            </div>

            <div className="settings-row">
              <div>
                <div className="t">Import tasks</div>
                <div className="d">Restore from a JSON backup</div>
              </div>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="t">Clear all data</div>
                <div className="d">Cannot be undone</div>
              </div>
              <button className="btn-danger" onClick={onClearAllData}>
                Clear
              </button>
            </div>
          </div>

          <div className="settings-group">
            <h4>About &amp; Developer</h4>
            <div className="settings-row">
              <div className="t">Created by</div>
              <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>ghostbyte</span>
            </div>
            <div className="settings-row">
              <div className="t">GitHub</div>
              <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>ghostbyte1014</span>
            </div>
            {onOpenPrivacyModal && (
              <div className="settings-row">
                <div>
                  <div className="t">Privacy Policy</div>
                  <div className="d">Local-first data privacy details</div>
                </div>
                <button className="btn-secondary" onClick={onOpenPrivacyModal}>
                  View policy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
