import { useEffect, useState } from 'react';
import { X, CalendarDays } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave, saving }) {
  const [title, setTitle] = useState(task?.title || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? String(task.due_date).slice(0, 10) : '');
  const [error, setError] = useState('');
  const editing = Boolean(task);

  useEffect(() => {
    const handleKey = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, saving]);

  async function submit(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Please enter a task title.'); return; }
    if (title.trim().length > 255) { setError('Title must be 255 characters or fewer.'); return; }
    setError('');
    try { await onSave({ title: title.trim(), dueDate: dueDate || null }); }
    catch (err) { setError(err.message || 'Could not save task.'); }
  }

  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="eyebrow">YOUR TASKS</span><h2 id="modal-title">{editing ? 'Edit Task' : 'Create Task'}</h2></div><button className="icon-button close-button" aria-label="Close dialog" onClick={onClose} disabled={saving}><X size={19}/></button></div>
      <form onSubmit={submit}>
        <label htmlFor="task-title">Task title <span className="required">*</span></label>
        <input id="task-title" autoFocus maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to get done?" required />
        <label htmlFor="task-date">Due date <span className="optional">(optional)</span></label>
        <div className="date-input"><CalendarDays size={17} aria-hidden="true"/><input id="task-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </section>
  </div>;
}
