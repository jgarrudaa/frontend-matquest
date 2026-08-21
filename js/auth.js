document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#auth-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  const submit = form.querySelector('button[type="submit"]');
  const loader = submit.querySelector('.button-loader');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    message.className = 'form-message'; message.textContent = '';
    if (!form.checkValidity()) { form.reportValidity(); return; }
    submit.disabled = true; loader.hidden = false;
    try {
      const email = form.email.value.trim(); const password = form.password.value;
      const data = form.dataset.mode === 'signup'
        ? await window.Api.signup(form.name.value.trim(), email, password)
        : await window.Api.login(email, password);
      const token = data.access_token || data.session?.access_token;
      if (!token) {
        message.className = 'form-message success';
        message.textContent = 'Cadastro criado. Confira seu e-mail para confirmar a conta.';
        return;
      }
      window.Api.token = token;
      const name = data.user?.user_metadata?.display_name;
      if (name) localStorage.setItem('triquest_name', name);
      location.href = 'inicio.html';
    } catch (error) {
      const translations = { 'Invalid login credentials': 'E-mail ou senha incorretos.', 'User already registered': 'Este e-mail já possui uma conta.' };
      message.textContent = translations[error.message] || error.message;
    } finally { submit.disabled = false; loader.hidden = true; }
  });
});
