import React, { useState } from 'react';

export function CategoryModal({ isOpen, onClose, onAddCategory }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory(name.trim(), icon.trim() || '📌');
    setName('');
    setIcon('📌');
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>New category</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label htmlFor="f-cat-name">Name</label>
              <input
                type="text"
                id="f-cat-name"
                maxLength={24}
                placeholder="e.g. Errands"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="f-cat-icon">Icon (emoji)</label>
              <input
                type="text"
                id="f-cat-icon"
                maxLength={4}
                placeholder="📌"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
