import { isOverdue, isToday, fmtTime } from './dateUtils';

const notifiedKeys = new Set();

export function triggerNativeNotification(title, options = {}) {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const n = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options
    });

    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch (err) {
    console.warn('Native notification failed:', err);
    return false;
  }
}

export function triggerAchievementNotification(achievementTitle, description) {
  triggerNativeNotification(`🏆 Achievement Unlocked: ${achievementTitle}`, {
    body: description,
    tag: `achieve_${achievementTitle}`
  });
}

export function checkAndSendNotifications(state, showToast) {
  const masterEnabled = state.settings.notifications;
  if (!masterEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const ns = state.settings.notificationSettings || {
    enabled: true,
    deadlines: true,
    leadTimeMinutes: 15,
    overdue: true,
    subscriptions: true,
    dailyBriefing: true,
    briefingTime: '09:00',
    streakReminder: true,
    streakReminderTime: '18:00',
    achievements: true
  };

  if (!ns.enabled) return;

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const leadMins = Number(ns.leadTimeMinutes) || 15;

  const targetBriefingTime = ns.briefingTime || '09:00';
  const targetStreakTime = ns.streakReminderTime || '18:00';

  // 1. Morning Agenda Briefing (Custom Editable Time)
  if (ns.dailyBriefing && currentHHMM === targetBriefingTime) {
    const key = `morning_briefing_${todayIso}_${targetBriefingTime}`;
    if (!notifiedKeys.has(key)) {
      notifiedKeys.add(key);
      const todaysCount = state.tasks.filter(t => !t.completed && isToday(t)).length;
      if (todaysCount > 0) {
        triggerNativeNotification('☀️ Morning Agenda Briefing', {
          body: `You have ${todaysCount} task${todaysCount === 1 ? '' : 's'} scheduled for today. Have a productive day!`,
          tag: key
        });
        if (showToast) showToast(`☀️ Morning Briefing: ${todaysCount} tasks due today`);
      }
    }
  }

  // 2. Evening Streak Protection Reminder (Custom Editable Time)
  if (ns.streakReminder && currentHHMM === targetStreakTime) {
    const key = `streak_protect_${todayIso}_${targetStreakTime}`;
    if (!notifiedKeys.has(key)) {
      notifiedKeys.add(key);
      const completedTodayCount = state.tasks.filter(t => t.completed && t.completedAt && t.completedAt.slice(0, 10) === todayIso).length;
      if (completedTodayCount === 0 && state.streak?.count > 0) {
        triggerNativeNotification('🔥 Protect Your Streak!', {
          body: `You have a ${state.streak.count}-day streak! Complete a task before midnight to keep it alive.`,
          tag: key
        });
        if (showToast) showToast(`🔥 Protect your ${state.streak.count}-day streak today!`);
      }
    }
  }

  // Task-specific scans
  state.tasks.forEach(task => {
    if (task.completed) return;

    // 3. Custom Scheduled Reminder Time
    if (ns.deadlines && task.reminder) {
      const reminderDate = new Date(task.reminder);
      const diffMinutes = Math.round((reminderDate - now) / 60000);

      if (diffMinutes >= 0 && diffMinutes <= 1) {
        const key = `reminder_${task.id}_${task.reminder}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          triggerNativeNotification('⏰ Task Reminder', {
            body: `${task.title}${task.description ? ' — ' + task.description : ''}`,
            tag: key
          });
          if (showToast) showToast(`⏰ Reminder: ${task.title}`);
        }
      }
    }

    // 4. Deadline Lead Time Warning & Due Now Alert
    if (ns.deadlines && task.dueDate === todayIso && task.dueTime) {
      const [h, m] = task.dueTime.split(':').map(Number);
      const dueMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
      const diffMin = Math.round((dueMs - now.getTime()) / 60000);

      // Customizable lead-time warning (e.g. 15 mins before)
      if (diffMin === leadMins) {
        const key = `due_lead_${leadMins}m_${task.id}_${todayIso}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          triggerNativeNotification(`⏳ Due in ${leadMins} minutes`, {
            body: `"${task.title}" is due at ${fmtTime(task.dueTime)}`,
            tag: key
          });
          if (showToast) showToast(`⏳ "${task.title}" due in ${leadMins} mins`);
        }
      }

      // Due now alert
      if (diffMin === 0) {
        const key = `due_now_${task.id}_${todayIso}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          triggerNativeNotification('🚨 Task Due Now', {
            body: `"${task.title}" is due right now!`,
            tag: key
          });
          if (showToast) showToast(`🚨 "${task.title}" is due now`);
        }
      }
    }

    // 5. Overdue Task Warning
    if (ns.overdue && isOverdue(task)) {
      const key = `overdue_${task.id}_${todayIso}`;
      if (!notifiedKeys.has(key)) {
        notifiedKeys.add(key);
        triggerNativeNotification('⚠️ Overdue Task', {
          body: `"${task.title}" was due on ${task.dueDate}. Don't forget to complete it!`,
          tag: key
        });
      }
    }

    // 6. Upcoming Subscription Renewal Warning (24h prior)
    if (ns.subscriptions && task.category === 'subscriptions' && task.dueDate) {
      const horizonDate = new Date(now.getTime() + 86400e3).toISOString().slice(0, 10);
      if (task.dueDate === horizonDate) {
        const key = `sub_renew_${task.id}_${horizonDate}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          triggerNativeNotification('💳 Subscription Renewal Tomorrow', {
            body: `"${task.title}" renewal is due tomorrow${task.amount != null ? ' ($' + Number(task.amount).toFixed(2) + ')' : ''}`,
            tag: key
          });
        }
      }
    }
  });

  // 7. Backup Reminder
  if (ns.backupReminder !== false) {
    const freq = ns.backupReminderFrequency || 'weekly';
    let daysThreshold = 7;
    if (freq === 'daily') daysThreshold = 1;
    if (freq === 'monthly') daysThreshold = 30;
    
    const lastBackup = state.lastBackupReminder || 0;
    const daysSinceLastBackup = (now.getTime() - lastBackup) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastBackup >= daysThreshold && state.tasks.length > 0) {
      const key = `backup_reminder_${todayIso}`;
      if (!notifiedKeys.has(key)) {
        notifiedKeys.add(key);
        triggerNativeNotification('💾 Backup Reminder', {
          body: `It's been a while since your last backup. Open Settings to export your tasks!`,
          tag: key
        });
        if (showToast) showToast('💾 Reminder: Time to back up your tasks!');
      }
    }
  }
}
