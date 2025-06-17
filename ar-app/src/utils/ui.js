// UI helpers: отображение инструкций и контролов модели
const toggle = (id, on) => {
  const el = document.getElementById(id);
  if (el) el.style.display = on ? 'block' : 'none';
};

export const showInstructions = (temp = false) => {
  toggle('instructions', true);
  if (temp) setTimeout(() => toggle('instructions', false), 5000);
};
export const hideInstructions = () => toggle('instructions', false);

export const showControls = () => {
  toggle('model-controls', true);
  showInstructions(true);
};

export const hideControls = () => {
  toggle('model-controls', false);
  hideInstructions();
};
