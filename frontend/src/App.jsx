import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, CircleHelp, ListTodo, Plus, Search, Sparkles, Heart, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { api } from './services/api';
import TaskModal from './components/TaskModal';
import TaskItem from './components/TaskItem';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalTask, setModalTask] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadTasks = useCallback(async ({ quiet = false } = {}) => {
    const id = ++requestId.current;
    if (!quiet) setLoading(true);
    setError('');
    try {
      const data = await api.list({ search, status: filter });
      if (id !== requestId.current) return;
      const incoming = Array.isArray(data) ? data : (data.tasks || []);
      // Keep the API's deadline ordering consistent, including for backends that do not sort.
      incoming.sort((a, b) => {
        const ad = a.due_date ? String(a.due_date).slice(0, 10) : null;
        const bd = b.due_date ? String(b.due_date).slice(0, 10) : null;
        if (ad && bd) return ad.localeCompare(bd) || Number(b.id) - Number(a.id);
        if (ad) return -1;
        if (bd) return 1;
        return Number(b.id) - Number(a.id);
      });
      setTasks(incoming);
      setTotal(Number(data.total ?? incoming.length));
      setCompleted(Number(data.completed ?? incoming.filter((t) => t.completed).length));
    } catch (err) {
      if (id === requestId.current) setError(err.message || 'Could not load tasks.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const setBusy = (id, value) => setBusyIds((prev) => value ? [...new Set([...prev, id])] : prev.filter((x) => x !== id));

  async function saveTask(values) {
    setSaving(true);
    try {
      if (modalTask) await api.update(modalTask.id, values);
      else await api.create(values);
      setModalTask(undefined);
      await loadTasks();
    } finally { setSaving(false); }
  }

  async function toggleTask(task) {
    setBusy(task.id, true);
    const previous = tasks;
    setTasks((items) => items.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item));
    setCompleted((count) => Math.max(0, count + (task.completed ? -1 : 1)));
    try { await api.update(task.id, { completed: !task.completed }); await loadTasks({ quiet: true }); }
    catch (err) { setTasks(previous); setError(err.message || 'Could not update task.'); await loadTasks({ quiet: true }); }
    finally { setBusy(task.id, false); }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    setBusy(task.id, true);
    try { await api.remove(task.id); await loadTasks({ quiet: true }); }
    catch (err) { setError(err.message || 'Could not delete task.'); }
    finally { setBusy(task.id, false); }
  }

  const pendingCount = Math.max(0, total - completed);
  return <div className="app-shell">
    <div className="top-wash" aria-hidden="true" />
    <header className="page-header">
      <div className="brand-mark" aria-hidden="true"><span className="brand-spark">✳</span><ListTodo size={30} strokeWidth={1.8}/></div>
      <div className="header-copy"><p className="kicker">A LITTLE MORE FOCUS</p><h1>Student Dashboard</h1><p className="subtitle">Keep track of the little things that move you forward.</p></div>
    </header>

    <main className="dashboard">
      <section className="quick-access" aria-label="Quick access"><div className="quick-icon"><Sparkles size={15}/></div><span className="crumb-chevron">›</span><span>Quick Access</span><span className="quick-note">Your day, in one place</span></section>

      <section className="section-block" aria-labelledby="tasks-heading">
        <div className="section-titlebar"><h2 id="tasks-heading"><Heart size={17} strokeWidth={2.4}/> Tasks</h2><span className="section-caption">MAKE SPACE FOR WHAT MATTERS</span></div>
        <div className="section-toolbar">
          <div className="toolbar-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}><BookOpen size={14}/> All tasks</button><button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}><CircleHelp size={14}/> Pending</button><button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}><CheckCircle2 size={14}/> Completed</button></div>
          <div className="search-wrap"><Search size={15}/><input aria-label="Search tasks" placeholder="Search tasks…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}/>{searchInput && <button className="clear-search" onClick={() => setSearchInput('')} aria-label="Clear search">×</button>}</div>
        </div>

        <div className="stats-row"><div className="stat-card"><span className="stat-icon pink"><ListTodo size={17}/></span><div><span className="stat-label">Total tasks</span><strong>{total}</strong></div></div><div className="stat-card"><span className="stat-icon green"><CheckCircle2 size={17}/></span><div><span className="stat-label">Completed</span><strong>{completed}</strong></div></div><div className="stat-card"><span className="stat-icon lilac"><SlidersHorizontal size={17}/></span><div><span className="stat-label">Still to do</span><strong>{pendingCount}</strong></div></div></div>

        {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => loadTasks()}><RefreshCw size={14}/> Try again</button></div>}
        <div className="task-list" aria-live="polite">
          {loading ? <div className="loading-state"><span className="spinner"/><span>Loading your tasks…</span></div> : tasks.length ? tasks.map((task) => <TaskItem key={task.id} task={task} busy={busyIds.includes(task.id)} onToggle={toggleTask} onEdit={setModalTask} onDelete={deleteTask}/>) : <div className="empty-state"><div className="empty-art"><ListTodo size={28}/><span>✦</span></div><h3>{search ? 'No tasks found' : filter === 'completed' ? 'No completed tasks yet.' : 'You have no pending tasks.'}</h3><p>{search ? 'Try a different search term.' : filter === 'completed' ? 'Completed tasks will show up here.' : 'A fresh start. Add a task whenever you’re ready.'}</p>{!search && filter !== 'completed' && <button className="button primary small" onClick={() => setModalTask(null)}><Plus size={15}/> Create your first task</button>}</div>}
        </div>
      </section>
      <footer className="page-footer"><span>One thing at a time <span className="footer-heart">♥</span></span><span>Small steps count.</span></footer>
    </main>
    <button className="floating-add" onClick={() => setModalTask(null)} aria-label="Create task"><Plus size={25} strokeWidth={2.4}/></button>
    {modalTask !== undefined && <TaskModal task={modalTask || null} onClose={() => { if (!saving) setModalTask(undefined); }} onSave={saveTask} saving={saving}/>}
  </div>;
}
