import { CalendarDays, Check, Pencil, Trash2, Circle } from 'lucide-react';

function formatDate(value) {
  if (!value) return '';
  const match = String(value).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(value);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function isOverdue(task) {
  if (task.completed || !task.due_date) return false;
  const match = String(task.due_date).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const due = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return due < today;
}
export { formatDate, isOverdue };

export default function TaskItem({ task, onToggle, onEdit, onDelete, busy }) {
  const overdue = isOverdue(task);
  return <article className={`task-item ${task.completed ? 'is-complete' : ''}`}>
    <button className={`task-check ${task.completed ? 'checked' : ''}`} onClick={() => onToggle(task)} aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`} disabled={busy}>
      {task.completed ? <Check size={14} strokeWidth={3}/> : <Circle size={17} strokeWidth={1.7}/>}
    </button>
    <div className="task-copy"><div className="task-title-line"><h3 className={overdue ? 'overdue' : ''}>{task.title}</h3>{overdue && <span className="overdue-badge">Em atraso</span>}</div>
      {task.due_date && <div className={`task-date ${overdue ? 'date-overdue' : ''}`}><CalendarDays size={13}/><span>{formatDate(task.due_date)}</span></div>}
    </div>
    <div className="task-actions"><button className="icon-button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)} disabled={busy}><Pencil size={16}/></button><button className="icon-button delete-button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)} disabled={busy}><Trash2 size={16}/></button></div>
  </article>;
}
