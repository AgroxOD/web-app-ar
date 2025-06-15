import { register, setAuth } from './utils/auth.js';

$('#register-form').on('submit', async (e) => {
  e.preventDefault();
  $('#register-error').hide();
  const username = $('#register-username').val();
  const email = $('#register-email').val();
  const password = $('#register-password').val();
  if (!username || !email || !password) {
    $('#register-error').text('Please fill all fields').show();
    return;
  }
  try {
    const { jwt, role } = await register(username, email, password);
    setAuth(jwt, role);
    window.location.href = 'catalog.html';
  } catch (err) {
    $('#register-error').text(err.message).show();
  }
});
