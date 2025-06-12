/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

function showEditForm(li, id, m, btn) {
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
  btn.disabled = true;
  li.appendChild(form);
  return form;
}

describe('showEditForm', () => {
  it('renders model name safely', () => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    const malicious = { name: '<img src=x onerror=alert(1)>', markerIndex: 0 };
    showEditForm(li, 'id', malicious, btn);
    const input = li.querySelector('input[name="name"]');
    expect(input.value).toBe(malicious.name);
    expect(li.innerHTML).not.toContain('<img');
  });
});
