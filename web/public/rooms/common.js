/* Shared helpers for the rooms pages. */
window.NH = (function () {
  async function api(method, path, body) {
    const opts = { method, credentials: 'same-origin', headers: { 'X-NH': '1' } };
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    const res = await fetch(path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      let d = data && data.detail;
      const err = new Error(typeof d === 'string' ? d : (d && d.message) || 'Something went wrong');
      err.status = res.status; err.data = d;
      throw err;
    }
    return data;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  async function me() {
    try { return (await api('GET', '/auth/me')).account; } catch (e) { return null; }
  }
  function themeToggle(btn) {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('nh-theme', next); } catch (e) {}
    });
  }
  return { api, esc, me, themeToggle };
})();