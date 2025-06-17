// Отправка минимальной аналитики на VITE_ANALYTICS_ENDPOINT
export function logEvent(event, data = {}) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data, timestamp: Date.now() }),
  }).catch((err) => console.error('Analytics error', err));
}
