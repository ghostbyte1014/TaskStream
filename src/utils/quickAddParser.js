export function parseQuickAdd(text) {
  let title = text;
  let priority = 'medium';
  let dueDate = null;
  const lower = text.toLowerCase();

  if (/\bhigh priority\b/.test(lower)) {
    priority = 'high';
    title = title.replace(/high priority/i, '');
  } else if (/\bmedium priority\b/.test(lower)) {
    priority = 'medium';
    title = title.replace(/medium priority/i, '');
  } else if (/\blow priority\b/.test(lower)) {
    priority = 'low';
    title = title.replace(/low priority/i, '');
  }

  const today = new Date();
  if (/\btoday\b/i.test(title)) {
    dueDate = today.toISOString().slice(0, 10);
    title = title.replace(/today/i, '');
  } else if (/\btomorrow\b/i.test(title)) {
    const d = new Date(today.getTime() + 86400e3);
    dueDate = d.toISOString().slice(0, 10);
    title = title.replace(/tomorrow/i, '');
  } else {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      const re = new RegExp('\\b' + days[i] + '\\b', 'i');
      if (re.test(title)) {
        const d = new Date(today);
        let diff = (i - d.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        d.setDate(d.getDate() + diff);
        dueDate = d.toISOString().slice(0, 10);
        title = title.replace(re, '');
        break;
      }
    }
  }

  title = title.replace(/\s{2,}/g, ' ').trim();
  return { title, priority, dueDate };
}
