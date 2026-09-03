import React from 'react';
import { ACHIEVEMENT_DEFS } from '../../utils/achievements';

export function AchievementsView({ state }) {
  const { achievementsUnlocked = [] } = state;

  return (
    <section id="section-achievements">
      <div className="panel">
        <h3>
          Achievements{' '}
          <span className="sub">
            {achievementsUnlocked.length} / {ACHIEVEMENT_DEFS.length} unlocked
          </span>
        </h3>
        <div className="ach-grid">
          {ACHIEVEMENT_DEFS.map(a => {
            const unlocked = achievementsUnlocked.includes(a.id);
            return (
              <div key={a.id} className={`ach-card ${unlocked ? '' : 'locked'}`}>
                <span className="em">{a.emoji}</span>
                <div className="t">{a.title}</div>
                <div className="d">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
