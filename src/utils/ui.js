export function showInstructions(temp = false) {
  const el = document.getElementById('instructions');
  if (!el) return;
  el.style.display = 'block';
  if (temp) setTimeout(() => {
    el.style.display = 'none';
  }, 5000);
}

export function hideInstructions() {
  const el = document.getElementById('instructions');
  if (el) el.style.display = 'none';
}

export function showControls() {
  const el = document.getElementById('model-controls');
  if (el) el.style.display = 'block';
  showInstructions(true);
}

export function hideControls() {
  const el = document.getElementById('model-controls');
  if (el) el.style.display = 'none';
  hideInstructions();
}
