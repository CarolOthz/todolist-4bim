const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Could not connect to the server. Check that the API is running.');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { message = (await response.json()).message || message; } catch { /* no response body */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  list: ({ search = '', status = 'all' } = {}) => request(`/api/tasks?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
  create: (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, changes) => request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  remove: (id) => request(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
