import { updateModel } from './models.js';

export function showEditForm(li, id, m, btn) {
  const form = document.createElement('form');
  form.className = 'inline-form';

  const nameInput = document.createElement('input');
  nameInput.className = 'text-input';
  nameInput.name = 'name';
  nameInput.required = true;
  nameInput.value = m.name;

  const markerInput = document.createElement('input');
  markerInput.className = 'text-input';
  markerInput.name = 'markerIndex';
  markerInput.type = 'number';
  markerInput.required = true;
  markerInput.value = m.markerIndex;

  const saveBtn = document.createElement('button');
  saveBtn.className = 'button button-primary';
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Save';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'button';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';

  form.append(nameInput, markerInput, saveBtn, cancelBtn);

  cancelBtn.addEventListener('click', () => {
    form.remove();
    btn.disabled = false;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await updateModel(id, {
        name: form.name.value,
        markerIndex: parseInt(form.markerIndex.value, 10) || 0,
      });
      if (window.showMessage) window.showMessage('Model updated');
      if (window.refreshModels) await window.refreshModels();
    } catch {
      if (window.showMessage) window.showMessage('Update failed', true);
    }
  });
  btn.disabled = true;
  li.appendChild(form);
  return form;
}
