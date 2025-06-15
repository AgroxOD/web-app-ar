import { login, setAuth } from './utils/auth.js';

$('#login-form').on('submit', async (e) => {
  e.preventDefault();
  $('#login-error').hide();
  const email = $('#login-email').val();
  const password = $('#login-password').val();
  if (!email || !password) {
    $('#login-error').text('Please fill all fields').show();
    return;
  }
  try {
    const { jwt, role } = await login(email, password);
    setAuth(jwt, role);
    window.location.href = 'catalog.html';
  } catch (err) {
    $('#login-error').text(err.message).show();
  }
});
