/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { showEditForm } from '../ar-app/src/utils/editForm.js';

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
