// Counts one visit. No cookies, nothing personal is kept: the server counts the browser's random
// ID through a counter that cannot be read back, mixed with a secret that changes every day.
// Setting nearhi_ignore in localStorage (a button on the admin page does this) leaves your own
// visits out of the numbers.
(function () {
  try {
    if (localStorage.getItem('nearhi_ignore')) return;
    var id = localStorage.getItem('nearhi_client_id');
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);
      localStorage.setItem('nearhi_client_id', id);
    }
    var body = JSON.stringify({
      path: location.pathname,
      ref: new URLSearchParams(location.search).get('ref') || '',
      from: document.referrer || '',
      id: id,
    });
    if (navigator.sendBeacon) navigator.sendBeacon('/hit', body);
    else fetch('/hit', { method: 'POST', body: body, keepalive: true });
  } catch (e) { /* counting must never get in the way of the page */ }
})();