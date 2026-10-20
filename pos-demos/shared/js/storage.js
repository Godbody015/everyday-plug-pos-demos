/* All saving goes through here. For a paying client, swap this file to call a real backend. */
const Store = {
  get(key, fallback) { try { const v = localStorage.getItem('pos:' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
  set(key, value) { try { localStorage.setItem('pos:' + key, JSON.stringify(value)); } catch (e) {} }
};
