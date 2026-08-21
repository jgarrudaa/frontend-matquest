const API_BASE_URL = 'https://backend-matquest.vercel.app';

const Api = {
  tokenKey: 'triquest_access_token',
  get token() { return localStorage.getItem(this.tokenKey); },
  set token(value) {
    if (value) localStorage.setItem(this.tokenKey, value);
    else localStorage.removeItem(this.tokenKey);
  },
  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Não foi possível concluir a solicitação.');
    return payload;
  },
  signup(name, email, password) {
    return this.request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  },
  login(email, password) {
    return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  me() { return this.request('/api/auth/me'); },
  dashboard() { return this.request('/api/dashboard'); },
  questions(topic = null) {
    return this.request(`/api/questions${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`);
  },
  saveAttempt(attempt) {
    return this.request('/api/attempts', { method: 'POST', body: JSON.stringify(attempt) });
  },
  logout() { this.token = null; },
};

window.Api = Api;
