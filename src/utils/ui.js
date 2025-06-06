export function showControls() {
  const el = document.getElementById('model-controls');
  if (el) el.style.display = 'block';
}

export function hideControls() {
  const el = document.getElementById('model-controls');
  if (el) el.style.display = 'none';
}
