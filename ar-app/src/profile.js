import { getToken } from './utils/auth.js';

async function fetchProfile() {
  const token = getToken();
  if (!token) return;
  const res = await fetch('../api/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const data = await res.json();
  $('#profile-username').val(data.username || '');
  $('#profile-email').val(data.email || '');
}

$('#profile-form').on('submit', async (e) => {
  e.preventDefault();
  $('#profile-error').hide();
  $('#profile-success').hide();
  const token = getToken();
  if (!token) return;
  const username = $('#profile-username').val();
  const email = $('#profile-email').val();
  try {
    const res = await fetch('../api/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    $('#profile-success').text('Saved').show();
  } catch (err) {
    $('#profile-error').text(err.message).show();
  }
});

fetchProfile();
